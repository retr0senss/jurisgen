// 🚀 SPRINT 4: Enhanced Intent Classification System
// Domain-specific intent detection with legal category classification and priority scoring

import {
  TurkishQueryExpander,
  type QueryExpansionResult,
  type ExpansionContext,
} from "./query-expansion";
import {
  AdvancedConfidenceScorer,
  type ConfidenceResult,
} from "./confidence-scoring";

export interface EnhancedIntentResult {
  // Primary classification
  legalDomain: string;
  domainConfidence: number;

  // Intent classification
  primaryIntent: LegalIntent;
  secondaryIntents: LegalIntent[];
  intentConfidence: number;

  // Query analysis
  queryType: QueryType;
  userGoal: UserGoal;
  urgencyLevel: UrgencyLevel;
  complexityScore: number;

  // Search strategy
  searchStrategy: SearchStrategy;
  prioritizedTerms: string[];
  fallbackStrategies: string[];

  // Expansion and confidence
  queryExpansion: QueryExpansionResult;
  confidenceAnalysis: ConfidenceResult;

  // Recommendations
  processingRecommendations: ProcessingRecommendation[];
  userGuidance: string[];

  // Metadata
  processingTime: number;
  reasoning: string;
}

export type LegalIntent =
  | "definition_request" // "X nedir?"
  | "procedure_inquiry" // "Nasıl yapılır?"
  | "rights_question" // "Haklarım neler?"
  | "obligation_inquiry" // "Yükümlülüklerim neler?"
  | "penalty_question" // "Cezası nedir?"
  | "document_request" // "Hangi belge gerekli?"
  | "timeline_question" // "Ne kadar sürer?"
  | "cost_inquiry" // "Maliyeti nedir?"
  | "legal_advice" // "Ne yapmalıyım?"
  | "case_analysis" // "Durumum nasıl?"
  | "precedent_search" // "Benzer kararlar"
  | "legislation_lookup"; // "Hangi kanun?"

export type QueryType =
  | "simple_factual" // Basit bilgi sorusu
  | "complex_analytical" // Karmaşık analiz gerektirir
  | "procedural" // İşlem/süreç odaklı
  | "comparative" // Karşılaştırma yapar
  | "hypothetical" // Varsayımsal senaryo
  | "urgent_practical"; // Acil pratik ihtiyaç

export type UserGoal =
  | "learn_understand" // Öğrenmek/anlamak
  | "solve_problem" // Problem çözmek
  | "prepare_action" // Eylem hazırlamak
  | "verify_compliance" // Uyumluluk kontrol
  | "assess_risk" // Risk değerlendirme
  | "find_precedent"; // Emsal bulmak

export type UrgencyLevel =
  | "critical" // Kritik (hemen)
  | "high" // Yüksek (bugün)
  | "medium" // Orta (bu hafta)
  | "low" // Düşük (zamanında)
  | "research"; // Araştırma (acele yok)

export type SearchStrategy =
  | "precise_match" // Kesin eşleşme
  | "semantic_broad" // Geniş anlamsal
  | "hierarchical_drill" // Hiyerarşik detay
  | "comparative_analysis" // Karşılaştırmalı
  | "contextual_expansion"; // Bağlamsal genişletme

export interface ProcessingRecommendation {
  type:
    | "search_strategy"
    | "user_guidance"
    | "result_filtering"
    | "confidence_boost";
  priority: number;
  action: string;
  reasoning: string;
}

