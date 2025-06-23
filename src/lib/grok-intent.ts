// import OpenAI from "openai"; // REMOVED: Not used in current hybrid approach
import { HfInference } from "@huggingface/inference";

// Initialize HuggingFace client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Turkish text preprocessing utilities
class TurkishTextProcessor {
  private static readonly TURKISH_CHAR_MAP: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "C",
    Ğ: "G",
    I: "I",
    Ö: "O",
    Ş: "S",
    Ü: "U",
  };

  static normalize(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
  }

  static normalizeForEmbedding(text: string): string {
    // Keep Turkish characters for embedding models (they understand Turkish better)
    return this.normalize(text);
  }

  static extractMeaningfulTerms(text: string): string[] {
    const stopWords = new Set([
      "bir",
      "bu",
      "şu",
      "ve",
      "ile",
      "için",
      "gibi",
      "kadar",
      "daha",
      "çok",
      "az",
      "olan",
      "olur",
      "nasıl",
      "nedir",
      "ne",
      "hangi",
    ]);

    return (
      text
        .toLowerCase()
        .match(/[a-züçğıöşâî]+/g)
        ?.filter((word) => word.length > 2 && !stopWords.has(word)) || []
    );
  }
}

// Grok AI client
// REMOVED: Grok import - unused in current hybrid approach
// const grok = new OpenAI({
//   apiKey: process.env.GROK_API_KEY,
//   baseURL: "https://api.x.ai/v1",
// });

// Types
export interface LegalIntentResult {
  needsLegalResearch: boolean;
  legalDomain: string;
  mainLegislation: string;
  searchType: "title" | "fulltext" | "mixed";
  searchTerm: string;
  fallbackSearchTerm?: string;
  confidence: number;
  keywords: string[];
}

// REMOVED: Unused interfaces - BasicAnalysis, TermExpansion, ValidationResult

// Turkish Legal Domain Detection - Hybrid Approach
// Combines semantic embeddings + LLM validation for scalable intent detection

interface SemanticDomain {
  name: string;
  description: string;
  examples: string[];
  embedding?: number[]; // Pre-computed embeddings
}

