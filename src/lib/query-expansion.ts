// 🚀 SPRINT 4: Advanced Query Expansion System
// Turkish legal term expansion, synonyms, and context-aware query broadening

export interface QueryExpansionResult {
  originalQuery: string;
  expandedTerms: string[];
  synonyms: string[];
  relatedConcepts: string[];
  contextualTerms: string[];
  legalVariations: string[];
  confidence: number;
  expansionReasoning: string;
}

export interface ExpansionContext {
  legalDomain: string;
  detectedKeywords: string[];
  userIntent:
    | "definition"
    | "procedure"
    | "rights"
    | "obligations"
    | "penalty"
    | "general";
  formalityLevel: "formal" | "informal" | "mixed";
}

// Turkish Legal Term Dictionary - Comprehensive expansion mappings
const TURKISH_LEGAL_SYNONYMS: Record<string, string[]> = {
  // İş Hukuku
  "kıdem tazminatı": [
    "kıdem",
    "hizmet tazminatı",
    "işten çıkarma tazminatı",
    "kıdem ödeneği",
  ],
  "işten çıkarma": [
    "işten çıkarılma",
    "iş akdinin feshi",
    "iş sözleşmesi feshi",
    "işine son verme",
  ],
  "ihbar tazminatı": [
    "ihbar ödeneği",
    "bildirim tazminatı",
    "öncelikle bildirim tazminatı",
  ],
  "fazla mesai": [
    "ek mesai",
    "fazla çalışma",
    "normal mesai üstü çalışma",
    "overtime",
  ],
  "yıllık izin": ["yıllık ücretli izin", "senelik izin", "ücretli izin"],
  "iş sözleşmesi": [
    "iş akdi",
    "çalışma sözleşmesi",
    "hizmet akdi",
    "istihdam sözleşmesi",
  ],

  // Medeni Hukuk
  boşanma: [
    "evliliğin sona ermesi",
    "izdivaç feshi",
    "ayrılık",
    "evlilik birliğinin sona ermesi",
  ],
  miras: ["tereke", "miras paylaşımı", "veraset", "mirasçılık"],
  velayet: [
    "çocuk velayeti",
    "çocuğun bakımı",
    "çocuk hakları",
    "ebeveyn hakları",
  ],
  nafaka: ["nafaka ödeneği", "çocuk nafakası", "eş nafakası", "bakım nafakası"],
  "mal rejimi": [
    "evlilik mal rejimi",
    "mal ayrılığı",
    "mal birliği",
    "edinilmiş mallara katılma",
  ],

  // Ceza Hukuku
  hırsızlık: ["çalma", "hırsızlık suçu", "mal çalma", "eşya çalma"],
  dolandırıcılık: ["dolandırma", "sahtecilik", "aldatma", "hileli davranış"],
  tehdit: ["tehdit etme", "korkutma", "gözdağı verme", "sindirme"],
  yaralama: ["müessir fiil", "darp", "fiziksel saldırı", "bedeni zarar verme"],

  // Ticaret Hukuku
  şirket: [
    "ticaret şirketi",
    "limited şirket",
    "anonim şirket",
    "kollektif şirket",
  ],
  ticaret: ["ticari faaliyet", "ticari işlem", "alım satım", "ticari muamele"],
  sözleşme: ["akid", "anlaşma", "mukavelename", "kontrat"],

  // Vergi Hukuku
  vergi: ["vergi yükümlülüğü", "vergi borcu", "vergi ödevi", "mali yükümlülük"],
  stopaj: ["stopaj vergisi", "kaynakta kesinti", "peşin vergi", "tevkifat"],
  beyanname: ["vergi beyannamesi", "vergi bildirimi", "vergi raporu"],

  // Turizm Hukuku
  turizm: [
    "turizm işletmesi",
    "turizm faaliyeti",
    "turizm sektörü",
    "turistik hizmet",
  ],
  otel: ["konaklama tesisi", "turizm tesisi", "pansiyon", "turistik tesis"],
  rehberlik: ["turist rehberliği", "tur rehberliği", "profesyonel rehberlik"],
};

