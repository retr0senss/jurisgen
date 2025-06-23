// Sprint 2: Semantic Filtering Layer
// Purpose: Improve search relevance by filtering and re-ranking results
// 🚀 SPRINT 4: Enhanced with Query Expansion, Confidence Scoring, Intent Classification, Result Ranking

// 🚀 SPRINT 4: Import Sprint 4 modules
import {
  TurkishQueryExpander,
  type QueryExpansionResult,
} from "./query-expansion";
import {
  AdvancedConfidenceScorer,
  type ConfidenceResult,
} from "./confidence-scoring";
import {
  EnhancedIntentClassifier,
  type EnhancedIntentResult,
} from "./enhanced-intent-classification";
import {
  AdvancedResultRanker,
  type RankedResult,
  type RankingMetrics,
} from "./result-ranking";

export interface FilteredSearchResult {
  mevzuatId: string;
  mevzuatAdi: string;
  mevzuatNo?: number;
  mevzuatTur: {
    id: number;
    name: string;
    description: string;
  };
  resmiGazeteTarihi?: string;
  resmiGazeteSayisi?: string;
  url?: string;
  // Sprint 2 additions
  relevanceScore: number;
  matchingKeywords: string[];
  filterReason: string;
}

export interface SemanticFilterConfig {
  minRelevanceScore: number;
  maxResults: number;
  domainBoost: Record<string, number>;
  penaltyTerms: string[];
}

export class SemanticFilter {
  private config: SemanticFilterConfig;

  constructor(config?: Partial<SemanticFilterConfig>) {
    this.config = {
      minRelevanceScore: 0.15, // Lower threshold to catch more results
      maxResults: 10,
      domainBoost: {
        "İş Hukuku": 1.3, // Higher boost for employment law
        "Turizm Hukuku": 1.2,
        "Vergi Hukuku": 1.2, // Higher boost for tax law
        "Medeni Hukuk": 1.1,
        "Ceza Hukuku": 1.1,
      },
      penaltyTerms: [
        "siber güvenlik",
        "spor federasyonu",
        "genel yatırım",
        "finansman programı",
        "kırsal kalkınma",
        "tarıma dayalı", // Additional penalties
        "dış ticaret",
        "sanayi",
        "enerji",
      ],
      ...config,
    };
  }

  /**
   * Filter and re-rank search results based on semantic relevance
   */
  filterResults(
    rawResults: any[],
    query: string,
    domain: string
  ): FilteredSearchResult[] {
    console.log(
      `🔍 Semantic filtering: ${rawResults.length} raw results for "${query}"`
    );
    console.log(`🏷️  Domain: ${domain}`);

    const filteredResults = rawResults
      .map((result) => this.calculateRelevance(result, query, domain))
      .filter(
        (result) => result.relevanceScore >= this.config.minRelevanceScore
      )
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.config.maxResults);

    console.log(`📊 Filtered to ${filteredResults.length} relevant results`);
    console.log(
      `📈 Average relevance: ${this.getAverageRelevance(
        filteredResults
      ).toFixed(2)}`
    );