// Reduced, high-level domain definitions
const SEMANTIC_LEGAL_DOMAINS: SemanticDomain[] = [
  {
    name: "Medeni Hukuk",
    description:
      "Aile hukuku, kişilik hakları ve medeni kanun ile ilgili konular",
    examples: [
      "boşanma",
      "evlilik",
      "miras",
      "tapu",
      "velayet",
      "vesayet",
      "nafaka",
      "mal rejimi",
      "aile birliği",
      "kişilik hakları",
      "miras paylaşımı",
      "düğün",
      "aile hukuku",
      "çocuk hakları",
      "soyadı değişikliği",
      "çocuğun soyadı",
      "çocuğun soyadını değiştirme",
      "soyadı değiştirme işlemleri",
      "boşanma sonrası",
      "boşanma sonrası konut",
      "evlilik birliği",
      "evlilik birliğinin hukuki",
      "miras hukuku",
      "miras hukukunda saklı",
      "saklı pay",
      // Strong medeni hukuk indicators
      "boşanma",
      "miras",
      "evlilik",
      "aile",
      "çocuk",
      "soyadı",
    ],
  },
  {
    name: "İş Hukuku",
    description:
      "İşçi-işveren ilişkileri, çalışma hayatı, iş sözleşmeleri, işyeri haklarıyla ilgili konular. Kıdem tazminatı, ihbar tazminatı, işten çıkarma, çalışma koşulları, sendika hakları, iş kazaları, fazla mesai, izin hakları, işsizlik maaşı gibi konuları kapsar.",
    examples: [
      "kıdem tazminatı",
      "işten çıkarma",
      "çalışma saatleri",
      "iş sözleşmesi",
      "ihbar tazminatı",
      "fazla mesai",
      "işsizlik maaşı",
      "sendika hakları",
      "iş kazası",
      "işçi hakları",
      "çalışma koşulları",
      "işyeri güvenliği",
      "emekli maaşı",
      "yıllık izin",
      "yıllık izin hakları",
      "çalışanların yıllık izin",
      "izin hakları",
      "izin günü",
      "mazeret izni",
      "doğum izni",
      "çalışanların hakları",
      "çalışan hakları",
      "işçi sağlığı",
      "iş güvenliği",
      "iş güvenliği mevzuatı",
      "sendika kurma",
      "sendika kurma sürecinde",
      "işveren yükümlülükleri",
      "iş yerinde sigorta",
      "işçi sigorta",
      "çalışma hayatı",
      "çalışma şartları",
      "işyeri koşulları",
      // Strong iş hukuku indicators
      "çalışanların",
      "işçi",
      "işveren",
      "çalışma",
      "sendika",
      // EXCLUDE sigorta terms explicitly
      "NOT_KASKO",
      "NOT_SİGORTA_POLİÇESİ",
    ],
  },
  {
    name: "Ceza Hukuku",
    description:
      "Kişisel suçlar ve cezalar - SADECE gerçek suçlar (hırsızlık, dolandırıcılık vb). İdari cezalar ve disiplin cezaları DEĞIL.",
    examples: [
      "hırsızlık",
      "dolandırıcılık",
      "yaralama",
      "tehdit",
      "suç",
      "ceza",
      "hapis",
      "para cezası",
      "dava",
      "savcılık",
      "suç duyurusu",
      "ceza indirimi",
      // Strong ceza indicators
      "hırsızlık suçu",
      "dolandırıcılık dava",
      "suç duyuru",
      // EXCLUDE administrative terms
      "NOT_İDARİ",
      "NOT_DİSİPLİN",
      "NOT_KAMU_PERSONELİ",
    ],
  },
  {
    name: "Ticaret Hukuku",
    description: "Ticari faaliyetler, şirketler",
    examples: [
      "şirket kuruluşu",
      "ticari sözleşme",
      "konkordato",
      "iflas",
      "şirket",
      "ticaret",
      "ortaklık",
      "anonim şirket",
      "limited şirket",
      "işletme",
      "ticari",
    ],
  },
  {
    name: "Vergi Hukuku",
    description: "Vergi mükellefiyeti ve vergi uyuşmazlıkları",
    examples: ["gelir vergisi", "kdv", "vergi cezası", "vergi iadesi"],
  },
  {
    name: "Turizm Hukuku",
    description:
      "Turizm teşvikleri, otel işletmeciliği, tatil evi kiralama ve turizm sektörü yasal düzenlemeleri. Otel işletme BELGESİ, turizm tesis belgesi Turizm Hukuku'dur.",
    examples: [
      "turizm teşvik",
      "otel işletme",
      "otel işletme belgesi",
      "otel işletme belgesini",
      "otel işletme belgesini nasıl",
      "otel belgesi",
      "turizm belgesi",
      "turizm tesis belgesi",
      "tatil evi kiralama",
      "kısa süreli kiralama",
      "airbnb",
      "konaklama işletmesi",
      "otel açmak",
      "pansiyon işletme",
      "tur operatörü",
      "seyahat acentesi",
      "turizm teşvik kanunu",
      "turizm teşvik kanunu avantajları",
      "konaklama",
      "turistik tesis",
      // Strong tourism indicators
      "airbnb için",
      "kısa süreli",
      "tatil evi",
      "otel belgesi",
      "otel işletme belge",
      "turizm",
      "otel",
    ],
  },
  {
    name: "İdare Hukuku",
    description:
      "Kamu yönetimi, memur hukuku, belediye işlemleri ve idari süreçler. Kamu personeli disiplin cezaları, idari işlemler, belediye izinleri dahil.",
    examples: [
      "memur hukuku",
      "ihale",
      "ruhsat",
      "belediye",
      "izin",
      "işletme izni",
      "ticaret izni",
      "açmak için izin",
      "dükkan açmak",
      "işyeri açmak",
      "yetki belgesi",
      "kamu personeli",
      "kamu personeli disiplin",
      "disiplin cezası",
      "disiplin cezaları",
      "disiplin soruşturması",
      "idari işlem",
      "idari işlem iptal",
      "idari işlem iptal davası",
      "iptal davası",
      "belediye izni",
      "belediye izin",
      "belediye ruhsatı",
      "mahalli idare",
      "mahalli idare seçim",
      "seçim süreçleri",
      "kamu görevlisi",
      "memur hakları",
      "otel inşaatı için",
      "inşaat için belediye",
      "belediye izni",
      // Strong admin indicators
      "belediyeden",
      "ruhsat almak",
      "kamu personeli",
      "kamu görevlisi",
      "memur",
      "idari",
      "belediye",
      "disiplin",
      "idari işlem",
    ],
  },
  {
    name: "Sigorta Hukuku",
    description:
      "Sigorta poliçeleri, hasar tazminatları, sigorta şirket yükümlülükleri ve sigorta sözleşmeleri. Sigorta şirketi hakları ve yükümlülükleri de Sigorta Hukuku'dur.",
    examples: [
      "kasko sigortası",
      "kasko hasar",
      "sağlık sigortası",
      "hayat sigortası",
      "konut sigortası",
      "hasar tazminatı",
      "sigorta poliçesi",
      "prim ödemesi",
      "sigorta şirketi",
      "sigorta şirketi yükümlülükleri",
      "sigorta şirketi yükümlülükleri nelerdir",
      "sigorta şirketi hakları",
      "trafik sigortası",
      "emeklilik sigortası",
      "sigorta kapsam",
      "sigorta kapsam alanları",
      "sağlık sigortası kapsam",
      "sigorta primi",
      "poliçe şartları",
      // Strong sigorta indicators
      "kasko",
      "poliçe",
      "sigorta tazminat",
      "sigorta şirketi",
      "sigorta hasar",
      "sigorta kapsam",
    ],
  },
  {
    name: "İcra ve İflas Hukuku",
    description: "Alacak takibi ve iflas işlemleri",
    examples: ["icra takibi", "haciz", "iflas", "konkordato"],
  },
  {
    name: "Konut Hukuku",
    description:
      "Konut edinme, kiralama, ev sahibi-kiracı ilişkileri, gayrimenkul alım satımı ve konut ile ilgili yasal süreçler. Tapu işlemleri ve tapu belgeleri de Konut Hukuku'dur.",
    examples: [
      "konut edinme",
      "ev kiralama",
      "kiracı hakları",
      "ev sahibi hakları",
      "kira artışı",
      "tahliye",
      "depozito",
      "gayrimenkul alım satım",
      "gayrimenkul alım satım sözleşmesi",
      "tapu devri",
      "tapu işlemleri",
      "tapu işlemlerinde gerekli",
      "tapu işlemlerinde gerekli belgeler",
      "tapu belgeleri",
      "konut kredisi",
      "emlak komisyonu",
      "kiralama sözleşmesi",
      "ev sahibi kiracı",
      "kiracıyı çıkarabilir",
      // Strong housing indicators
      "tapu",
      "tapu işlem",
      "gayrimenkul",
      "konut",
      "ev sahibi",
      "kiracı",
    ],
  },
  {
    name: "Genel Hukuk",
    description:
      "Genel hukuki danışmanlık, kanun araştırması ve spesifik olmayan hukuki konular",
    examples: [
      "hukuki danışmanlık",
      "avukat bul",
      "hangi kanun",
      "hukuki yardım",
      "mahkeme süreci",
      "dava açma",
      "yasal süreç",
      "hukuk bürosu",
    ],
  },
  {
    name: "Gayrimenkul Hukuku",
    description: "Taşınmaz mallar, imar planlaması ve inşaat hukuku",
    examples: [
      "kat mülkiyeti",
      "inşaat sözleşmesi",
      "imar",
      "kamulaştırma",
      "yapı ruhsatı",
      "imar planı",
    ],
  },
];