// Context-aware term expansion based on legal domain
const DOMAIN_CONTEXTUAL_TERMS: Record<string, Record<string, string[]>> = {
  "İş Hukuku": {
    tazminat: [
      "kıdem tazminatı",
      "ihbar tazminatı",
      "işsizlik tazminatı",
      "iş kazası tazminatı",
    ],
    çalışma: [
      "çalışma saatleri",
      "çalışma koşulları",
      "çalışma hayatı",
      "çalışma güvenliği",
    ],
    izin: [
      "yıllık izin",
      "hastalık izni",
      "doğum izni",
      "babalık izni",
      "mazeret izni",
    ],
    sigorta: [
      "iş güvenliği sigortası",
      "işçi sigortası",
      "sosyal güvenlik",
      "SGK",
    ],
  },
  "Medeni Hukuk": {
    çocuk: [
      "çocuk hakları",
      "çocuk velayeti",
      "çocuk nafakası",
      "çocuğun menfaati",
    ],
    evlilik: ["evlilik birliği", "evlilik akdi", "evlilik şartları", "nikah"],
    miras: ["miras hukuku", "miras payı", "saklı pay", "miras sözleşmesi"],
    mal: ["mal rejimi", "mal ayrılığı", "mal birliği", "edinilmiş mallar"],
  },
  "Ceza Hukuku": {
    suç: ["suç unsurları", "suçun oluşumu", "suç türleri", "suç ve ceza"],
    ceza: ["hapis cezası", "para cezası", "seçenek yaptırım", "ceza indirimi"],
    dava: ["ceza davası", "kamu davası", "özel dava", "dava süreci"],
  },
  "Ticaret Hukuku": {
    şirket: [
      "şirket türleri",
      "şirket kuruluşu",
      "şirket yönetimi",
      "şirket feshi",
    ],
    ticaret: [
      "ticaret kanunu",
      "ticaret hukuku",
      "ticari işlemler",
      "ticari defter",
    ],
    borç: ["ticari borç", "borç ilişkisi", "borçlar hukuku", "borç ödeme"],
  },
};

// Legal procedure and process terms
const LEGAL_PROCEDURE_TERMS: Record<string, string[]> = {
  nasıl: ["prosedür", "işlem", "süreç", "adımlar", "gereksinimler"],
  hangi: ["türler", "çeşitler", "kategoriler", "sınıflandırma"],
  "ne zaman": ["süre", "zaman", "tarih", "deadline", "vade"],
  nerede: ["yer", "makam", "kurum", "daire", "birim"],
  kimler: ["taraflar", "kişiler", "sorumlu", "yetkili"],
};

// Turkish morphological variations
const MORPHOLOGICAL_VARIATIONS: Record<string, string[]> = {
  // Possessive and case variations
  tazminat: ["tazminatı", "tazminatın", "tazminata", "tazminattan"],
  hak: ["hakkı", "hakkın", "hakka", "haktan", "haklar", "haklarım"],
  borç: ["borcu", "borcun", "borca", "borçtan", "borçlar"],
  ceza: ["cezası", "cezasın", "cezaya", "cezadan", "cezalar"],
  dava: ["davası", "davasın", "davaya", "davadan", "davalar"],
};

export class TurkishQueryExpander {
  /**
   * Main query expansion function
   */
  static async expandQuery(
    originalQuery: string,
    context: ExpansionContext
  ): Promise<QueryExpansionResult> {
    const startTime = Date.now();

    // Normalize and extract base terms
    const normalizedQuery = this.normalizeQuery(originalQuery);
    const baseTerms = this.extractBaseTerms(normalizedQuery);

    // Generate different types of expansions
    const synonyms = this.generateSynonyms(baseTerms);
    const relatedConcepts = this.generateRelatedConcepts(
      baseTerms,
      context.legalDomain
    );
    const contextualTerms = this.generateContextualTerms(baseTerms, context);
    const legalVariations = this.generateLegalVariations(
      baseTerms,
      context.userIntent
    );
    const morphologicalVariations =
      this.generateMorphologicalVariations(baseTerms);

    // Combine all expansions
    const allExpansions = [
      ...synonyms,
      ...relatedConcepts,
      ...contextualTerms,
      ...legalVariations,
      ...morphologicalVariations,
    ];

    // Remove duplicates and filter
    const expandedTerms = this.filterAndRankExpansions(
      allExpansions,
      originalQuery,
      context
    );

    // Calculate confidence based on expansion quality
    const confidence = this.calculateExpansionConfidence(
      baseTerms,
      expandedTerms,
      context
    );

    const processingTime = Date.now() - startTime;

    return {
      originalQuery,
      expandedTerms,
      synonyms,
      relatedConcepts,
      contextualTerms,
      legalVariations,
      confidence,
      expansionReasoning: this.generateExpansionReasoning(
        baseTerms,
        expandedTerms,
        context,
        processingTime
      ),
    };
  }