// Intent detection patterns for Turkish legal queries
const INTENT_PATTERNS: Record<LegalIntent, RegExp[]> = {
  definition_request: [
    /(.+)\s+(nedir|ne demek|tanımı|anlamı)/i,
    /(nedir|ne demek)\s+(.+)/i,
    /(.+)\s+(nasıl tanımlanır)/i,
  ],
  procedure_inquiry: [
    /(nasıl|ne şekilde)\s+(.+)/i,
    /(.+)\s+(nasıl yapılır|nasıl olur|prosedürü)/i,
    /(hangi adımlar|işlem süreci|başvuru)/i,
  ],
  rights_question: [
    /(hak|haklar|haklarım)\s+(.+)/i,
    /(.+)\s+(hakkım|haklarım|yetkilerim)/i,
    /(ne gibi haklar|hangi haklar)/i,
  ],
  obligation_inquiry: [
    /(yükümlülük|görev|sorumluluk)\s+(.+)/i,
    /(.+)\s+(yükümlülüğü|görevi|sorumluluğu)/i,
    /(ne yapmak zorunda|hangi yükümlülükler)/i,
  ],
  penalty_question: [
    /(ceza|cezası|yaptırım)\s+(.+)/i,
    /(.+)\s+(cezası nedir|yaptırımı|para cezası)/i,
    /(hangi ceza|ne kadar ceza)/i,
  ],
  document_request: [
    /(belge|evrak|doküman)\s+(.+)/i,
    /(.+)\s+(için hangi belge|belgeler gerekli)/i,
    /(hangi evraklar|gerekli belgeler)/i,
  ],
  timeline_question: [
    /(ne kadar sürer|süre|zaman)\s+(.+)/i,
    /(.+)\s+(ne kadar sürer|süresi|zamanı)/i,
    /(kaç gün|kaç ay|ne zaman)/i,
  ],
  cost_inquiry: [
    /(maliyet|ücret|harç|masraf)\s+(.+)/i,
    /(.+)\s+(maliyeti|ücreti|harcı|masrafı)/i,
    /(ne kadar tutar|kaça mal olur)/i,
  ],
  legal_advice: [
    /(ne yapmalı|ne yapabilirim|tavsiye)\s+(.+)/i,
    /(.+)\s+(durumunda ne yapmalı|önerisi)/i,
    /(nasıl hareket etmeli|hangi yolu izlemeli)/i,
  ],
  case_analysis: [
    /(durumum|halim|vaziyetim)\s+(.+)/i,
    /(.+)\s+(açısından durumum|konusunda halim)/i,
    /(bu durumda|böyle bir durumda)/i,
  ],
  precedent_search: [
    /(emsal|benzer karar|içtihat)\s+(.+)/i,
    /(.+)\s+(hakkında emsal|benzer kararlar)/i,
    /(mahkeme kararları|yargı kararları)/i,
  ],
  legislation_lookup: [
    /(hangi kanun|kanun|mevzuat)\s+(.+)/i,
    /(.+)\s+(hangi kanunda|kanunu|mevzuatı)/i,
    /(yasal düzenleme|hukuki düzenleme)/i,
  ],
};

// Query type detection patterns
const QUERY_TYPE_PATTERNS: Record<QueryType, RegExp[]> = {
  simple_factual: [/(nedir|ne demek|tanımı|anlamı)/i, /(kaç|ne kadar|hangi)/i],
  complex_analytical: [
    /(karşılaştır|analiz|değerlendir|incele)/i,
    /(avantaj|dezavantaj|fark|benzerlik)/i,
  ],
  procedural: [
    /(nasıl|ne şekilde|adım|prosedür|işlem)/i,
    /(başvuru|süreç|yöntem)/i,
  ],
  comparative: [/(fark|karşılaştır|hangisi|seçenek)/i, /(arasında|ile|veya)/i],
  hypothetical: [
    /(eğer|varsayalım|diyelim|olursa)/i,
    /(durumunda|halinde|takdirde)/i,
  ],
  urgent_practical: [
    /(acil|hemen|ivedi|derhal)/i,
    /(ne yapmalı|nasıl hareket|acilen)/i,
  ],
};

// Urgency indicators
const URGENCY_INDICATORS = {
  critical: ["acil", "hemen", "derhal", "ivedi", "kritik"],
  high: ["bugün", "yarın", "çabuk", "süratle"],
  medium: ["bu hafta", "yakında", "en kısa zamanda"],
  low: ["zamanında", "uygun zamanda", "müsait olduğumda"],
  research: ["araştırma", "inceleme", "öğrenmek", "merak"],
};