interface IntentAnalysis {
  domain: string;
  confidence: number;
  keywords: string[];
  searchTerms: string[];
  method: "semantic" | "llm" | "hybrid";
  reasoning?: string;
}

// Turkish Legal Terminology Dictionary with proper TypeScript types
// REMOVED: LegalTermsType interface - unused after cleanup

// REMOVED: TURKISH_LEGAL_TERMS - unused after function cleanup

// Stop words for Turkish text processing
const STOP_WORDS = [
  "bir",
  "bu",
  "şu",
  "ve",
  "ile",
  "için",
  "gibi",
  "kadar",
  "daha",
  "çok",
  "az",
  "olan",
  "olur",
  "nasıl",
  "nedir",
  "ne",
  "hangi",
  "ancak",
];

// REMOVED: robustJsonParser and related code - unused in current hybrid approach

// REMOVED: validateSchema - unused function

// REMOVED: generateFallbackResult - unused function

// REMOVED: extractSearchTermFromResponse - unused function

// REMOVED: extractKeywordsFromResponse - unused function

// REMOVED: Dead code cleanup - analyzeBasicLegalDomain, analyzeBasicWithKeywords

// REMOVED: Dead code cleanup - expandSearchTerms, generateFallbackTermExpansion, validateIntentResult

// REMOVED: Dead code cleanup - assembleIntentResult

