// 🚀 SPRINT 4: Advanced Result Ranking Algorithm
// Multi-criteria ranking with relevance weighting and user feedback integration

export interface RankingResult {
  rankedResults: RankedDocument[];
  rankingMetrics: RankingMetrics;
  rankingExplanation: string;
  confidenceScore: number;
  processingTime: number;
}

export interface RankedDocument {
  id: string;
  title: string;
  content: string;
  originalScore: number;
  finalScore: number;
  rankingFactors: RankingFactors;
  relevanceReasons: string[];
  rank: number;
  documentType: DocumentType;
  metadata: DocumentMetadata;
}

export interface RankingFactors {
  // Content relevance (40% weight)
  semanticRelevance: number;
  keywordMatch: number;
  domainSpecificity: number;

  // Document quality (25% weight)
  authorityScore: number;
  freshnessScore: number;
  completenessScore: number;

  // User context (20% weight)
  intentAlignment: number;
  complexityMatch: number;
  urgencyAlignment: number;

  // Historical performance (15% weight)
  userFeedbackScore: number;
  clickThroughRate: number;
  successRate: number;
}

export interface RankingMetrics {
  totalDocuments: number;
  averageFinalScore: number;
  scoreDistribution: ScoreDistribution;
  diversityScore: number;
  coverageScore: number;
}

export interface ScoreDistribution {
  excellent: number; // 0.8+
  good: number; // 0.6-0.8
  fair: number; // 0.4-0.6
  poor: number; // 0.2-0.4
  veryPoor: number; // <0.2
}

export type DocumentType =
  | "law" // Kanun
  | "regulation" // Yönetmelik
  | "decree" // Kararname
  | "circular" // Genelge
  | "court_decision" // Mahkeme kararı
  | "interpretation" // Yorum
  | "guidance"; // Rehber

export interface DocumentMetadata {
  publicationDate: Date;
  lastModified: Date;
  authority: string;
  officialNumber?: string;
  legalDomain: string;
  documentLength: number;
  language: "tr" | "en";
  isActive: boolean;
}

export interface RankingContext {
  userQuery: string;
  detectedDomain: string;
  userIntent: string;
  urgencyLevel: string;
  queryComplexity: number;
  userProfile?: UserProfile;
  historicalData?: HistoricalData;
}

export interface UserProfile {
  expertiseLevel: "beginner" | "intermediate" | "expert";
  preferredDocumentTypes: DocumentType[];
  previousQueries: string[];
  feedbackHistory: FeedbackEntry[];
}

export interface HistoricalData {
  documentPerformance: Map<string, DocumentPerformance>;
  queryPatterns: QueryPattern[];
  userBehavior: UserBehaviorData;
}

export interface DocumentPerformance {
  documentId: string;
  totalViews: number;
  averageRating: number;
  clickThroughRate: number;
  completionRate: number;
  userFeedback: FeedbackEntry[];
}

export interface FeedbackEntry {
  documentId: string;
  rating: number; // 1-5
  feedback: "helpful" | "not_helpful" | "partially_helpful";
  timestamp: Date;
}

export interface QueryPattern {
  query: string;
  successfulDocuments: string[];
  averageSuccessScore: number;
  frequency: number;
}

export interface UserBehaviorData {
  averageReadingTime: number;
  preferredDocumentLength: number;
  bounceRate: number;
  returnRate: number;
}

// Ranking weights configuration
const RANKING_WEIGHTS = {
  contentRelevance: 0.4,
  documentQuality: 0.25,
  userContext: 0.2,
  historicalPerformance: 0.15,
};

const FACTOR_WEIGHTS = {
  // Content relevance factors
  semanticRelevance: 0.5,
  keywordMatch: 0.3,
  domainSpecificity: 0.2,

  // Document quality factors
  authorityScore: 0.4,
  freshnessScore: 0.35,
  completenessScore: 0.25,

  // User context factors
  intentAlignment: 0.5,
  complexityMatch: 0.3,
  urgencyAlignment: 0.2,

  // Historical performance factors
  userFeedbackScore: 0.5,
  clickThroughRate: 0.3,
  successRate: 0.2,
};

// Document type authority scores
const DOCUMENT_TYPE_AUTHORITY = {
  law: 1.0,
  regulation: 0.9,
  decree: 0.85,
  court_decision: 0.8,
  circular: 0.7,
  interpretation: 0.6,
  guidance: 0.5,
};

