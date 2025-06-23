// Semantic matching utilities for JurisGen
// Uses Google Gemini embeddings for advanced content matching

export interface SemanticChunk {
  text: string;
  embedding?: number[];
  score: number;
  startIndex: number;
  endIndex: number;
  reasoning?: string;
  legalRelevance?: number;
}

export interface SemanticMatchResult {
  chunks: SemanticChunk[];
  totalChunks: number;
  averageScore: number;
  bestMatch: SemanticChunk | null;
  processingTime: number;
}

export interface LegalContext {
  domain: string;
  legislation: string;
  keywords: string[];
  userQuery: string;
  confidence: number;
}

// Cosine similarity calculation
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// Get embedding from our API
export async function getEmbedding(
  text: string,
  task:
    | "RETRIEVAL_QUERY"
    | "RETRIEVAL_DOCUMENT"
    | "SEMANTIC_SIMILARITY" = "SEMANTIC_SIMILARITY"
): Promise<number[]> {
  try {
    // Use absolute URL for server-side requests
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/embedding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, task }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.embedding;
  } catch (error) {
    console.error("Failed to get embedding:", error);
    throw error;
  }
}

// Split content into semantic chunks
export function splitIntoSemanticChunks(
  content: string,
  maxChunkSize: number = 500,
  overlap: number = 50
): Array<{ text: string; startIndex: number; endIndex: number }> {
  const chunks: Array<{ text: string; startIndex: number; endIndex: number }> =
    [];

  // First, try to split by legal structure (madde, fıkra, etc.)
  const legalSections = content.split(
    /(?=\n\s*(?:Madde|MADDE|Fıkra|FIKRA|Bent|BENT)\s+\d+)/
  );

  for (const section of legalSections) {
    if (section.trim().length === 0) continue;

    if (section.length <= maxChunkSize) {
      // Section fits in one chunk
      const startIndex = content.indexOf(section);
      chunks.push({
        text: section.trim(),
        startIndex,
        endIndex: startIndex + section.length,
      });
    } else {
      // Split large sections into smaller chunks
      const subChunks = splitLargeSection(section, maxChunkSize, overlap);
      const sectionStart = content.indexOf(section);

      subChunks.forEach((chunk) => {
        const chunkStart = sectionStart + section.indexOf(chunk.text);
        chunks.push({
          text: chunk.text,
          startIndex: chunkStart,
          endIndex: chunkStart + chunk.text.length,
        });
      });
    }
  }

  return chunks.filter((chunk) => chunk.text.trim().length > 20); // Filter out very small chunks
}

// Split large sections with overlap
function splitLargeSection(
  text: string,
  maxSize: number,
  overlap: number
): Array<{ text: string }> {
  const chunks: Array<{ text: string }> = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  let currentChunk = "";
  let currentSize = 0;

  for (const sentence of sentences) {
    const sentenceWithPunct = sentence.trim() + ".";

    if (
      currentSize + sentenceWithPunct.length > maxSize &&
      currentChunk.length > 0
    ) {
      chunks.push({ text: currentChunk.trim() });

      // Start new chunk with overlap
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.min(overlap, words.length));
      currentChunk = overlapWords.join(" ") + " " + sentenceWithPunct;
      currentSize = currentChunk.length;
    } else {
      currentChunk += " " + sentenceWithPunct;
      currentSize += sentenceWithPunct.length;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ text: currentChunk.trim() });
  }

  return chunks;
}

// Calculate legal domain relevance bonus
export function calculateLegalDomainRelevance(
  text: string,
  legalDomain: string,
  keywords: string[]
): number {
  const lowerText = text.toLowerCase();
  const lowerDomain = legalDomain.toLowerCase();

  let relevanceScore = 0;

  // Domain-specific terms
  const domainTerms: Record<string, string[]> = {
    "ceza hukuku": [
      "suç",
      "ceza",
      "hapis",
      "para cezası",
      "tck",
      "türk ceza kanunu",
    ],
    "medeni hukuk": [
      "evlilik",
      "boşanma",
      "miras",
      "tmk",
      "türk medeni kanunu",
    ],
    "iş hukuku": ["işçi", "işveren", "iş sözleşmesi", "kıdem", "ihbar"],
    "ticaret hukuku": ["şirket", "ticaret", "ttk", "türk ticaret kanunu"],
    "idare hukuku": ["idare", "kamu", "belediye", "valilik"],
  };

  // Check domain-specific terms
  const relevantTerms = domainTerms[lowerDomain] || [];
  relevantTerms.forEach((term) => {
    if (lowerText.includes(term)) {
      relevanceScore += 0.1;
    }
  });

  // Check keywords
  keywords.forEach((keyword) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      relevanceScore += 0.15;
    }
  });

  // Legal structure bonus
  if (lowerText.match(/madde\s+\d+|fıkra\s+\d+|bent\s+[a-z]/)) {
    relevanceScore += 0.05;
  }

  return Math.min(relevanceScore, 0.5); // Cap at 0.5
}