// Main Function: Multi-Step Intent Detection
export async function detectLegalIntentHybrid(
  message: string
): Promise<IntentAnalysis> {
  try {
    // Step 1: Quick semantic classification
    const semanticResult = await classifyWithSemantic(message);

    // Step 2: If confidence is low, use LLM validation
    if (semanticResult.confidence < 0.7) {
      const llmResult = await classifyWithLLM(message);
      return combineResults(semanticResult, llmResult, message);
    }

    // Step 3: Extract dynamic keywords
    const keywords = extractKeywords(message);
    const searchTerms = generateSearchTerms(message, keywords);

    return {
      domain: semanticResult.domain,
      confidence: semanticResult.confidence,
      keywords,
      searchTerms,
      method: "semantic",
    };
  } catch (error) {
    console.error("🚨 Hybrid detection failed:", error);
    return generateFallbackIntent(message);
  }
}

/**
 * NEW: Keyword-First Classification with Semantic Backup
 */
async function classifyWithSemantic(
  message: string
): Promise<{ domain: string; confidence: number }> {
  try {
    const normalizedMessage =
      TurkishTextProcessor.normalizeForEmbedding(message);

    // Method 1: FIRST try enhanced keyword matching (fast & reliable)
    const keywordResult = await classifyWithEnhancedKeywords(normalizedMessage);

    // If keyword matching is confident, use it (lowered threshold due to better matching)
    if (keywordResult.confidence > 0.4) {
      return keywordResult;
    }

    // Method 2: If keywords are uncertain, try semantic embedding
    const embeddingResult = await classifyWithEmbeddings(normalizedMessage);

    // Combine results intelligently
    if (keywordResult.confidence > 0.3 && embeddingResult.confidence > 0.3) {
      // Weighted combination: Keywords get more weight for legal terms
      const weightedConfidence =
        keywordResult.confidence * 0.7 + embeddingResult.confidence * 0.3;

      // If they agree, boost confidence
      if (keywordResult.domain === embeddingResult.domain) {
        return {
          domain: keywordResult.domain,
          confidence: Math.min(weightedConfidence * 1.2, 0.95),
        };
      }

      // If they disagree, trust the higher confidence method
      return keywordResult.confidence > embeddingResult.confidence
        ? keywordResult
        : embeddingResult;
    }

    // Return the better single result
    return keywordResult.confidence > embeddingResult.confidence
      ? keywordResult
      : embeddingResult;
  } catch (error) {
    console.error("🚨 Semantic classification failed:", error);
    // Fallback to simple keyword matching
    return await classifyWithEnhancedKeywords(message);
  }
}

/**
 * Embedding-based classification using HuggingFace
 */
