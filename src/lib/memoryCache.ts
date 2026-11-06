// Global in-memory cache for Vercel Serverless Functions
// This acts as a zero-config fallback when Upstash Redis is not configured.
// Note: In serverless environments, this cache persists as long as the function is warm.

const globalAny = global as any;

if (!globalAny.cacheMap) {
  globalAny.cacheMap = new Map<string, any>();
}

if (!globalAny.rateLimitMap) {
  globalAny.rateLimitMap = new Map<string, number>();
}

export const memoryStore = {
  get: (key: string) => {
    return globalAny.cacheMap.get(key) || null;
  },
  set: (key: string, value: any, ttlSeconds: number) => {
    globalAny.cacheMap.set(key, value);
    setTimeout(() => {
      globalAny.cacheMap.delete(key);
    }, ttlSeconds * 1000);
  },
  getRateLimit: (key: string): number => {
    return globalAny.rateLimitMap.get(key) || 0;
  },
  incrRateLimit: (key: string, ttlSeconds: number) => {
    const current = globalAny.rateLimitMap.get(key) || 0;
    globalAny.rateLimitMap.set(key, current + 1);
    
    // Set expiration only on first increment
    if (current === 0) {
      setTimeout(() => {
        globalAny.rateLimitMap.delete(key);
      }, ttlSeconds * 1000);
    }
  }
};
