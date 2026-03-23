/**
 * Unified async cache.
 * • Uses Upstash Redis when UPSTASH_REDIS_REST_URL + TOKEN are set (production)
 * • Falls back to in-process memory cache (dev / no Redis configured)
 */
import { Redis } from "@upstash/redis";

// ─── In-memory fallback ──────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.data as T;
  }

  async delete(key: string): Promise<void> { this.store.delete(key); }

  cleanup(): void {
    const now = Date.now();
    for (const [k, e] of this.store.entries()) {
      if (now > e.expiresAt) this.store.delete(k);
    }
  }
}

// ─── Redis cache ─────────────────────────────────────────────────────

class RedisCache {
  private redis: Redis;
  constructor(redis: Redis) { this.redis = redis; }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get<string>(key);
      if (!raw) return null;
      return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
    } catch { return null; }
  }

  async delete(key: string): Promise<void> { await this.redis.del(key); }
  cleanup(): void {} // Redis manages TTL natively
}

// ─── Build the right implementation ──────────────────────────────────

type AnyCache = MemoryCache | RedisCache;

function buildCache(): AnyCache {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return new RedisCache(new Redis({ url, token }));
    } catch (e) {
      console.warn("[cache] Redis init failed, falling back to memory:", e);
    }
  }
  return new MemoryCache();
}

export const cache: AnyCache = buildCache();

// Periodic cleanup for memory cache (no-op for Redis)
if (typeof window === "undefined") {
  setInterval(() => {
    if (cache instanceof MemoryCache) cache.cleanup();
  }, 5 * 60 * 1000);
}

// ─── Key helpers ─────────────────────────────────────────────────────

export const cacheKeys = {
  contributions: (username: string, year: number) =>
    `github:${username.toLowerCase()}:${year}`,
  profile: (username: string) => `github:profile:${username.toLowerCase()}`,
};

/** Default TTL: 6 hours */
export const CACHE_TTL = 6 * 60 * 60;