async function classifyWithEmbeddings(
  message: string
): Promise<{ domain: string; confidence: number }> {
  try {
    // Get embedding for user message
    const messageEmbedding = await hf.featureExtraction({
      model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
      inputs: message,
    });

    // Calculate similarity with each domain
    const domainSimilarities = await Promise.all(
      SEMANTIC_LEGAL_DOMAINS.map(async (domain) => {
        // Create domain context text
        const domainText = `${domain.name}: ${
          domain.description
        }. Örnekler: ${domain.examples.join(", ")}`;

        const domainEmbedding = await hf.featureExtraction({
          model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
          inputs: domainText,
        });

        // Calculate cosine similarity
        const similarity = cosineSimilarity(
          messageEmbedding as number[],
          domainEmbedding as number[]
        );

        return {
          domain: domain.name,
          confidence: similarity,
          similarity,
        };
      })
    );

    // Sort by similarity
    domainSimilarities.sort((a, b) => b.similarity - a.similarity);

    const best = domainSimilarities[0];

    // Apply confidence thresholds
    let adjustedConfidence = best.confidence;
    if (adjustedConfidence > 0.8) adjustedConfidence = 0.95;
    else if (adjustedConfidence > 0.6) adjustedConfidence = 0.85;
    else if (adjustedConfidence > 0.4) adjustedConfidence = 0.7;
    else adjustedConfidence = 0.4;

    return {
      domain: best.domain,
      confidence: adjustedConfidence,
    };
  } catch (error) {
    console.error("🚨 Embedding classification failed:", error);
    throw error;
  }
}

/**
 * Enhanced keyword-based classification
 */