  /**
   * Normalize Turkish query text
   */
  private static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\wçğıöşüâîû\s]/g, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Extract meaningful base terms from query
   */
  private static extractBaseTerms(query: string): string[] {
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
      "mı",
      "mi",
      "mu",
      "mü",
      "da",
      "de",
      "ta",
      "te",
    ]);

    return query
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.has(term))
      .filter((term) => /[çğıöşüâîû]/.test(term) || term.length > 3); // Keep Turkish or longer terms
  }

  /**
   * Generate synonyms for base terms
   */
  private static generateSynonyms(baseTerms: string[]): string[] {
    const synonyms: string[] = [];

    for (const term of baseTerms) {
      // Direct synonym lookup
      if (TURKISH_LEGAL_SYNONYMS[term]) {
        synonyms.push(...TURKISH_LEGAL_SYNONYMS[term]);
      }

      // Partial matching for compound terms
      for (const [key, values] of Object.entries(TURKISH_LEGAL_SYNONYMS)) {
        if (key.includes(term) || term.includes(key)) {
          synonyms.push(...values);
        }
      }
    }

    return [...new Set(synonyms)];
  }

  /**
   * Generate domain-specific related concepts
   */
  private static generateRelatedConcepts(
    baseTerms: string[],
    domain: string
  ): string[] {
    const concepts: string[] = [];
    const domainTerms = DOMAIN_CONTEXTUAL_TERMS[domain] || {};

    for (const term of baseTerms) {
      for (const [concept, relatedTerms] of Object.entries(domainTerms)) {
        if (term.includes(concept) || concept.includes(term)) {
          concepts.push(...relatedTerms);
        }
      }
    }

    return [...new Set(concepts)];
  }

  /**
   * Generate contextual terms based on user intent
   */
  private static generateContextualTerms(
    baseTerms: string[],
    context: ExpansionContext
  ): string[] {
    const contextual: string[] = [];

    // Add procedure-related terms if query asks "how"
    for (const term of baseTerms) {
      if (LEGAL_PROCEDURE_TERMS[term]) {
        contextual.push(...LEGAL_PROCEDURE_TERMS[term]);
      }
    }

    // Add intent-specific terms
    switch (context.userIntent) {
      case "procedure":
        contextual.push("süreç", "işlem", "adımlar", "prosedür", "başvuru");
        break;
      case "rights":
        contextual.push("haklar", "yetkiler", "koruma", "güvence");
        break;
      case "obligations":
        contextual.push("yükümlülükler", "sorumluluklar", "görevler");
        break;
      case "penalty":
        contextual.push("ceza", "yaptırım", "para cezası", "hapis");
        break;
    }

    return [...new Set(contextual)];
  }

  /**
   * Generate legal variations and formal terms
   */
  private static generateLegalVariations(
    baseTerms: string[],
    intent: string
  ): string[] {
    const variations: string[] = [];

    for (const term of baseTerms) {
      // Add formal legal equivalents
      variations.push(`${term} kanunu`);
      variations.push(`${term} mevzuatı`);
      variations.push(`${term} yönetmeliği`);

      // Add specific legal contexts
      if (intent === "definition") {
        variations.push(`${term} tanımı`);
        variations.push(`${term} nedir`);
      }
    }

    return variations;
  }

  /**
   * Generate morphological variations for Turkish
   */
  private static generateMorphologicalVariations(
    baseTerms: string[]
  ): string[] {
    const variations: string[] = [];

    for (const term of baseTerms) {
      if (MORPHOLOGICAL_VARIATIONS[term]) {
        variations.push(...MORPHOLOGICAL_VARIATIONS[term]);
      }

      // Generate common Turkish suffixes
      variations.push(
        `${term}ı`,
        `${term}i`,
        `${term}u`,
        `${term}ü`, // Accusative
        `${term}ın`,
        `${term}in`,
        `${term}un`,
        `${term}ün`, // Genitive
        `${term}a`,
        `${term}e`, // Dative
        `${term}dan`,
        `${term}den`,
        `${term}tan`,
        `${term}ten`, // Ablative
        `${term}lar`,
        `${term}ler` // Plural
      );
    }

    return variations;
  }

  /**
   * Filter and rank expansions by relevance
   */
  private static filterAndRankExpansions(
    expansions: string[],
    originalQuery: string,
    context: ExpansionContext
  ): string[] {
    // Remove duplicates
    const unique = [...new Set(expansions)];

    // Filter out very short or generic terms
    const filtered = unique.filter(
      (term) => term.length > 2 && !term.match(/^(bir|bu|şu|ve|da|de)$/)
    );

    // Score and sort by relevance
    const scored = filtered.map((term) => ({
      term,
      score: this.calculateTermRelevance(term, originalQuery, context),
    }));

    // Sort by score and return top terms
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Limit to top 20 expansions
      .map((item) => item.term);
  }

  /**
   * Calculate relevance score for expanded term
   */
  private static calculateTermRelevance(
    term: string,
    originalQuery: string,
    context: ExpansionContext
  ): number {
    let score = 0;

    // Base score for term length (prefer meaningful terms)
    score += Math.min(term.length / 10, 1);

    // Bonus for domain-specific terms
    const domainTerms = DOMAIN_CONTEXTUAL_TERMS[context.legalDomain] || {};
    for (const conceptTerms of Object.values(domainTerms)) {
      if (conceptTerms.includes(term)) {
        score += 2;
        break;
      }
    }

    // Bonus for direct synonyms
    for (const synonyms of Object.values(TURKISH_LEGAL_SYNONYMS)) {
      if (synonyms.includes(term)) {
        score += 1.5;
        break;
      }
    }

    // Penalty for very generic terms
    const genericTerms = ["kanun", "hukuk", "madde", "fıkra"];
    if (genericTerms.some((generic) => term.includes(generic))) {
      score -= 0.5;
    }

    return score;
  }

  /**
   * Calculate overall expansion confidence
   */
  private static calculateExpansionConfidence(
    baseTerms: string[],
    expandedTerms: string[],
    context: ExpansionContext
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on number of successful expansions
    const expansionRatio = expandedTerms.length / Math.max(baseTerms.length, 1);
    confidence += Math.min(expansionRatio / 10, 0.3);

    // Boost for domain-specific expansions
    const domainTerms = DOMAIN_CONTEXTUAL_TERMS[context.legalDomain] || {};
    const domainSpecificCount = expandedTerms.filter((term) =>
      Object.values(domainTerms).some((terms) => terms.includes(term))
    ).length;

    confidence += (domainSpecificCount / expandedTerms.length) * 0.2;

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate human-readable expansion reasoning
   */
  private static generateExpansionReasoning(
    baseTerms: string[],
    expandedTerms: string[],
    context: ExpansionContext,
    processingTime: number
  ): string {
    const expansionCount = expandedTerms.length;
    const domainName = context.legalDomain;

    return (
      `${baseTerms.length} temel terimden ${expansionCount} genişletilmiş terim üretildi. ` +
      `${domainName} alanına özgü eş anlamlılar, ilgili kavramlar ve Türkçe çekim ekleri dahil edildi. ` +
      `İşlem süresi: ${processingTime}ms. Güven skoru: ${
        (context as any).confidence || "hesaplanıyor"
      }.`
    );
  }
}