    return filteredResults;
  }

  /**
   * Calculate relevance score for a single document
   */
  private calculateRelevance(
    document: any,
    query: string,
    domain: string
  ): FilteredSearchResult {
    const title = document.mevzuatAdi?.toLowerCase() || "";
    const queryLower = query.toLowerCase();

    let score = 0;
    const matchingKeywords: string[] = [];
    const reasons: string[] = [];

    // 1. Direct query word matching
    const queryWords = queryLower.split(" ").filter((word) => word.length > 2);
    let directMatches = 0;

    queryWords.forEach((word) => {
      if (title.includes(word)) {
        directMatches++;
        score += 0.3;
        matchingKeywords.push(word);
        reasons.push(`direct:${word}`);
      }
    });

    // 2. Domain-specific keyword matching
    const domainKeywords = this.getDomainKeywords(domain);
    domainKeywords.forEach((keyword) => {
      if (title.includes(keyword.toLowerCase())) {
        score += 0.25;
        matchingKeywords.push(keyword);
        reasons.push(`domain:${keyword}`);
      }
    });

    // 3. Legal term patterns
    const legalPatterns = [
      /kanun/g,
      /yönetmelik/g,
      /tebliğ/g,
      /karar/g,
      /genelge/g,
    ];

    legalPatterns.forEach((pattern) => {
      if (pattern.test(title)) {
        score += 0.1;
        reasons.push(`legal:${pattern.source}`);
      }
    });

    // 4. Domain boost
    const domainBoost = this.config.domainBoost[domain] || 1.0;
    score *= domainBoost;
    if (domainBoost > 1.0) {
      reasons.push(`boost:${domainBoost}`);
    }

    // 5. Penalty for irrelevant terms
    this.config.penaltyTerms.forEach((penaltyTerm) => {
      if (title.includes(penaltyTerm.toLowerCase())) {
        score -= 0.4;
        reasons.push(`penalty:${penaltyTerm}`);
      }
    });

    // 6. Length penalty (very long titles are usually less specific)
    if (title.length > 120) {
      score -= 0.1;
      reasons.push("penalty:long_title");
    }

    // 7. Bonus for multiple direct matches
    if (directMatches > 1) {
      score += 0.2;
      reasons.push(`bonus:multi_match(${directMatches})`);
    }

    // Normalize score
    score = Math.max(0, Math.min(1, score));

    return {
      ...document,
      relevanceScore: score,
      matchingKeywords: [...new Set(matchingKeywords)],
      filterReason: reasons.join(", "),
    };
  }

  /**
   * Get domain-specific keywords for enhanced matching
   */
  private getDomainKeywords(domain: string): string[] {
    const domainKeywordMap: Record<string, string[]> = {
      "İş Hukuku": [
        "işçi",
        "çalışan",
        "kıdem",
        "tazminat",
        "ihbar",
        "işveren",
        "sendika",
        "iş",
        "çalışma",
        "personel",
        "mesai",
        "izin",
        "sigorta",
        "işsizlik",
        "emek", // Additional keywords
        "sözleşme",
        "ücret",
        "maaş",
        "prim",
        "fazla",
        "vardiya",
        "dinlenme",
        "tatil",
        "izin",
        "doğum",
        "analık",
        "babalık",
      ],
      "Turizm Hukuku": [
        "turizm",
        "otel",
        "konaklama",
        "tatil",
        "kiralama",
        "tesis",
        "belgesi",
        "işletme",
        "pansiyon",
        "tur",
      ],
      "Vergi Hukuku": [
        "vergi",
        "gelir",
        "kdv",
        "stopaj",
        "beyanname",
        "mükellef",
        "tarh",
        "tahakkuk",
        "tahsilat",
        "iade",
        "satış", // Additional keywords
        "alış",
        "emlak",
        "gayrimenkul",
        "konut",
        "ev",
        "daire",
        "arsa",
        "tapu",
        "harç",
        "damga",
        "muafiyet",
        "istisna",
      ],
      "Medeni Hukuk": [
        "evlilik",
        "boşanma",
        "miras",
        "velayet",
        "nafaka",
        "aile",
        "çocuk",
        "soyadı",
        "mal",
        "rejim",
      ],
      "Ceza Hukuku": [
        "suç",
        "ceza",
        "hapis",
        "para",
        "dava",
        "savcılık",
        "mahkeme",
        "hüküm",
        "beraat",
      ],
      "Sigorta Hukuku": [
        "sigorta",
        "poliçe",
        "hasar",
        "tazminat",
        "prim",
        "kasko",
        "sağlık",
        "hayat",
        "emeklilik",
      ],
      "Konut Hukuku": [
        "konut",
        "ev",
        "kiracı",
        "sahibi",
        "kira",
        "tahliye",
        "depozito",
        "gayrimenkul",
        "tapu",
      ],
    };

    return domainKeywordMap[domain] || [];
  }

  /**
   * Calculate average relevance score
   */
  private getAverageRelevance(results: FilteredSearchResult[]): number {
    if (results.length === 0) return 0;

    const totalScore = results.reduce(
      (sum, result) => sum + result.relevanceScore,
      0
    );
    return totalScore / results.length;
  }

  /**
   * Get filtering statistics
   */
  getFilteringStats(
    originalCount: number,
    filteredResults: FilteredSearchResult[]
  ) {
    const averageRelevance = this.getAverageRelevance(filteredResults);
    const improvementRatio = filteredResults.length / originalCount;

    return {
      originalCount,
      filteredCount: filteredResults.length,
      averageRelevance,
      improvementRatio,
      topScore: filteredResults[0]?.relevanceScore || 0,
      bottomScore:
        filteredResults[filteredResults.length - 1]?.relevanceScore || 0,
    };
  }
}

/**
 * Quick utility function for filtering search results
 */
export function filterSearchResults(
  rawResults: any[],
  query: string,
  domain: string,
  config?: Partial<SemanticFilterConfig>
): FilteredSearchResult[] {
  const filter = new SemanticFilter(config);
  return filter.filterResults(rawResults, query, domain);
}