async function classifyWithEnhancedKeywords(
  message: string
): Promise<{ domain: string; confidence: number }> {
  const lowerMessage = message.toLowerCase();
  const meaningfulTerms = TurkishTextProcessor.extractMeaningfulTerms(message);

  console.log(`🔍 Enhanced keyword analysis for: "${message}"`);
  console.log(`📝 Meaningful terms: ${meaningfulTerms.join(", ")}`);

  const domainScores = SEMANTIC_LEGAL_DOMAINS.map((domain) => {
    let score = 0;
    const matches: string[] = [];

    // Check direct examples with higher precision
    domain.examples.forEach((example) => {
      const exampleLower = example.toLowerCase();

      // Skip negative indicators
      if (example.startsWith("NOT_")) {
        if (lowerMessage.includes(exampleLower.replace("not_", ""))) {
          score -= 1.0; // Penalty for negative matches
          matches.push(`NEGATIVE:${example}`);
        }
        return;
      }

      // SPRINT 1 FIX: Multi-word phrase matching FIRST (highest priority)
      if (exampleLower.includes(" ")) {
        const words = exampleLower.split(" ");
        const foundWords = words.filter(
          (word) => word.length > 2 && lowerMessage.includes(word)
        );

        if (foundWords.length >= words.length * 0.7) {
          // 70% of words found
          score += 2.5; // INCREASED from 1.5 to 2.5
          matches.push(
            `PHRASE:${example}(${foundWords.length}/${words.length})`
          );

          // BONUS: If all words found, extra boost
          if (foundWords.length === words.length) {
            score += 1.0;
            matches.push(`COMPLETE_PHRASE:${example}`);
          }
        }
      }

      // Exact match - high score but lower than complete phrase
      else if (lowerMessage.includes(exampleLower)) {
        score += 2.0;
        matches.push(`EXACT:${example}`);
      }

      // Single word matches with meaningful terms
      meaningfulTerms.forEach((term) => {
        if (
          term.length > 3 &&
          (exampleLower.includes(term) || term.includes(exampleLower))
        ) {
          score += 0.8;
          matches.push(`TERM:${term}~${example}`);
        }
      });
    });

    // SPRINT 1 FIX: Special handling for İş Hukuku
    if (domain.name === "İş Hukuku") {
      const isHukukuKeywords = [
        "işçi",
        "kıdem",
        "tazminat",
        "çalışan",
        "işveren",
        "iş",
      ];
      let isHukukuMatches = 0;

      isHukukuKeywords.forEach((keyword) => {
        if (lowerMessage.includes(keyword)) {
          isHukukuMatches++;
          score += 1.0; // Strong boost for İş Hukuku keywords
          matches.push(`IS_HUKUKU:${keyword}`);
        }
      });

      // Special boost for "kıdem tazminatı" combination
      if (lowerMessage.includes("kıdem") && lowerMessage.includes("tazminat")) {
        score += 3.0; // Very strong boost
        matches.push("KIDEM_TAZMINATI_COMBO");
      }

      console.log(
        `⚖️  İş Hukuku analysis: ${isHukukuMatches} keywords, score: ${score}`
      );
    }

    // Context-aware adjustments for edge cases
    if (domain.name === "İş Hukuku" && lowerMessage.includes("iş yerinde")) {
      score += 1.5; // Boost for workplace context
      matches.push("CONTEXT:workplace");
    }

    if (
      domain.name === "Sigorta Hukuku" &&
      lowerMessage.includes("iş yerinde")
    ) {
      score -= 0.5; // Penalty for workplace context in insurance
      matches.push("CONTEXT:workplace_penalty");
    }

    // Additional context rules
    if (domain.name === "İdare Hukuku" && lowerMessage.includes("ceza")) {
      // Boost for admin penalties vs criminal law
      if (
        lowerMessage.includes("disiplin") ||
        lowerMessage.includes("personel") ||
        lowerMessage.includes("kamu")
      ) {
        score += 1.0;
        matches.push("CONTEXT:admin_penalty");
      }
    }

    if (domain.name === "Ceza Hukuku" && lowerMessage.includes("disiplin")) {
      score -= 1.0; // Discipline is admin, not criminal
      matches.push("CONTEXT:not_criminal");
    }

    if (domain.name === "Turizm Hukuku" && lowerMessage.includes("otel")) {
      if (
        lowerMessage.includes("belgesi") ||
        lowerMessage.includes("işletme")
      ) {
        score += 1.0; // Tourism licensing vs business incorporation
        matches.push("CONTEXT:tourism_license");
      }
    }

    // Check description keywords
    const descWords = domain.description.toLowerCase().split(/\s+/);
    descWords.forEach((word) => {
      if (word.length > 3 && meaningfulTerms.includes(word)) {
        score += 0.2;
        matches.push(`DESC:${word}`);
      }
    });

    // Boost score for multi-word matches
    if (matches.length > 2) {
      score *= 1.2;
    }

    // Normalize score (max 1.0)
    score = Math.min(score, 1.0);

    return {
      domain: domain.name,
      confidence: score,
      matches: matches.slice(0, 5), // Keep top 5 matches for debugging
    };
  });

  domainScores.sort((a, b) => b.confidence - a.confidence);

  console.log(`📊 Enhanced keyword scores:`, domainScores.slice(0, 3));

  return domainScores[0];
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * LLM-based classification with improved prompting
 * DISABLED: To prevent circular calls, this function now returns fallback
 */
async function classifyWithLLM(message: string): Promise<IntentAnalysis> {
  // Production: LLM classification disabled to prevent circular calls

  // Return immediate fallback to prevent circular calls
  return {
    domain: "Genel Hukuk",
    confidence: 0.3,
    keywords: extractKeywords(message),
    searchTerms: generateSearchTerms(message, extractKeywords(message)),
    method: "llm",
    reasoning: "LLM classification disabled to prevent circular API calls",
  };
}

/**
 * Combine semantic and LLM results
 */
function combineResults(
  semantic: { domain: string; confidence: number },
  llm: IntentAnalysis,
  message: string
): IntentAnalysis {
  // If LLM and semantic agree, use higher confidence
  if (semantic.domain === llm.domain) {
    return {
      ...llm,
      confidence: Math.max(semantic.confidence, llm.confidence),
      method: "hybrid",
    };
  }

  // If they disagree, trust the one with higher confidence
  if (llm.confidence > semantic.confidence) {
    return { ...llm, method: "hybrid" };
  } else {
    return {
      domain: semantic.domain,
      confidence: semantic.confidence,
      keywords: extractKeywords(message),
      searchTerms: generateSearchTerms(message, extractKeywords(message)),
      method: "hybrid",
    };
  }
}

/**
 * Dynamic keyword extraction using linguistic patterns
 */
function extractKeywords(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const keywords: string[] = [];

  // Legal-specific patterns
  const legalPatterns = [
    /(\w+)\s+(hukuku|kanunu|yönetmeliği)/g,
    /(\w+)\s+(tazminatı|cezası|vergisi)/g,
    /(işten\s+çıkarma|kıdem\s+tazminatı|boşanma\s+davası)/g,
    /(\w+)\s+(davası|sözleşmesi|başvurusu)/g,
  ];

  legalPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(lowerMessage)) !== null) {
      keywords.push(match[0]);
    }
  });

  // Extract important nouns (simplified)
  const words = lowerMessage.match(/[a-züçğıöşâî]+/g) || [];
  const importantWords = words.filter(
    (word) =>
      word.length > 3 &&
      !STOP_WORDS.includes(word) &&
      !keywords.some((k) => k.includes(word))
  );

  keywords.push(...importantWords.slice(0, 5));

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate search terms from message and keywords
 * SPRINT 1 FIX: Better handling of Turkish multi-word terms
 */