export class AdvancedResultRanker {
  /**
   * Main ranking function
   */
  static rankResults(documents: any[], context: RankingContext): RankingResult {
    const startTime = Date.now();

    // Step 1: Calculate ranking factors for each document
    const documentsWithFactors = documents.map((doc) =>
      this.calculateRankingFactors(doc, context)
    );

    // Step 2: Calculate final scores
    const scoredDocuments = documentsWithFactors.map((doc) =>
      this.calculateFinalScore(doc, context)
    );

    // Step 3: Sort by final score
    const rankedDocuments = scoredDocuments
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((doc, index) => ({ ...doc, rank: index + 1 }));

    // Step 4: Calculate ranking metrics
    const rankingMetrics = this.calculateRankingMetrics(rankedDocuments);

    // Step 5: Generate explanation
    const rankingExplanation = this.generateRankingExplanation(
      rankedDocuments,
      context
    );

    // Step 6: Calculate overall confidence
    const confidenceScore = this.calculateRankingConfidence(
      rankedDocuments,
      rankingMetrics
    );

    const processingTime = Date.now() - startTime;

    return {
      rankedResults: rankedDocuments,
      rankingMetrics,
      rankingExplanation,
      confidenceScore,
      processingTime,
    };
  }

  /**
   * Calculate ranking factors for a document
   */
  private static calculateRankingFactors(
    document: any,
    context: RankingContext
  ): RankedDocument {
    const factors: RankingFactors = {
      // Content relevance
      semanticRelevance: this.calculateSemanticRelevance(document, context),
      keywordMatch: this.calculateKeywordMatch(document, context),
      domainSpecificity: this.calculateDomainSpecificity(document, context),

      // Document quality
      authorityScore: this.calculateAuthorityScore(document),
      freshnessScore: this.calculateFreshnessScore(document),
      completenessScore: this.calculateCompletenessScore(document),

      // User context
      intentAlignment: this.calculateIntentAlignment(document, context),
      complexityMatch: this.calculateComplexityMatch(document, context),
      urgencyAlignment: this.calculateUrgencyAlignment(document, context),

      // Historical performance
      userFeedbackScore: this.calculateUserFeedbackScore(document, context),
      clickThroughRate: this.calculateClickThroughRate(document, context),
      successRate: this.calculateSuccessRate(document, context),
    };

    const relevanceReasons = this.generateRelevanceReasons(
      factors,
      document,
      context
    );

    return {
      id: document.id || document.mevzuatId,
      title: document.title || document.mevzuatAdi,
      content: document.content || "",
      originalScore: document.score || 0,
      finalScore: 0, // Will be calculated later
      rankingFactors: factors,
      relevanceReasons,
      rank: 0, // Will be set after sorting
      documentType: this.inferDocumentType(document),
      metadata: this.extractMetadata(document),
    };
  }

  /**
   * Calculate semantic relevance score
   */
  private static calculateSemanticRelevance(
    document: any,
    context: RankingContext
  ): number {
    // This would use actual semantic similarity scores
    // For now, estimate based on content overlap
    const queryTerms = context.userQuery.toLowerCase().split(/\s+/);
    const docContent = (document.content || document.title || "").toLowerCase();

    const matchedTerms = queryTerms.filter(
      (term) => docContent.includes(term) && term.length > 2
    );

    const baseScore = matchedTerms.length / Math.max(queryTerms.length, 1);

    // Boost for exact phrase matches
    if (docContent.includes(context.userQuery.toLowerCase())) {
      return Math.min(1, baseScore + 0.3);
    }

    return baseScore;
  }

  /**
   * Calculate keyword match score
   */
  private static calculateKeywordMatch(
    document: any,
    context: RankingContext
  ): number {
    const domainKeywords = this.getDomainKeywords(context.detectedDomain);
    const docContent = (document.content || document.title || "").toLowerCase();

    const matchedKeywords = domainKeywords.filter((keyword) =>
      docContent.includes(keyword.toLowerCase())
    );

    return matchedKeywords.length / Math.max(domainKeywords.length, 1);
  }

  /**
   * Calculate domain specificity score
   */
  private static calculateDomainSpecificity(
    document: any,
    context: RankingContext
  ): number {
    const docDomain =
      document.legalDomain || this.inferDocumentDomain(document);

    if (docDomain === context.detectedDomain) {
      return 1.0;
    }

    // Check for related domains
    const relatedDomains = this.getRelatedDomains(context.detectedDomain);
    if (relatedDomains.includes(docDomain)) {
      return 0.7;
    }

    return 0.3; // Generic or unrelated domain
  }