export class EnhancedIntentClassifier {
  /**
   * Main enhanced intent classification function
   */
  static async classifyIntent(
    userQuery: string
  ): Promise<EnhancedIntentResult> {
    const startTime = Date.now();

    // Step 1: Basic domain detection (using existing system)
    const basicDomainResult = await this.detectBasicDomain(userQuery);

    // Step 2: Enhanced intent analysis
    const intentAnalysis = this.analyzeUserIntent(userQuery);

    // Step 3: Query type and goal classification
    const queryClassification = this.classifyQueryCharacteristics(userQuery);

    // Step 4: Search strategy determination
    const searchStrategy = this.determineSearchStrategy(
      intentAnalysis,
      queryClassification,
      basicDomainResult
    );

    // Step 5: Query expansion
    const expansionContext: ExpansionContext = {
      legalDomain: basicDomainResult.domain,
      detectedKeywords: this.extractKeywords(userQuery),
      userIntent: this.mapToExpansionIntent(intentAnalysis.primaryIntent),
      formalityLevel: "mixed",
    };

    const queryExpansion = await TurkishQueryExpander.expandQuery(
      userQuery,
      expansionContext
    );

    // Step 6: Confidence analysis
    const confidenceContext = {
      userQuery,
      detectedDomain: basicDomainResult.domain,
      searchResults: [], // Would be populated with actual results
      queryComplexity: queryClassification.complexityScore,
    };

    const confidenceAnalysis =
      AdvancedConfidenceScorer.calculateConfidence(confidenceContext);

    // Step 7: Processing recommendations
    const recommendations = this.generateProcessingRecommendations(
      intentAnalysis,
      queryClassification,
      confidenceAnalysis
    );

    // Step 8: User guidance
    const userGuidance = this.generateUserGuidance(
      intentAnalysis,
      queryClassification,
      confidenceAnalysis
    );

    const processingTime = Date.now() - startTime;

    return {
      legalDomain: basicDomainResult.domain,
      domainConfidence: basicDomainResult.confidence,
      primaryIntent: intentAnalysis.primaryIntent,
      secondaryIntents: intentAnalysis.secondaryIntents,
      intentConfidence: intentAnalysis.confidence,
      queryType: queryClassification.queryType,
      userGoal: queryClassification.userGoal,
      urgencyLevel: queryClassification.urgencyLevel,
      complexityScore: queryClassification.complexityScore,
      searchStrategy: searchStrategy.strategy,
      prioritizedTerms: searchStrategy.prioritizedTerms,
      fallbackStrategies: searchStrategy.fallbackStrategies,
      queryExpansion,
      confidenceAnalysis,
      processingRecommendations: recommendations,
      userGuidance,
      processingTime,
      reasoning: this.generateReasoning(
        basicDomainResult,
        intentAnalysis,
        queryClassification,
        processingTime
      ),
    };
  }

  /**
   * Detect basic legal domain (simplified version of existing system)
   */
  private static async detectBasicDomain(
    query: string
  ): Promise<{ domain: string; confidence: number }> {
    // This would use the existing domain detection system
    // For now, simplified implementation
    const domainKeywords = {
      "İş Hukuku": [
        "kıdem",
        "tazminat",
        "işten",
        "çıkarma",
        "çalışma",
        "mesai",
      ],
      "Medeni Hukuk": ["boşanma", "evlilik", "miras", "velayet", "nafaka"],
      "Ceza Hukuku": [
        "hırsızlık",
        "dolandırıcılık",
        "tehdit",
        "yaralama",
        "suç",
      ],
      "Ticaret Hukuku": ["şirket", "ticaret", "sözleşme", "borç"],
      "Vergi Hukuku": ["vergi", "stopaj", "beyanname", "gelir"],
      "Turizm Hukuku": ["turizm", "otel", "rehber", "tur"],
    };

    const lowerQuery = query.toLowerCase();
    let bestDomain = "Genel Hukuk";
    let bestScore = 0;

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const matches = keywords.filter((keyword) =>
        lowerQuery.includes(keyword)
      );
      const score = matches.length / keywords.length;

      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    return {
      domain: bestDomain,
      confidence: Math.max(0.3, bestScore),
    };
  }