function generateSearchTerms(message: string, keywords: string[]): string[] {
  const searchTerms: string[] = [];

  console.log(`🔍 Generating search terms for: "${message}"`);
  console.log(`🔑 Keywords: ${keywords.join(", ")}`);

  // SPRINT 1 FIX: Preserve original message structure better
  const originalMessage = message.toLowerCase().trim();
  
  // Remove common stop words but preserve structure
  const preservedMessage = originalMessage
    .replace(/\b(için|ile|ve|bir|bu|şu|olan|olur|nasıl|nedir|ne|hangi)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Add the cleaned original message as primary search term
  if (preservedMessage.length > 3) {
    searchTerms.push(preservedMessage);
    console.log(`📝 Primary search term: "${preservedMessage}"`);
  }

  // SPRINT 1 FIX: Better multi-word term extraction
  const messageWords = originalMessage.match(/[a-züçğıöşâî]+/g) || [];
  const meaningfulWords = messageWords.filter(
    (word) => word.length > 2 && !STOP_WORDS.includes(word)
  );

  // Create combinations for better matching
  if (meaningfulWords.length >= 2) {
    // Two-word combinations
    for (let i = 0; i < meaningfulWords.length - 1; i++) {
      const twoWordTerm = `${meaningfulWords[i]} ${meaningfulWords[i + 1]}`;
      searchTerms.push(twoWordTerm);
      console.log(`🔗 Two-word term: "${twoWordTerm}"`);
    }
    
    // Three-word combinations for longer queries
    if (meaningfulWords.length >= 3) {
      for (let i = 0; i < meaningfulWords.length - 2; i++) {
        const threeWordTerm = `${meaningfulWords[i]} ${meaningfulWords[i + 1]} ${meaningfulWords[i + 2]}`;
        searchTerms.push(threeWordTerm);
        console.log(`🔗 Three-word term: "${threeWordTerm}"`);
      }
    }
  }

  // Add individual keywords as fallback
  keywords.forEach((keyword) => {
    if (keyword.length > 2 && !searchTerms.some(term => term.includes(keyword))) {
      searchTerms.push(keyword);
      console.log(`🏷️  Keyword term: "${keyword}"`);
    }
  });

  // SPRINT 1 FIX: Prioritize longer, more specific terms
  const uniqueTerms = [...new Set(searchTerms)]
    .sort((a, b) => b.length - a.length) // Longer terms first
    .slice(0, 4); // Max 4 search terms

  console.log(`✅ Final search terms: ${uniqueTerms.join(" | ")}`);
  return uniqueTerms;
}

/**
 * Fallback intent generation
 */
function generateFallbackIntent(message: string): IntentAnalysis {
  const keywords = extractKeywords(message);

  return {
    domain: "Genel Hukuk",
    confidence: 0.3,
    keywords,
    searchTerms: generateSearchTerms(message, keywords),
    method: "semantic",
    reasoning:
      "Otomatik sınıflandırma başarısız, genel hukuk kategorisine yönlendirildi",
  };
}

// Backward compatibility wrapper for existing code
export async function detectLegalIntentWithAI(
  message: string
): Promise<LegalIntentResult> {
  const hybridResult = await detectLegalIntentHybrid(message);

  // Convert to legacy format
  return {
    needsLegalResearch: hybridResult.confidence > 0.5,
    legalDomain: hybridResult.domain,
    mainLegislation: hybridResult.domain.replace(" Hukuku", "") || "Genel",
    searchType: "mixed",
    searchTerm:
      hybridResult.searchTerms[0] ||
      hybridResult.keywords.join(" ") ||
      message.slice(0, 50),
    confidence: hybridResult.confidence,
    keywords: hybridResult.keywords,
  };
}