// Main semantic matching function
export async function semanticContentMatching(
  userQuery: string,
  mevzuatContent: string,
  legalContext: LegalContext,
  maxChunks: number = 5
): Promise<SemanticMatchResult> {
  const startTime = Date.now();

  try {
    // 1. Split content into semantic chunks
    const contentChunks = splitIntoSemanticChunks(mevzuatContent);

    if (contentChunks.length === 0) {
      return {
        chunks: [],
        totalChunks: 0,
        averageScore: 0,
        bestMatch: null,
        processingTime: Date.now() - startTime,
      };
    }

    // 2. Get query embedding
    const queryEmbedding = await getEmbedding(userQuery, "RETRIEVAL_QUERY");

    // 3. Process chunks in parallel (with rate limiting)
    const batchSize = 3; // Process 3 chunks at a time to avoid rate limits
    const scoredChunks: SemanticChunk[] = [];

    for (let i = 0; i < contentChunks.length; i += batchSize) {
      const batch = contentChunks.slice(i, i + batchSize);

      const batchPromises = batch.map(async (chunk) => {
        try {
          // Get chunk embedding
          const chunkEmbedding = await getEmbedding(
            chunk.text,
            "RETRIEVAL_DOCUMENT"
          );

          // Calculate semantic similarity
          const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

          // Calculate legal relevance bonus
          const legalBonus = calculateLegalDomainRelevance(
            chunk.text,
            legalContext.domain,
            legalContext.keywords
          );

          // Final score
          const finalScore = similarity + legalBonus;

          return {
            text: chunk.text,
            embedding: chunkEmbedding,
            score: finalScore,
            startIndex: chunk.startIndex,
            endIndex: chunk.endIndex,
            reasoning: `Semantic: ${similarity.toFixed(
              3
            )}, Legal: ${legalBonus.toFixed(3)}`,
            legalRelevance: legalBonus,
          };
        } catch (error) {
          console.error("Error processing chunk:", error);
          return {
            text: chunk.text,
            score: 0,
            startIndex: chunk.startIndex,
            endIndex: chunk.endIndex,
            reasoning: "Error in processing",
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      scoredChunks.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < contentChunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // 4. Sort and select top chunks
    const topChunks = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxChunks)
      .filter((chunk) => chunk.score > 0.1); // Filter out very low scores

    // 5. Calculate metrics
    const averageScore =
      topChunks.length > 0
        ? topChunks.reduce((sum, chunk) => sum + chunk.score, 0) /
          topChunks.length
        : 0;

    const bestMatch = topChunks.length > 0 ? topChunks[0] : null;

    return {
      chunks: topChunks,
      totalChunks: contentChunks.length,
      averageScore,
      bestMatch,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Semantic matching error:", error);
    return {
      chunks: [],
      totalChunks: 0,
      averageScore: 0,
      bestMatch: null,
      processingTime: Date.now() - startTime,
    };
  }
}

// Generate human-readable reasoning for why content was selected
export function generateRelevanceReasoning(
  chunkText: string,
  userQuery: string,
  score: number
): string {
  const reasons: string[] = [];

  if (score > 0.8) {
    reasons.push("Çok yüksek semantic benzerlik");
  } else if (score > 0.6) {
    reasons.push("Yüksek semantic benzerlik");
  } else if (score > 0.4) {
    reasons.push("Orta düzey semantic benzerlik");
  }

  // Check for direct keyword matches
  const queryWords = userQuery
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);
  const matchingWords = queryWords.filter((word) =>
    chunkText.toLowerCase().includes(word)
  );

  if (matchingWords.length > 0) {
    reasons.push(`Anahtar kelime eşleşmesi: ${matchingWords.join(", ")}`);
  }

  // Check for legal structure
  if (chunkText.match(/madde\s+\d+/i)) {
    reasons.push("Madde referansı içeriyor");
  }

  return reasons.length > 0 ? reasons.join("; ") : "Genel içerik uyumu";
}