  /**
   * Analyze user intent from query
   */
  private static analyzeUserIntent(query: string): {
    primaryIntent: LegalIntent;
    secondaryIntents: LegalIntent[];
    confidence: number;
  } {
    const intentScores: Record<LegalIntent, number> = {} as any;

    // Score each intent based on pattern matching
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          score += 1;
        }
      }
      intentScores[intent as LegalIntent] = score;
    }

    // Sort by score
    const sortedIntents = Object.entries(intentScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    const primaryIntent =
      (sortedIntents[0]?.[0] as LegalIntent) || "definition_request";
    const secondaryIntents = sortedIntents
      .slice(1, 3)
      .map(([intent]) => intent as LegalIntent);

    const confidence =
      sortedIntents.length > 0 ? Math.min(1, sortedIntents[0][1] / 3) : 0.3;

    return {
      primaryIntent,
      secondaryIntents,
      confidence,
    };
  }

  /**
   * Classify query characteristics
   */
  private static classifyQueryCharacteristics(query: string): {
    queryType: QueryType;
    userGoal: UserGoal;
    urgencyLevel: UrgencyLevel;
    complexityScore: number;
  } {
    // Determine query type
    let queryType: QueryType = "simple_factual";
    let maxTypeScore = 0;

    for (const [type, patterns] of Object.entries(QUERY_TYPE_PATTERNS)) {
      const score = patterns.reduce(
        (acc, pattern) => acc + (pattern.test(query) ? 1 : 0),
        0
      );

      if (score > maxTypeScore) {
        maxTypeScore = score;
        queryType = type as QueryType;
      }
    }

    // Determine user goal based on intent patterns
    const userGoal = this.inferUserGoal(query, queryType);

    // Determine urgency level
    const urgencyLevel = this.detectUrgencyLevel(query);

    // Calculate complexity score
    const complexityScore = this.calculateComplexityScore(query);

    return {
      queryType,
      userGoal,
      urgencyLevel,
      complexityScore,
    };
  }

  /**
   * Infer user goal from query and type
   */
  private static inferUserGoal(query: string, queryType: QueryType): UserGoal {
    const goalKeywords = {
      learn_understand: ["nedir", "anlamı", "öğrenmek", "bilmek"],
      solve_problem: ["problem", "sorun", "ne yapmalı", "çözüm"],
      prepare_action: ["hazırlık", "başvuru", "işlem", "adım"],
      verify_compliance: ["uygun", "doğru", "geçerli", "yasal"],
      assess_risk: ["risk", "tehlike", "sorumluluk", "ceza"],
      find_precedent: ["emsal", "benzer", "örnek", "karar"],
    };

    const lowerQuery = query.toLowerCase();

    for (const [goal, keywords] of Object.entries(goalKeywords)) {
      if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
        return goal as UserGoal;
      }
    }

    // Default based on query type
    switch (queryType) {
      case "procedural":
        return "prepare_action";
      case "complex_analytical":
        return "assess_risk";
      case "urgent_practical":
        return "solve_problem";
      default:
        return "learn_understand";
    }
  }

  /**
   * Detect urgency level from query
   */
  private static detectUrgencyLevel(query: string): UrgencyLevel {
    const lowerQuery = query.toLowerCase();

    for (const [level, indicators] of Object.entries(URGENCY_INDICATORS)) {
      if (indicators.some((indicator) => lowerQuery.includes(indicator))) {
        return level as UrgencyLevel;
      }
    }

    return "medium"; // Default urgency
  }

  /**
   * Calculate query complexity score (0-10)
   */
  private static calculateComplexityScore(query: string): number {
    let complexity = 0;

    // Length factor
    complexity += Math.min(3, query.length / 50);

    // Word count factor
    const wordCount = query.split(/\s+/).length;
    complexity += Math.min(2, wordCount / 10);

    // Multiple concepts
    const concepts = ["ve", "veya", "aynı zamanda", "ayrıca"];
    if (concepts.some((concept) => query.toLowerCase().includes(concept))) {
      complexity += 2;
    }

    // Question complexity
    const questionWords = query.match(/(nasıl|neden|ne zaman|nerede|kim)/gi);
    if (questionWords && questionWords.length > 1) {
      complexity += 1;
    }

    // Legal complexity indicators
    const complexLegal = ["karşılaştır", "analiz", "değerlendir", "emsal"];
    if (complexLegal.some((term) => query.toLowerCase().includes(term))) {
      complexity += 2;
    }

    return Math.min(10, complexity);
  }

  /**
   * Determine optimal search strategy
   */
  private static determineSearchStrategy(
    intentAnalysis: any,
    queryClassification: any,
    domainResult: any
  ): {
    strategy: SearchStrategy;
    prioritizedTerms: string[];
    fallbackStrategies: string[];
  } {
    let strategy: SearchStrategy = "semantic_broad";
    const fallbackStrategies: string[] = [];

    // Strategy based on intent
    switch (intentAnalysis.primaryIntent) {
      case "definition_request":
        strategy = "precise_match";
        fallbackStrategies.push("semantic_broad");
        break;
      case "procedure_inquiry":
        strategy = "hierarchical_drill";
        fallbackStrategies.push("contextual_expansion");
        break;
      case "comparative":
        strategy = "comparative_analysis";
        fallbackStrategies.push("semantic_broad");
        break;
      default:
        strategy = "semantic_broad";
        fallbackStrategies.push("precise_match", "contextual_expansion");
    }

    // Adjust based on complexity
    if (queryClassification.complexityScore > 7) {
      strategy = "contextual_expansion";
    }

    // Prioritized terms (simplified)
    const prioritizedTerms = this.extractKeywords(intentAnalysis.query || "");

    return {
      strategy,
      prioritizedTerms,
      fallbackStrategies,
    };
  }

  /**
   * Extract keywords from query
   */
  private static extractKeywords(query: string): string[] {
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

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to top 10 keywords
  }

  /**
   * Map to expansion intent
   */
  private static mapToExpansionIntent(
    intent: LegalIntent
  ): ExpansionContext["userIntent"] {
    const mapping: Record<LegalIntent, ExpansionContext["userIntent"]> = {
      definition_request: "definition",
      procedure_inquiry: "procedure",
      rights_question: "rights",
      obligation_inquiry: "obligations",
      penalty_question: "penalty",
      document_request: "procedure",
      timeline_question: "procedure",
      cost_inquiry: "general",
      legal_advice: "general",
      case_analysis: "general",
      precedent_search: "general",
      legislation_lookup: "general",
    };

    return mapping[intent] || "general";
  }

  /**
   * Generate processing recommendations
   */
  private static generateProcessingRecommendations(
    intentAnalysis: any,
    queryClassification: any,
    confidenceAnalysis: ConfidenceResult
  ): ProcessingRecommendation[] {
    const recommendations: ProcessingRecommendation[] = [];

    // Search strategy recommendations
    if (confidenceAnalysis.overallConfidence < 0.6) {
      recommendations.push({
        type: "search_strategy",
        priority: 1,
        action: "Daha geniş arama stratejisi kullan",
        reasoning: "Düşük güven skoru nedeniyle",
      });
    }

    // User guidance recommendations
    if (queryClassification.complexityScore > 7) {
      recommendations.push({
        type: "user_guidance",
        priority: 2,
        action: "Kullanıcıya sorguyu basitleştirmesini öner",
        reasoning: "Yüksek karmaşıklık skoru",
      });
    }

    return recommendations;
  }

  /**
   * Generate user guidance messages
   */
  private static generateUserGuidance(
    intentAnalysis: any,
    queryClassification: any,
    confidenceAnalysis: ConfidenceResult
  ): string[] {
    const guidance: string[] = [];

    if (confidenceAnalysis.overallConfidence < 0.5) {
      guidance.push("Sorunuzu daha spesifik hale getirmeyi deneyin");
    }

    if (queryClassification.urgencyLevel === "critical") {
      guidance.push("Acil durumlar için hukuki danışman ile iletişime geçin");
    }

    return guidance;
  }

  /**
   * Generate comprehensive reasoning
   */
  private static generateReasoning(
    domainResult: any,
    intentAnalysis: any,
    queryClassification: any,
    processingTime: number
  ): string {
    return (
      `Alan: ${domainResult.domain} (${Math.round(
        domainResult.confidence * 100
      )}%). ` +
      `Amaç: ${intentAnalysis.primaryIntent} (${Math.round(
        intentAnalysis.confidence * 100
      )}%). ` +
      `Sorgu tipi: ${queryClassification.queryType}. ` +
      `Karmaşıklık: ${queryClassification.complexityScore}/10. ` +
      `İşlem süresi: ${processingTime}ms.`
    );
  }
}
