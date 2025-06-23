import { createHash } from "crypto";
import { prisma } from "./prisma";

export class DatabaseCache {
  private createHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  // Embedding Cache Methods
  async getEmbedding(text: string): Promise<number[] | null> {
    const hash = this.createHash(text);

    try {
      const cached = await prisma.embeddingCache.findUnique({
        where: { textHash: hash },
      });

      if (cached) {
        // Update usage statistics
        await prisma.embeddingCache.update({
          where: { id: cached.id },
          data: {
            lastUsed: new Date(),
            useCount: { increment: 1 },
          },
        });

        console.log("🎯 DB CACHE HIT - Embedding");
        await this.trackCacheHit("database", "embedding");
        return cached.embedding as number[];
      }

      await this.trackCacheMiss("database", "embedding");
      return null;
    } catch (error) {
      console.error("DB Cache Error - Embedding Get:", error);
      return null;
    }
  }

  async setEmbedding(
    text: string,
    embedding: number[],
    domain?: string
  ): Promise<void> {
    const hash = this.createHash(text);

    try {
      await prisma.embeddingCache.upsert({
        where: { textHash: hash },
        create: {
          textHash: hash,
          originalText: text.substring(0, 1000), // Limit for storage
          embedding: embedding,
          domain: domain,
        },
        update: {
          lastUsed: new Date(),
          useCount: { increment: 1 },
        },
      });

      console.log("💾 DB CACHE SET - Embedding");
    } catch (error) {
      console.error("DB Cache Error - Embedding Set:", error);
    }
  }

  // Grok Response Cache Methods
  async getGrokResponse(
    prompt: string,
    type: "intent" | "expansion" | "ranking" | "synthesis"
  ): Promise<any | null> {
    const hash = this.createHash(prompt);

    try {
      const cached = await prisma.grokCache.findFirst({
        where: {
          promptHash: hash,
          promptType: type,
          expiresAt: { gt: new Date() }, // Not expired
        },
      });

      if (cached) {
        // Update usage statistics
        await prisma.grokCache.update({
          where: { id: cached.id },
          data: {
            lastUsed: new Date(),
            useCount: { increment: 1 },
          },
        });

        console.log(`🎯 DB CACHE HIT - Grok ${type}`);
        await this.trackCacheHit("database", "grok");
        return cached.response;
      }

      await this.trackCacheMiss("database", "grok");
      return null;
    } catch (error) {
      console.error(`DB Cache Error - Grok ${type} Get:`, error);
      return null;
    }
  }

  async setGrokResponse(
    prompt: string,
    type: "intent" | "expansion" | "ranking" | "synthesis",
    response: any,
    ttlMinutes: number = 60
  ): Promise<void> {
    const hash = this.createHash(prompt);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    try {
      await prisma.grokCache.upsert({
        where: { promptHash: hash },
        create: {
          promptHash: hash,
          promptType: type,
          response: response,
          expiresAt: expiresAt,
        },
        update: {
          lastUsed: new Date(),
          useCount: { increment: 1 },
          response: response,
          expiresAt: expiresAt,
        },
      });

      console.log(`💾 DB CACHE SET - Grok ${type}`);
    } catch (error) {
      console.error(`DB Cache Error - Grok ${type} Set:`, error);
    }
  }

  // Cache Analytics Methods
  private async trackCacheHit(layer: string, cacheType: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.cacheAnalytics.upsert({
        where: {
          layer_cacheType_date: {
            layer,
            cacheType,
            date: today,
          },
        },
        create: {
          layer,
          cacheType,
          hitCount: 1,
          missCount: 0,
          date: today,
        },
        update: {
          hitCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Cache Analytics Error - Hit:", error);
    }
  }

  private async trackCacheMiss(
    layer: string,
    cacheType: string
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.cacheAnalytics.upsert({
        where: {
          layer_cacheType_date: {
            layer,
            cacheType,
            date: today,
          },
        },
        create: {
          layer,
          cacheType,
          hitCount: 0,
          missCount: 1,
          date: today,
        },
        update: {
          missCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Cache Analytics Error - Miss:", error);
    }
  }

  // Cache Management Methods
  async cleanupExpiredCache(): Promise<void> {
    try {
      const now = new Date();

      // Clean expired Grok cache
      const deletedGrok = await prisma.grokCache.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });

      // Clean old unused embedding cache (older than 30 days and used less than 3 times)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const deletedEmbeddings = await prisma.embeddingCache.deleteMany({
        where: {
          lastUsed: { lt: thirtyDaysAgo },
          useCount: { lt: 3 },
        },
      });

      console.log(
        `🧹 Cache Cleanup: ${deletedGrok.count} Grok, ${deletedEmbeddings.count} Embeddings`
      );
    } catch (error) {
      console.error("Cache Cleanup Error:", error);
    }
  }

  async getCacheStats(): Promise<{
    embeddingCount: number;
    grokCount: number;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
  }> {
    try {
      const [embeddingCount, grokCount, analytics] = await Promise.all([
        prisma.embeddingCache.count(),
        prisma.grokCache.count(),
        prisma.cacheAnalytics.aggregate({
          _sum: {
            hitCount: true,
            missCount: true,
          },
        }),
      ]);

      const totalHits = analytics._sum.hitCount || 0;
      const totalMisses = analytics._sum.missCount || 0;
      const hitRate =
        totalHits + totalMisses > 0
          ? (totalHits / (totalHits + totalMisses)) * 100
          : 0;

      return {
        embeddingCount,
        grokCount,
        totalHits,
        totalMisses,
        hitRate,
      };
    } catch (error) {
      console.error("Cache Stats Error:", error);
      return {
        embeddingCount: 0,
        grokCount: 0,
        totalHits: 0,
        totalMisses: 0,
        hitRate: 0,
      };
    }
  }
}

// Export singleton instance
export const dbCache = new DatabaseCache();
