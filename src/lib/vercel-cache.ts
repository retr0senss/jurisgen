import { unstable_cache } from "next/cache";
import { createHash } from "crypto";

// Cache duration constants (in seconds)
export const CACHE_DURATION = {
  EMBEDDING: 86400, // 24 hours - embeddings are stable
  GROK_INTENT: 3600, // 1 hour - intent detection
  GROK_EXPANSION: 1800, // 30 minutes - query expansion
  GROK_SYNTHESIS: 1800, // 30 minutes - response synthesis
  MEVZUAT_SEARCH: 600, // 10 minutes - search results
  SEMANTIC_FILTER: 1200, // 20 minutes - filtered results
} as const;

// Cache key generation
export function generateCacheKey(prefix: string, data: any): string {
  const dataString = typeof data === "string" ? data : JSON.stringify(data);
  const hash = createHash("sha256")
    .update(dataString)
    .digest("hex")
    .substring(0, 16);
  return `${prefix}-${hash}`;
}

// Generic cache wrapper
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number,
  tags?: string[]
): Promise<T> {
  const cacheFunction = unstable_cache(fetcher, [key], {
    revalidate: duration,
    tags: tags || [key.split("-")[0]], // Use prefix as default tag
  });

  const startTime = Date.now();

  try {
    const result = await cacheFunction();
    const responseTime = Date.now() - startTime;

    // Log cache performance
    console.log(`⚡ VERCEL CACHE - ${key}: ${responseTime}ms`);

    return result;
  } catch (error) {
    console.error(`❌ VERCEL CACHE ERROR - ${key}:`, error);
    // Fallback to direct execution if cache fails
    return await fetcher();
  }
}

// Specialized cache functions for different types

// Embedding Cache
export async function getCachedEmbedding(
  text: string,
  fetcher: () => Promise<number[]>
): Promise<number[]> {
  const key = generateCacheKey("embedding", text);
  return getCachedData(key, fetcher, CACHE_DURATION.EMBEDDING, ["embedding"]);
}

// Grok Intent Cache
export async function getCachedGrokIntent(
  prompt: string,
  fetcher: () => Promise<any>
): Promise<any> {
  const key = generateCacheKey("grok-intent", prompt);
  return getCachedData(key, fetcher, CACHE_DURATION.GROK_INTENT, [
    "grok",
    "intent",
  ]);
}

// Grok Expansion Cache
export async function getCachedGrokExpansion(
  query: string,
  fetcher: () => Promise<any>
): Promise<any> {
  const key = generateCacheKey("grok-expansion", query);
  return getCachedData(key, fetcher, CACHE_DURATION.GROK_EXPANSION, [
    "grok",
    "expansion",
  ]);
}

// Grok Synthesis Cache
export async function getCachedGrokSynthesis(
  prompt: string,
  fetcher: () => Promise<any>
): Promise<any> {
  const key = generateCacheKey("grok-synthesis", prompt);
  return getCachedData(key, fetcher, CACHE_DURATION.GROK_SYNTHESIS, [
    "grok",
    "synthesis",
  ]);
}

// Mevzuat Search Cache
export async function getCachedMevzuatSearch(
  searchParams: any,
  fetcher: () => Promise<any>
): Promise<any> {
  const key = generateCacheKey("mevzuat", searchParams);
  return getCachedData(key, fetcher, CACHE_DURATION.MEVZUAT_SEARCH, [
    "mevzuat",
    "search",
  ]);
}

// Semantic Filter Cache
export async function getCachedSemanticFilter(
  query: string,
  results: any[],
  fetcher: () => Promise<any>
): Promise<any> {
  const key = generateCacheKey("semantic", { query, count: results.length });
  return getCachedData(key, fetcher, CACHE_DURATION.SEMANTIC_FILTER, [
    "semantic",
    "filter",
  ]);
}

// Cache invalidation helpers
export async function invalidateCache(tags: string[]): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");

    for (const tag of tags) {
      revalidateTag(tag);
      console.log(`🗑️ CACHE INVALIDATED - Tag: ${tag}`);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

// Cache warming (preload frequently used data)
export async function warmCache(): Promise<void> {
  console.log("🔥 WARMING CACHE - Starting...");

  // This could be called on deployment or scheduled
  // to preload frequently accessed data

  try {
    // Example: Warm common legal terms
    const commonTerms = [
      "kıdem tazminatı",
      "iş sözleşmesi",
      "vergi borcu",
      "turizm işletmesi",
      "ticaret hukuku",
    ];

    // Warm these in background (don't await)
    commonTerms.forEach(async (term) => {
      try {
        // This will populate the cache for common searches
        await getCachedData(
          generateCacheKey("warm", term),
          async () => ({ warmed: true, term }),
          CACHE_DURATION.MEVZUAT_SEARCH
        );
      } catch (error) {
        console.error(`Cache warming failed for ${term}:`, error);
      }
    });

    console.log("🔥 CACHE WARMING - Completed");
  } catch (error) {
    console.error("Cache warming error:", error);
  }
}

// Cache statistics (for monitoring)
export interface CacheStats {
  hitRate: number;
  totalRequests: number;
  avgResponseTime: number;
  costSavings: number;
}

// This would be populated by actual usage tracking
let cacheStats: CacheStats = {
  hitRate: 0,
  totalRequests: 0,
  avgResponseTime: 0,
  costSavings: 0,
};

export function getCacheStats(): CacheStats {
  return { ...cacheStats };
}

export function updateCacheStats(
  hit: boolean,
  responseTime: number,
  costSaved: number = 0
): void {
  cacheStats.totalRequests++;
  cacheStats.avgResponseTime = (cacheStats.avgResponseTime + responseTime) / 2;
  cacheStats.costSavings += costSaved;

  if (hit) {
    cacheStats.hitRate =
      (cacheStats.hitRate * (cacheStats.totalRequests - 1) + 100) /
      cacheStats.totalRequests;
  } else {
    cacheStats.hitRate =
      (cacheStats.hitRate * (cacheStats.totalRequests - 1)) /
      cacheStats.totalRequests;
  }
}
