interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryTtlCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const marketCache = new MemoryTtlCache();

export const CACHE_TTL = {
  QUOTE_MS: 60 * 1000,           // 1 minute
  FUNDAMENTALS_MS: 24 * 60 * 60 * 1000, // 24 hours
  DIVIDEND_MS: 24 * 60 * 60 * 1000,    // 24 hours
  PRICE_HISTORY_MS: 15 * 60 * 1000,    // 15 minutes
};
