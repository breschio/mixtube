
// Simple in-memory cache implementation
class InMemoryCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number;

  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  async set(key: string, value: any) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }
}

export const cache = new InMemoryCache();