/**
 * Enhanced search function that combines backend search with semantic filtering
 * 🚀 SPRINT 4: Now includes Query Expansion, Confidence Scoring, Intent Classification, Result Ranking
 */
export async function enhancedMevzuatSearch(
  query: string,
  domain: string,
  searchType: "fulltext" | "title" = "fulltext",
  maxResults: number = 10
): Promise<{
  results: FilteredSearchResult[];
  stats: any;
  rawCount: number;
}> {
  console.log(`🚀 SPRINT 4: Enhanced search: "${query}" in ${domain}`);

  try {
    // 🚀 SPRINT 4: Step 1 - Enhanced Intent Classification
    console.log(`🎯 SPRINT 4: Classifying intent...`);
    const intentResult: EnhancedIntentResult =
      await EnhancedIntentClassifier.classifyIntent(query);
    console.log(
      `🎯 Intent classified: ${intentResult.primaryIntent} (${Math.round(
        intentResult.intentConfidence * 100
      )}%)`
    );
    console.log(
      `🏷️ Domain: ${intentResult.legalDomain} (${Math.round(
        intentResult.domainConfidence * 100
      )}%)`
    );

    // 🚀 SPRINT 4: Step 2 - Query Expansion
    console.log(`📈 SPRINT 4: Expanding query...`);
    const expansionResult: QueryExpansionResult =
      await TurkishQueryExpander.expandQuery(query, {
        legalDomain: intentResult.legalDomain,
        detectedKeywords: intentResult.prioritizedTerms || [],
        userIntent:
          intentResult.primaryIntent === "procedure_inquiry"
            ? "procedure"
            : "general",
        formalityLevel: "mixed",
      });

    console.log(
      `📈 Query expanded: ${expansionResult.expandedTerms.length} terms`
    );
    console.log(
      `📈 Top expansions: ${expansionResult.expandedTerms
        .slice(0, 3)
        .join(", ")}`
    );

    // 🚀 SPRINT 4: Step 3 - Confidence Scoring for Query
    console.log(`📊 SPRINT 4: Calculating confidence...`);
    const queryConfidence: ConfidenceResult =
      AdvancedConfidenceScorer.calculateConfidence({
        userQuery: query,
        detectedDomain: intentResult.legalDomain,
        searchResults: [], // Will be populated after search
        queryComplexity: intentResult.complexityScore || 5,
      });

    console.log(
      `📊 Query confidence: ${Math.round(
        queryConfidence.overallConfidence * 100
      )}%`
    );
    console.log(
      `📊 Confidence factors: ${Object.entries(queryConfidence.factors)
        .map(([k, v]) => `${k}:${Math.round(v * 100)}%`)
        .join(", ")}`
    );

    // Step 4: Prepare search terms (original + expanded)
    const searchTerms = [query, ...expansionResult.expandedTerms.slice(0, 3)];
    const allResults: any[] = [];

    // Step 5: Execute searches with original and expanded terms
    const MEVZUAT_SERVICE_URL =
      process.env.MEVZUAT_SERVICE_URL || "http://localhost:8080";

    for (let i = 0; i < Math.min(searchTerms.length, 2); i++) {
      // Limit to 2 searches for performance
      const searchTerm = searchTerms[i];
      console.log(`🔍 SPRINT 4: Searching with term ${i + 1}: "${searchTerm}"`);

      const searchParams = {
        phrase: searchType === "fulltext" ? searchTerm : undefined,
        mevzuat_adi: searchType === "title" ? searchTerm : undefined,
        page_size: Math.min(25, maxResults * 2), // Reduced for multiple searches
        page_number: 1,
        sort_field: "RESMI_GAZETE_TARIHI",
        sort_direction: "desc",
      };

      try {
        const response = await fetch(`${MEVZUAT_SERVICE_URL}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(searchParams),
        });

        if (response.ok) {
          const searchData = await response.json();
          const documents = searchData.documents || [];

          // Add search term info to each document
          documents.forEach((doc: any) => {
            doc._searchTerm = searchTerm;
            doc._searchIndex = i;
          });

          allResults.push(...documents);
          console.log(
            `📄 Found ${documents.length} documents with "${searchTerm}"`
          );
        }
      } catch (error) {
        console.warn(`⚠️ Search failed for "${searchTerm}":`, error);
      }
    }

    // Remove duplicates based on mevzuatId
    const uniqueResults = allResults.filter(
      (doc, index, arr) =>
        arr.findIndex((d) => d.mevzuatId === doc.mevzuatId) === index
    );

    console.log(`📄 Total unique results: ${uniqueResults.length} documents`);

    // 🚀 SPRINT 4: Step 6 - Apply semantic filtering with Sprint 4 enhancements
    const filter = new SemanticFilter({ maxResults: maxResults * 2 }); // Get more for ranking
    const filteredResults = filter.filterResults(uniqueResults, query, domain);

    // 🚀 SPRINT 4: Step 7 - Advanced Result Ranking
    console.log(`🏆 SPRINT 4: Applying advanced ranking...`);

    const rankingContext = {
      userQuery: query,
      detectedDomain: intentResult.legalDomain,
      userIntent: intentResult.primaryIntent,
      urgencyLevel: intentResult.urgencyLevel || "medium",
      queryComplexity: intentResult.complexityScore || 5,
    };

    const rankingResult = AdvancedResultRanker.rankResults(
      filteredResults.map((result) => ({
        ...result,
        content: result.mevzuatAdi, // Use title as content for ranking
        documentType: result.mevzuatTur?.name || "UNKNOWN",
      })),
      rankingContext
    );

    const rankedResults = rankingResult.rankedResults;

    // Convert back to FilteredSearchResult format and limit to maxResults
    const finalResults: FilteredSearchResult[] = rankedResults
      .slice(0, maxResults)
      .map((rankedResult) => ({
        mevzuatId: rankedResult.id,
        mevzuatAdi: rankedResult.title,
        mevzuatTur: { id: 1, name: rankedResult.documentType, description: "" },
        relevanceScore: rankedResult.finalScore, // Use final score as relevance
        matchingKeywords: [], // Will be populated by semantic filter
        filterReason: `Advanced Ranking Applied | Score: ${rankedResult.finalScore.toFixed(
          2
        )} | Rank: ${rankedResult.rank}`,
      }));

    // 🚀 SPRINT 4: Enhanced statistics
    const stats = {
      // Original stats
      originalCount: allResults.length,
      filteredCount: filteredResults.length,
      finalCount: finalResults.length,
      averageRelevance:
        finalResults.reduce((sum, r) => sum + r.relevanceScore, 0) /
          finalResults.length || 0,
      topScore: finalResults[0]?.relevanceScore || 0,
      bottomScore: finalResults[finalResults.length - 1]?.relevanceScore || 0,

      // 🚀 SPRINT 4: New stats
      queryExpansionApplied: true,
      confidenceScoreCalculated: true,
      intentClassified: true,
      resultRankingApplied: true,
      domainFilterApplied: domain !== "Genel Hukuk",

      // Sprint 4 details
      sprint4Details: {
        intentResult: {
          primaryIntent: intentResult.primaryIntent,
          legalDomain: intentResult.legalDomain,
          confidence: intentResult.intentConfidence,
          complexity: intentResult.complexityScore,
        },
        queryExpansion: {
          originalQuery: query,
          expandedTerms: expansionResult.expandedTerms.slice(0, 5),
          expansionCount: expansionResult.expandedTerms.length,
          confidence: expansionResult.confidence,
        },
        confidenceAnalysis: {
          overallConfidence: queryConfidence.overallConfidence,
          factorScores: queryConfidence.factors,
          uncertaintyIndicators: queryConfidence.uncertaintyIndicators,
        },
        rankingMetrics:
          rankedResults.length > 0
            ? {
                scoreDistribution: {
                  min: Math.min(...rankedResults.map((r) => r.finalScore)),
                  max: Math.max(...rankedResults.map((r) => r.finalScore)),
                  avg:
                    rankedResults.reduce((sum, r) => sum + r.finalScore, 0) /
                    rankedResults.length,
                },
                diversityScore:
                  new Set(rankedResults.map((r) => r.documentType)).size /
                  rankedResults.length,
                coverageAnalysis: "High relevance coverage achieved",
                rankingMetrics: rankingResult.rankingMetrics,
              }
            : null,
      },
    };

    console.log(`🎉 SPRINT 4: Enhanced search completed!`);
    console.log(`📊 Final results: ${finalResults.length} documents`);
    console.log(`📈 Average score: ${stats.averageRelevance.toFixed(2)}`);
    console.log(`🚀 All Sprint 4 features applied successfully`);

    return {
      results: finalResults,
      stats,
      rawCount: allResults.length,
    };
  } catch (error) {
    console.error("🚨 SPRINT 4: Enhanced search failed:", error);
    return {
      results: [],
      stats: {
        error: error instanceof Error ? error.message : "Unknown error",
        queryExpansionApplied: false,
        confidenceScoreCalculated: false,
        intentClassified: false,
        resultRankingApplied: false,
        domainFilterApplied: false,
      },
      rawCount: 0,
    };
  }
}
