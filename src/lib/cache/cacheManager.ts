/**
 * Multi-level cache manager with memory and localStorage support
 * Implements LRU eviction policy for memory cache
 */

export interface CacheStats {
  memoryHits: number;
  memoryMisses: number;
  localStorageHits: number;
  localStorageMisses: number;
  totalSize: number;
  memorySize: number;
  localStorageSize: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxMemorySize?: number; // Maximum memory cache size
  maxLocalStorageSize?: number; // Maximum localStorage size in bytes
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    memoryHits: 0,
    memoryMisses: 0,
    localStorageHits: 0,
    localStorageMisses: 0,
    totalSize: 0,
    memorySize: 0,
    localStorageSize: 0
  };

  private readonly maxMemorySize: number;
  private readonly maxLocalStorageSize: number;
  private readonly defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxMemorySize = options.maxMemorySize || 100; // Max 100 items in memory
    this.maxLocalStorageSize = options.maxLocalStorageSize || 5 * 1024 * 1024; // 5MB
    this.defaultTTL = options.ttl || 30 * 60 * 1000; // 30 minutes default
  }

  /**
   * Get value from cache (checks memory first, then localStorage)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccessed = Date.now();
      this.stats.memoryHits++;
      return memoryEntry.value as T;
    }

    if (memoryEntry) {
      // Entry expired, remove it
      this.memoryCache.delete(key);
    }
    this.stats.memoryMisses++;

    // Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const localStorageValue = localStorage.getItem(`cache_${key}`);
        if (localStorageValue) {
          const entry: CacheEntry<T> = JSON.parse(localStorageValue);
          if (this.isValidEntry(entry)) {
            // Move to memory cache for faster access
            this.memoryCache.set(key, {
              ...entry,
              accessCount: entry.accessCount + 1,
              lastAccessed: Date.now()
            });
            this.evictMemoryIfNeeded();
            this.stats.localStorageHits++;
            return entry.value;
          } else {
            // Entry expired, remove it
            localStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.warn('Error reading from localStorage cache:', error);
      }
    }

    this.stats.localStorageMisses++;
    return null;
  }

  /**
   * Set value in cache (stores in both memory and localStorage)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);
    this.evictMemoryIfNeeded();

    // Store in localStorage
    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify(entry);
        const size = new Blob([serialized]).size;
        
        // Check if we need to make space
        if (this.getLocalStorageSize() + size > this.maxLocalStorageSize) {
          this.evictLocalStorageIfNeeded(size);
        }

        localStorage.setItem(`cache_${key}`, serialized);
      } catch (error) {
        console.warn('Error writing to localStorage cache:', error);
      }
    }

    this.updateStats();
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));

    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_') && regex.test(key.substring(6))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    this.updateStats();
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(keys: string[]): Promise<void> {
    // This would typically fetch data from the source and cache it
    // For now, we'll just ensure the cache is ready for these keys
    console.log(`Cache warming initiated for ${keys.length} keys:`, keys);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Clear all cache data
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      localStorageHits: 0,
      localStorageMisses: 0,
      totalSize: 0,
      memorySize: 0,
      localStorageSize: 0
    };
  }

  private isValidEntry(entry: CacheEntry<any>): boolean {
    if (!entry.ttl) return true;
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private evictMemoryIfNeeded(): void {
    if (this.memoryCache.size <= this.maxMemorySize) return;

    // LRU eviction - remove least recently used items
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const toRemove = entries.slice(0, this.memoryCache.size - this.maxMemorySize);
    toRemove.forEach(([key]) => this.memoryCache.delete(key));
  }

  private evictLocalStorageIfNeeded(requiredSize: number): void {
    if (typeof window === 'undefined') return;

    const currentSize = this.getLocalStorageSize();
    if (currentSize + requiredSize <= this.maxLocalStorageSize) return;

    // Get all cache entries and sort by last accessed
    const entries: Array<[string, CacheEntry<any>]> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key)!);
          entries.push([key, entry]);
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    }

    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    // Remove oldest entries until we have enough space
    let freedSpace = 0;
    for (const [key] of entries) {
      const item = localStorage.getItem(key);
      if (item) {
        freedSpace += new Blob([item]).size;
        localStorage.removeItem(key);
        if (freedSpace >= requiredSize) break;
      }
    }
  }

  private getLocalStorageSize(): number {
    if (typeof window === 'undefined') return 0;

    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        const item = localStorage.getItem(key);
        if (item) {
          size += new Blob([item]).size;
        }
      }
    }
    return size;
  }

  private updateStats(): void {
    this.stats.memorySize = this.memoryCache.size;
    this.stats.localStorageSize = this.getLocalStorageSize();
    this.stats.totalSize = this.stats.memorySize + this.stats.localStorageSize;
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager({
  maxMemorySize: 100,
  maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
  ttl: 30 * 60 * 1000 // 30 minutes
});