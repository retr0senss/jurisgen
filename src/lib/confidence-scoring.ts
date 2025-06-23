// 🚀 SPRINT 4: Advanced Confidence Scoring System
// Multi-factor confidence calculation with dynamic thresholds and uncertainty handling

export interface ConfidenceFactors {
  domainMatchConfidence: number;
  termCoverageConfidence: number;
  semanticSimilarityConfidence: number;
  queryComplexityConfidence: number;
  resultRelevanceConfidence: number;
  historicalAccuracyConfidence: number;
}

export interface ConfidenceResult {
  overallConfidence: number;
  factors: ConfidenceFactors;
  confidenceLevel: "very_low" | "low" | "medium" | "high" | "very_high";
  uncertaintyIndicators: string[];
  recommendedActions: string[];
  threshold: number;
  reasoning: string;
}

export interface ConfidenceContext {
  userQuery: string;
  detectedDomain: string;
  searchResults: any[];
  queryComplexity: number;
  historicalData?: {
    similarQueries: number;
    averageAccuracy: number;
    userFeedback: number;
  };
}

// Dynamic confidence thresholds based on query type and domain
const CONFIDENCE_THRESHOLDS = {
  very_high: 0.9,
  high: 0.75,
  medium: 0.6,
  low: 0.4,
  very_low: 0.0,
};

// Domain-specific confidence adjustments
const DOMAIN_CONFIDENCE_MODIFIERS = {
  "Medeni Hukuk": { base: 0.8, complexity: 0.9 },
  "İş Hukuku": { base: 0.85, complexity: 0.95 },
  "Ceza Hukuku": { base: 0.75, complexity: 0.8 },
  "Ticaret Hukuku": { base: 0.7, complexity: 0.85 },
  "Vergi Hukuku": { base: 0.65, complexity: 0.7 },
  "Turizm Hukuku": { base: 0.8, complexity: 0.9 },
  "Genel Hukuk": { base: 0.5, complexity: 0.6 },
};

export class AdvancedConfidenceScorer {
  /**
   * Calculate comprehensive confidence score
   */
  static calculateConfidence(context: ConfidenceContext): ConfidenceResult {
    // Calculate individual confidence factors
    const factors = this.calculateConfidenceFactors(context);

    // Calculate weighted overall confidence
    const overallConfidence = this.calculateWeightedConfidence(
      factors,
      context
    );

    // Determine confidence level
    const confidenceLevel = this.determineConfidenceLevel(overallConfidence);

    // Identify uncertainty indicators
    const uncertaintyIndicators = this.identifyUncertaintyIndicators(
      factors,
      context
    );

    // Generate recommended actions
    const recommendedActions = this.generateRecommendedActions(
      overallConfidence,
      factors,
      uncertaintyIndicators
    );

    // Get dynamic threshold
    const threshold = this.getDynamicThreshold(context);

    // Generate reasoning
    const reasoning = this.generateConfidenceReasoning(
      overallConfidence,
      factors,
      context
    );

    return {
      overallConfidence,
      factors,
      confidenceLevel,
      uncertaintyIndicators,
      recommendedActions,
      threshold,
      reasoning,
    };
  }

  /**
   * Calculate individual confidence factors
   */
  private static calculateConfidenceFactors(
    context: ConfidenceContext
  ): ConfidenceFactors {
    return {
      domainMatchConfidence: this.calculateDomainMatchConfidence(context),
      termCoverageConfidence: this.calculateTermCoverageConfidence(context),
      semanticSimilarityConfidence:
        this.calculateSemanticSimilarityConfidence(context),
      queryComplexityConfidence:
        this.calculateQueryComplexityConfidence(context),
      resultRelevanceConfidence:
        this.calculateResultRelevanceConfidence(context),
      historicalAccuracyConfidence:
        this.calculateHistoricalAccuracyConfidence(context),
    };
  }

