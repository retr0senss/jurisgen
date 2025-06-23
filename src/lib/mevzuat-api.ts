/**
 * Mevzuat API Client for JurisGen
 * Interfaces with the Python FastMCP mevzuat service
 */

export interface MevzuatTur {
  id: number;
  name: string;
  description: string;
}

export interface MevzuatDocument {
  mevzuatId: string;
  mevzuatNo?: number;
  mevzuatAdi: string;
  mevzuatTur: MevzuatTur;
  resmiGazeteTarihi?: string;
  resmiGazeteSayisi?: string;
  url?: string;
}

export interface MevzuatSearchResult {
  documents: MevzuatDocument[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  queryUsed: Record<string, any>;
  errorMessage?: string;
}

export interface MevzuatArticleNode {
  maddeId: string;
  maddeNo?: number;
  title: string;
  description?: string;
  children: MevzuatArticleNode[];
  mevzuatId: string;
}

export interface MevzuatArticleContent {
  maddeId: string;
  mevzuatId: string;
  markdownContent: string;
  errorMessage?: string;
}

export enum MevzuatTurEnum {
  KANUN = "KANUN",
  CB_KARARNAME = "CB_KARARNAME",
  YONETMELIK = "YONETMELIK",
  CB_YONETMELIK = "CB_YONETMELIK",
  CB_KARAR = "CB_KARAR",
  CB_GENELGE = "CB_GENELGE",
  KHK = "KHK",
  TUZUK = "TUZUK",
  KKY = "KKY",
  UY = "UY",
  TEBLIGLER = "TEBLIGLER",
  MULGA = "MULGA",
}

export enum SortFieldEnum {
  RESMI_GAZETE_TARIHI = "RESMI_GAZETE_TARIHI",
  KAYIT_TARIHI = "KAYIT_TARIHI",
  MEVZUAT_NUMARASI = "MEVZUAT_NUMARASI",
}

export enum SortDirectionEnum {
  DESC = "desc",
  ASC = "asc",
}

export interface MevzuatSearchRequest {
  mevzuatAdi?: string;
  phrase?: string;
  mevzuatNo?: string;
  resmiGazeteSayisi?: string;
  mevzuatTurleri?: MevzuatTurEnum[];
  pageNumber?: number;
  pageSize?: number;
  sortField?: SortFieldEnum;
  sortDirection?: SortDirectionEnum;
}

class MevzuatApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
  }

  async searchMevzuat(
    params: MevzuatSearchRequest
  ): Promise<MevzuatSearchResult> {
    try {
      const response = await fetch("/api/mevzuat/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching mevzuat:", error);
      return {
        documents: [],
        totalResults: 0,
        currentPage: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        totalPages: 0,
        queryUsed: params,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getMevzuatArticleTree(
    mevzuatId: string
  ): Promise<MevzuatArticleNode[]> {
    try {
      const response = await fetch("/api/mevzuat/article-tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mevzuatId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting article tree:", error);
      return [];
    }
  }

  async getMevzuatArticleContent(
    mevzuatId: string,
    maddeId: string
  ): Promise<MevzuatArticleContent> {
    try {
      const response = await fetch("/api/mevzuat/article-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mevzuatId, maddeId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting article content:", error);
      return {
        maddeId,
        mevzuatId,
        markdownContent: "",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const mevzuatApi = new MevzuatApiClient();
