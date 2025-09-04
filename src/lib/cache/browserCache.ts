// Browser-based caching utilities for client-side storage

export interface BrowserCacheOptions {
  storage?: 'localStorage' | 'sessionStorage';
  prefix?: string;
  ttl?: number; // Time to live in milliseconds
}

export class BrowserCache {
  private storage: Storage;
  private prefix: string;
  private defaultTTL: number;

  constructor(options: BrowserCacheOptions = {}) {
    this.storage = options.storage === 'sessionStorage' 
      ? (typeof window !== 'undefined' ? window.sessionStorage : {} as Storage)
      : (typeof window !== 'undefined' ? window.localStorage : {} as Storage);
    this.prefix = options.prefix || 'politifind_';
    this.defaultTTL = options.ttl || 1000 * 60 * 60; // 1 hour default
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (typeof window === 'undefined') return;

    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    try {
      this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set browser cache item:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = this.storage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      if (this.isExpired(parsed.timestamp, parsed.ttl)) {
        this.remove(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      console.warn('Failed to get browser cache item:', error);
      return null;
    }
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    this.storage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return this.storage.getItem(this.getKey(key)) !== null;
  }

  size(): number {
    if (typeof window === 'undefined') return 0;
    
    const keys = Object.keys(this.storage);
    return keys.filter(key => key.startsWith(this.prefix)).length;
  }

  // Clean up expired items
  cleanup(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed.timestamp, parsed.ttl)) {
              this.storage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          this.storage.removeItem(key);
        }
      }
    });
  }
}

// Global browser cache instances
export const browserCache = new BrowserCache({
  storage: 'localStorage',
  prefix: 'pf_cache_',
  ttl: 1000 * 60 * 30, // 30 minutes
});

export const sessionCache = new BrowserCache({
  storage: 'sessionStorage',
  prefix: 'pf_session_',
  ttl: 1000 * 60 * 60 * 2, // 2 hours
});