  /**
   * Domain match confidence - how well query matches detected domain
   */
  private static calculateDomainMatchConfidence(
    context: ConfidenceContext
  ): number {
    const { userQuery, detectedDomain } = context;
    const domainModifier =
      DOMAIN_CONFIDENCE_MODIFIERS[detectedDomain] ||
      DOMAIN_CONFIDENCE_MODIFIERS["Genel Hukuk"];

    let confidence = domainModifier.base;

    // Check for domain-specific keywords in query
    const domainKeywords = this.getDomainKeywords(detectedDomain);
    const queryWords = userQuery.toLowerCase().split(/\s+/);
    const matchedKeywords = queryWords.filter((word) =>
      domainKeywords.some(
        (keyword) => keyword.includes(word) || word.includes(keyword)
      )
    );

    // Boost confidence based on keyword matches
    const keywordMatchRatio =
      matchedKeywords.length / Math.max(queryWords.length, 1);
    confidence += keywordMatchRatio * 0.2;

    // Penalty for generic terms
    const genericTerms = ["hukuk", "kanun", "madde", "yasa"];
    const hasGenericTerms = queryWords.some((word) =>
      genericTerms.includes(word)
    );
    if (hasGenericTerms && matchedKeywords.length === 0) {
      confidence -= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Term coverage confidence - how well search terms cover the query
   */
  private static calculateTermCoverageConfidence(
    context: ConfidenceContext
  ): number {
    const { userQuery } = context;
    const queryWords = userQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // This would integrate with query expansion results
    // For now, use heuristics based on query structure
    let coverage = 0.7; // Base coverage

    // Boost for specific legal terms
    const legalTerms = [
      "tazminat",
      "boşanma",
      "miras",
      "hırsızlık",
      "şirket",
      "vergi",
    ];
    const hasLegalTerms = queryWords.some((word) =>
      legalTerms.some((legal) => word.includes(legal) || legal.includes(word))
    );

    if (hasLegalTerms) {
      coverage += 0.2;
    }

    // Penalty for very short or very long queries
    if (queryWords.length < 2) {
      coverage -= 0.3;
    } else if (queryWords.length > 10) {
      coverage -= 0.1;
    }

    return Math.max(0, Math.min(1, coverage));
  }

  /**
   * Semantic similarity confidence - based on embedding similarities
   */
  private static calculateSemanticSimilarityConfidence(
    context: ConfidenceContext
  ): number {
    // This would use actual semantic similarity scores from search results
    // For now, estimate based on result quality indicators
    const { searchResults } = context;

    if (!searchResults || searchResults.length === 0) {
      return 0.1;
    }

    // Estimate based on number and quality of results
    let confidence = 0.5;

    // Boost for multiple relevant results
    if (searchResults.length >= 3) {
      confidence += 0.2;
    }

    // Boost for results with high relevance scores (if available)
    const hasHighRelevanceResults = searchResults.some(
      (result) => result.relevanceScore && result.relevanceScore > 0.7
    );

    if (hasHighRelevanceResults) {
      confidence += 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Query complexity confidence - simpler queries are more reliable
   */
  private static calculateQueryComplexityConfidence(
    context: ConfidenceContext
  ): number {
    const { userQuery, queryComplexity } = context;

    // Base confidence inversely related to complexity
    let confidence = 1 - queryComplexity / 10;

    // Adjust based on query characteristics
    const words = userQuery.split(/\s+/);
    const hasQuestionWords = /nasıl|nedir|ne|hangi|kim|nerede|ne zaman/.test(
      userQuery.toLowerCase()
    );
    const hasMultipleConcepts = words.length > 5;

    if (hasQuestionWords) {
      confidence += 0.1; // Questions are usually clearer
    }

    if (hasMultipleConcepts) {
      confidence -= 0.2; // Multiple concepts are harder to handle
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Result relevance confidence - based on search result quality
   */
  private static calculateResultRelevanceConfidence(
    context: ConfidenceContext
  ): number {
    const { searchResults } = context;

    if (!searchResults || searchResults.length === 0) {
      return 0.0;
    }

    let confidence = 0.3; // Base confidence for having results

    // Analyze result characteristics
    const resultCount = searchResults.length;
    const hasDetailedResults = searchResults.some(
      (result) => result.content && result.content.length > 100
    );
    const hasRecentResults = searchResults.some(
      (result) => result.date && new Date(result.date) > new Date("2020-01-01")
    );

    // Boost based on result quality indicators
    if (resultCount >= 3) confidence += 0.2;
    if (resultCount >= 5) confidence += 0.1;
    if (hasDetailedResults) confidence += 0.2;
    if (hasRecentResults) confidence += 0.1;

    // Penalty for too many results (might indicate broad/generic query)
    if (resultCount > 20) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Historical accuracy confidence - based on past performance
   */
  private static calculateHistoricalAccuracyConfidence(
    context: ConfidenceContext
  ): number {
    const { historicalData } = context;

    if (!historicalData) {
      return 0.5; // Neutral confidence without historical data
    }

    const { similarQueries, averageAccuracy, userFeedback } = historicalData;

    let confidence = averageAccuracy || 0.5;

    // Boost confidence based on number of similar queries
    if (similarQueries > 10) {
      confidence += 0.1;
    }
    if (similarQueries > 50) {
      confidence += 0.1;
    }

    // Adjust based on user feedback
    if (userFeedback > 0.8) {
      confidence += 0.2;
    } else if (userFeedback < 0.4) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate weighted overall confidence
   */
  private static calculateWeightedConfidence(
    factors: ConfidenceFactors,
    context: ConfidenceContext
  ): number {
    // Define weights for different factors
    const weights = {
      domainMatchConfidence: 0.25,
      termCoverageConfidence: 0.2,
      semanticSimilarityConfidence: 0.2,
      queryComplexityConfidence: 0.15,
      resultRelevanceConfidence: 0.15,
      historicalAccuracyConfidence: 0.05,
    };

    // Calculate weighted sum
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [factor, weight] of Object.entries(weights)) {
      const value = factors[factor as keyof ConfidenceFactors];
      if (value !== undefined && value >= 0) {
        weightedSum += value * weight;
        totalWeight += weight;
      }
    }

    const baseConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

    // Apply domain-specific modifiers
    const domainModifier =
      DOMAIN_CONFIDENCE_MODIFIERS[context.detectedDomain] ||
      DOMAIN_CONFIDENCE_MODIFIERS["Genel Hukuk"];

    return Math.max(0, Math.min(1, baseConfidence * domainModifier.complexity));
  }

  /**
   * Determine confidence level category
   */
  private static determineConfidenceLevel(
    confidence: number
  ): "very_low" | "low" | "medium" | "high" | "very_high" {
    if (confidence >= CONFIDENCE_THRESHOLDS.very_high) return "very_high";
    if (confidence >= CONFIDENCE_THRESHOLDS.high) return "high";
    if (confidence >= CONFIDENCE_THRESHOLDS.medium) return "medium";
    if (confidence >= CONFIDENCE_THRESHOLDS.low) return "low";
    return "very_low";
  }

  /**
   * Identify uncertainty indicators
   */
  private static identifyUncertaintyIndicators(
    factors: ConfidenceFactors,
    context: ConfidenceContext
  ): string[] {
    const indicators: string[] = [];

    if (factors.domainMatchConfidence < 0.6) {
      indicators.push("Belirsiz hukuk alanı");
    }

    if (factors.termCoverageConfidence < 0.5) {
      indicators.push("Eksik terim kapsamı");
    }

    if (factors.semanticSimilarityConfidence < 0.4) {
      indicators.push("Düşük anlamsal benzerlik");
    }

    if (factors.queryComplexityConfidence < 0.5) {
      indicators.push("Karmaşık sorgu yapısı");
    }

    if (factors.resultRelevanceConfidence < 0.3) {
      indicators.push("Yetersiz arama sonuçları");
    }

    if (context.searchResults.length === 0) {
      indicators.push("Sonuç bulunamadı");
    }

    if (context.userQuery.length < 10) {
      indicators.push("Çok kısa sorgu");
    }

    return indicators;
  }

  /**
   * Generate recommended actions based on confidence analysis
   */
  private static generateRecommendedActions(
    confidence: number,
    factors: ConfidenceFactors,
    uncertaintyIndicators: string[]
  ): string[] {
    const actions: string[] = [];

    if (confidence < 0.4) {
      actions.push("Soruyu daha spesifik hale getirin");
      actions.push("Hukuk alanını belirtin");
    }

    if (factors.domainMatchConfidence < 0.6) {
      actions.push("Hangi hukuk dalıyla ilgili olduğunu belirtin");
    }

    if (factors.termCoverageConfidence < 0.5) {
      actions.push("Daha fazla anahtar kelime ekleyin");
    }

    if (factors.resultRelevanceConfidence < 0.3) {
      actions.push("Farklı terimler deneyiniz");
      actions.push("Daha genel bir sorgu deneyin");
    }

    if (uncertaintyIndicators.includes("Çok kısa sorgu")) {
      actions.push("Sorunuzu detaylandırın");
    }

    if (confidence > 0.8) {
      actions.push("Sonuçlar güvenilir görünüyor");
    }

    return actions;
  }

  /**
   * Get dynamic confidence threshold based on context
   */
  private static getDynamicThreshold(context: ConfidenceContext): number {
    let threshold = 0.6; // Base threshold

    // Adjust based on domain
    const domainModifier = DOMAIN_CONFIDENCE_MODIFIERS[context.detectedDomain];
    if (domainModifier) {
      threshold = threshold * domainModifier.base;
    }

    // Adjust based on query complexity
    if (context.queryComplexity > 7) {
      threshold -= 0.1; // Lower threshold for complex queries
    }

    // Adjust based on result availability
    if (context.searchResults.length < 3) {
      threshold -= 0.15; // Lower threshold when few results
    }

    return Math.max(0.3, Math.min(0.9, threshold));
  }

  /**
   * Generate human-readable confidence reasoning
   */
  private static generateConfidenceReasoning(
    confidence: number,
    factors: ConfidenceFactors,
    context: ConfidenceContext
  ): string {
    const confidencePercent = Math.round(confidence * 100);
    const level = this.determineConfidenceLevel(confidence);

    let reasoning = `Güven skoru: ${confidencePercent}% (${level}). `;

    // Highlight strongest factor
    const strongestFactor = Object.entries(factors).reduce((a, b) =>
      factors[a[0] as keyof ConfidenceFactors] >
      factors[b[0] as keyof ConfidenceFactors]
        ? a
        : b
    );

    reasoning += `En güçlü faktör: ${this.getFactorDisplayName(
      strongestFactor[0]
    )} `;
    reasoning += `(${Math.round(strongestFactor[1] * 100)}%). `;

    // Mention domain
    reasoning += `Tespit edilen alan: ${context.detectedDomain}. `;

    // Mention result count
    reasoning += `${context.searchResults.length} sonuç bulundu.`;

    return reasoning;
  }

  /**
   * Get display name for confidence factor
   */
  private static getFactorDisplayName(factorKey: string): string {
    const displayNames: Record<string, string> = {
      domainMatchConfidence: "Alan eşleşmesi",
      termCoverageConfidence: "Terim kapsamı",
      semanticSimilarityConfidence: "Anlamsal benzerlik",
      queryComplexityConfidence: "Sorgu karmaşıklığı",
      resultRelevanceConfidence: "Sonuç relevansı",
      historicalAccuracyConfidence: "Geçmiş doğruluk",
    };

    return displayNames[factorKey] || factorKey;
  }

  /**
   * Get domain-specific keywords for matching
   */
  private static getDomainKeywords(domain: string): string[] {
    const domainKeywords: Record<string, string[]> = {
      "İş Hukuku": [
        "kıdem",
        "tazminat",
        "işten",
        "çıkarma",
        "çalışma",
        "mesai",
        "izin",
      ],
      "Medeni Hukuk": [
        "boşanma",
        "evlilik",
        "miras",
        "velayet",
        "nafaka",
        "mal rejimi",
      ],
      "Ceza Hukuku": [
        "hırsızlık",
        "dolandırıcılık",
        "tehdit",
        "yaralama",
        "suç",
        "ceza",
      ],
      "Ticaret Hukuku": ["şirket", "ticaret", "sözleşme", "borç", "alacak"],
      "Vergi Hukuku": ["vergi", "stopaj", "beyanname", "gelir", "kurumlar"],
      "Turizm Hukuku": ["turizm", "otel", "rehber", "tur", "konaklama"],
    };

    return domainKeywords[domain] || [];
  }
}