  /**
   * Calculate authority score based on document type and source
   */
  private static calculateAuthorityScore(document: any): number {
    const docType = this.inferDocumentType(document);
    const baseScore = DOCUMENT_TYPE_AUTHORITY[docType] || 0.5;

    // Boost for official sources
    const authority = document.authority || document.source || "";
    if (authority.includes("Resmi Gazete") || authority.includes("TBMM")) {
      return Math.min(1, baseScore + 0.2);
    }

    return baseScore;
  }

  /**
   * Calculate freshness score based on publication date
   */
  private static calculateFreshnessScore(document: any): number {
    const pubDate = document.publicationDate || document.date;
    if (!pubDate) return 0.5; // Unknown date

    const docDate = new Date(pubDate);
    const now = new Date();
    const ageInDays =
      (now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24);

    // Fresher documents get higher scores
    if (ageInDays < 365) return 1.0; // Less than 1 year
    if (ageInDays < 1825) return 0.8; // Less than 5 years
    if (ageInDays < 3650) return 0.6; // Less than 10 years
    return 0.4; // Older than 10 years
  }

  /**
   * Calculate completeness score
   */
  private static calculateCompletenessScore(document: any): number {
    const content = document.content || "";
    const title = document.title || document.mevzuatAdi || "";

    let score = 0.5; // Base score

    // Boost for having content
    if (content.length > 100) score += 0.2;
    if (content.length > 500) score += 0.2;

    // Boost for structured content
    if (content.includes("Madde") || content.includes("Fıkra")) {
      score += 0.1;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate intent alignment score
   */
  private static calculateIntentAlignment(
    document: any,
    context: RankingContext
  ): number {
    const intent = context.userIntent.toLowerCase();
    const docContent = (document.content || document.title || "").toLowerCase();

    const intentKeywords = {
      definition: ["tanım", "nedir", "anlamı"],
      procedure: ["nasıl", "işlem", "başvuru", "süreç"],
      rights: ["hak", "yetki", "koruma"],
      obligations: ["yükümlülük", "görev", "sorumluluk"],
      penalty: ["ceza", "yaptırım", "para cezası"],
    };

    const keywords =
      intentKeywords[intent as keyof typeof intentKeywords] || [];
    const matchedKeywords = keywords.filter((keyword) =>
      docContent.includes(keyword)
    );

    return matchedKeywords.length / Math.max(keywords.length, 1);
  }

  /**
   * Calculate complexity match score
   */
  private static calculateComplexityMatch(
    document: any,
    context: RankingContext
  ): number {
    const docComplexity = this.estimateDocumentComplexity(document);
    const queryComplexity = context.queryComplexity;

    // Prefer documents that match query complexity
    const complexityDiff = Math.abs(docComplexity - queryComplexity);
    return Math.max(0, 1 - complexityDiff / 10);
  }

  /**
   * Calculate urgency alignment score
   */
  private static calculateUrgencyAlignment(
    document: any,
    context: RankingContext
  ): number {
    const urgency = context.urgencyLevel;

    // For urgent queries, prefer practical documents
    if (urgency === "critical" || urgency === "high") {
      const docType = this.inferDocumentType(document);
      if (docType === "guidance" || docType === "circular") {
        return 1.0;
      }
    }

    return 0.7; // Neutral score
  }

  /**
   * Calculate user feedback score
   */
  private static calculateUserFeedbackScore(
    document: any,
    context: RankingContext
  ): number {
    const docId = document.id || document.mevzuatId;
    const performance = context.historicalData?.documentPerformance?.get(docId);

    if (!performance) return 0.5; // No historical data

    return Math.min(1, performance.averageRating / 5);
  }

  /**
   * Calculate click-through rate score
   */
  private static calculateClickThroughRate(
    document: any,
    context: RankingContext
  ): number {
    const docId = document.id || document.mevzuatId;
    const performance = context.historicalData?.documentPerformance?.get(docId);

    if (!performance) return 0.5; // No historical data

    return Math.min(1, performance.clickThroughRate);
  }

  /**
   * Calculate success rate score
   */
  private static calculateSuccessRate(
    document: any,
    context: RankingContext
  ): number {
    const docId = document.id || document.mevzuatId;
    const performance = context.historicalData?.documentPerformance?.get(docId);

    if (!performance) return 0.5; // No historical data

    return Math.min(1, performance.completionRate);
  }

  /**
   * Calculate final weighted score
   */
  private static calculateFinalScore(
    document: RankedDocument,
    context: RankingContext
  ): RankedDocument {
    const factors = document.rankingFactors;

    // Calculate category scores
    const contentRelevanceScore =
      factors.semanticRelevance * FACTOR_WEIGHTS.semanticRelevance +
      factors.keywordMatch * FACTOR_WEIGHTS.keywordMatch +
      factors.domainSpecificity * FACTOR_WEIGHTS.domainSpecificity;

    const documentQualityScore =
      factors.authorityScore * FACTOR_WEIGHTS.authorityScore +
      factors.freshnessScore * FACTOR_WEIGHTS.freshnessScore +
      factors.completenessScore * FACTOR_WEIGHTS.completenessScore;

    const userContextScore =
      factors.intentAlignment * FACTOR_WEIGHTS.intentAlignment +
      factors.complexityMatch * FACTOR_WEIGHTS.complexityMatch +
      factors.urgencyAlignment * FACTOR_WEIGHTS.urgencyAlignment;

    const historicalPerformanceScore =
      factors.userFeedbackScore * FACTOR_WEIGHTS.userFeedbackScore +
      factors.clickThroughRate * FACTOR_WEIGHTS.clickThroughRate +
      factors.successRate * FACTOR_WEIGHTS.successRate;

    // Calculate final weighted score
    const finalScore =
      contentRelevanceScore * RANKING_WEIGHTS.contentRelevance +
      documentQualityScore * RANKING_WEIGHTS.documentQuality +
      userContextScore * RANKING_WEIGHTS.userContext +
      historicalPerformanceScore * RANKING_WEIGHTS.historicalPerformance;

    return {
      ...document,
      finalScore: Math.min(1, Math.max(0, finalScore)),
    };
  }

  /**
   * Helper methods
   */
  private static inferDocumentType(document: any): DocumentType {
    const title = (document.title || document.mevzuatAdi || "").toLowerCase();

    if (title.includes("kanun")) return "law";
    if (title.includes("yönetmelik")) return "regulation";
    if (title.includes("kararname")) return "decree";
    if (title.includes("genelge")) return "circular";
    if (title.includes("karar")) return "court_decision";
    if (title.includes("rehber")) return "guidance";

    return "interpretation"; // Default
  }

  private static extractMetadata(document: any): DocumentMetadata {
    return {
      publicationDate: new Date(
        document.publicationDate || document.date || Date.now()
      ),
      lastModified: new Date(
        document.lastModified || document.date || Date.now()
      ),
      authority: document.authority || document.source || "Bilinmiyor",
      officialNumber: document.officialNumber || document.mevzuatNo?.toString(),
      legalDomain: document.legalDomain || "Genel Hukuk",
      documentLength: (document.content || "").length,
      language: "tr",
      isActive: document.isActive !== false,
    };
  }

  private static getDomainKeywords(domain: string): string[] {
    const keywords: Record<string, string[]> = {
      "İş Hukuku": ["kıdem", "tazminat", "işten", "çıkarma", "çalışma"],
      "Medeni Hukuk": ["boşanma", "evlilik", "miras", "velayet", "nafaka"],
      "Ceza Hukuku": ["hırsızlık", "dolandırıcılık", "tehdit", "yaralama"],
      "Ticaret Hukuku": ["şirket", "ticaret", "sözleşme", "borç"],
      "Vergi Hukuku": ["vergi", "stopaj", "beyanname", "gelir"],
    };

    return keywords[domain] || [];
  }

  private static getRelatedDomains(domain: string): string[] {
    const relations: Record<string, string[]> = {
      "İş Hukuku": ["Sosyal Güvenlik Hukuku", "İdare Hukuku"],
      "Medeni Hukuk": ["Aile Hukuku", "Miras Hukuku"],
      "Ceza Hukuku": ["Ceza Usul Hukuku", "İdare Hukuku"],
      "Ticaret Hukuku": ["Borçlar Hukuku", "Şirketler Hukuku"],
    };

    return relations[domain] || [];
  }

  private static inferDocumentDomain(document: any): string {
    // Simple domain inference based on content
    const content = (document.content || document.title || "").toLowerCase();

    if (content.includes("kıdem") || content.includes("işçi"))
      return "İş Hukuku";
    if (content.includes("boşanma") || content.includes("miras"))
      return "Medeni Hukuk";
    if (content.includes("suç") || content.includes("ceza"))
      return "Ceza Hukuku";
    if (content.includes("şirket") || content.includes("ticaret"))
      return "Ticaret Hukuku";
    if (content.includes("vergi")) return "Vergi Hukuku";

    return "Genel Hukuk";
  }

  private static estimateDocumentComplexity(document: any): number {
    const content = document.content || "";
    const title = document.title || document.mevzuatAdi || "";

    let complexity = 5; // Base complexity

    // Length factor
    if (content.length > 1000) complexity += 1;
    if (content.length > 5000) complexity += 1;

    // Structure complexity
    const articles = (content.match(/Madde \d+/g) || []).length;
    if (articles > 10) complexity += 1;
    if (articles > 50) complexity += 1;

    // Legal complexity indicators
    const complexTerms = [
      "atıfta bulunarak",
      "saklı kalmak kaydıyla",
      "bu kanun kapsamında",
    ];
    const complexTermCount = complexTerms.filter((term) =>
      content.includes(term)
    ).length;
    complexity += complexTermCount;

    return Math.min(10, complexity);
  }

  private static generateRelevanceReasons(
    factors: RankingFactors,
    document: any,
    context: RankingContext
  ): string[] {
    const reasons: string[] = [];

    if (factors.semanticRelevance > 0.8) {
      reasons.push("Sorguyla yüksek anlamsal benzerlik");
    }

    if (factors.keywordMatch > 0.7) {
      reasons.push("Alan-spesifik anahtar kelimeleri içeriyor");
    }

    if (factors.domainSpecificity > 0.9) {
      reasons.push("Tespit edilen hukuk alanına tam uygun");
    }

    if (factors.authorityScore > 0.8) {
      reasons.push("Yüksek otoriteli kaynak");
    }

    if (factors.freshnessScore > 0.8) {
      reasons.push("Güncel mevzuat");
    }

    return reasons;
  }

  private static calculateRankingMetrics(
    rankedDocuments: RankedDocument[]
  ): RankingMetrics {
    const totalDocuments = rankedDocuments.length;
    const averageFinalScore =
      totalDocuments > 0
        ? rankedDocuments.reduce((sum, doc) => sum + doc.finalScore, 0) /
          totalDocuments
        : 0;

    // Score distribution
    const scoreDistribution: ScoreDistribution = {
      excellent: rankedDocuments.filter((doc) => doc.finalScore >= 0.8).length,
      good: rankedDocuments.filter(
        (doc) => doc.finalScore >= 0.6 && doc.finalScore < 0.8
      ).length,
      fair: rankedDocuments.filter(
        (doc) => doc.finalScore >= 0.4 && doc.finalScore < 0.6
      ).length,
      poor: rankedDocuments.filter(
        (doc) => doc.finalScore >= 0.2 && doc.finalScore < 0.4
      ).length,
      veryPoor: rankedDocuments.filter((doc) => doc.finalScore < 0.2).length,
    };

    // Diversity score (variety of document types)
    const uniqueTypes = new Set(rankedDocuments.map((doc) => doc.documentType));
    const diversityScore =
      uniqueTypes.size / Object.keys(DOCUMENT_TYPE_AUTHORITY).length;

    // Coverage score (how well results cover the query)
    const coverageScore = Math.min(1, averageFinalScore * 1.2);

    return {
      totalDocuments,
      averageFinalScore,
      scoreDistribution,
      diversityScore,
      coverageScore,
    };
  }

  private static generateRankingExplanation(
    rankedDocuments: RankedDocument[],
    context: RankingContext
  ): string {
    if (rankedDocuments.length === 0) {
      return `"${context.detectedDomain}" alanında sıralama yapılacak sonuç bulunamadı. Semantic filtering tüm sonuçları eledi.`;
    }

    const topDoc = rankedDocuments[0];
    const avgScore =
      rankedDocuments.reduce((sum, doc) => sum + doc.finalScore, 0) /
      rankedDocuments.length;

    return (
      `${rankedDocuments.length} sonuç "${context.detectedDomain}" alanında sıralandı. ` +
      `En yüksek skor: ${Math.round(topDoc.finalScore * 100)}%. ` +
      `Ortalama skor: ${Math.round(avgScore * 100)}%. ` +
      `Sıralama faktörleri: içerik relevansı (%40), doküman kalitesi (%25), ` +
      `kullanıcı bağlamı (%20), geçmiş performans (%15).`
    );
  }

  private static calculateRankingConfidence(
    rankedDocuments: RankedDocument[],
    metrics: RankingMetrics
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost for high-quality top results
    if (rankedDocuments.length > 0 && rankedDocuments[0].finalScore > 0.8) {
      confidence += 0.2;
    }

    // Boost for good average scores
    if (metrics.averageFinalScore > 0.6) {
      confidence += 0.2;
    }

    // Boost for diversity
    confidence += metrics.diversityScore * 0.1;

    return Math.min(1, confidence);
  }
}
