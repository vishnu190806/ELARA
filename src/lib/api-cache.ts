// Simple in-memory cache to prevent rate-limiting on external APIs
// Useful mainly for serverless deployments where we want cross-request state if using a warm instance,
// though Next.js `unstable_cache` or standard `fetch` caching handles most of this automatically.

type CacheItem<T> = {
  data: T;
  expiry: number;
};

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlSeconds: number) {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new MemoryCache();
