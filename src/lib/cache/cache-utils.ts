interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const activePromises = new Map<string, Promise<any>>();

/**
 * Retrieves a cached entry if it exists and is not expired.
 */
export function getCachedData<T>(key: string, ttlMs: number = 30000): T | null {
  if (typeof window === 'undefined') return null; // Only cache on client side for safety
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > ttlMs;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Caches data with the current timestamp.
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clears cached entries.
 */
export function clearCache(key?: string): void {
  if (typeof window === 'undefined') return;
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}

/**
 * Deduplicates concurrent identical promises.
 */
export async function deduplicateRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const active = activePromises.get(key);
  if (active) {
    return active;
  }
  
  const promise = fetcher().finally(() => {
    activePromises.delete(key);
  });
  activePromises.set(key, promise);
  return promise;
}

/**
 * Combines Cache + Promise Deduplication with a Stale-While-Revalidate approach.
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 30000,
  forceRefresh: boolean = false
): Promise<T> {
  if (typeof window === 'undefined') {
    return fetcher();
  }

  // 1. If not forcing refresh, check cache first
  if (!forceRefresh) {
    const cached = getCachedData<T>(key, ttlMs);
    if (cached !== null) {
      return cached;
    }
  }

  // 2. Deduplicate network/database request
  return deduplicateRequest<T>(key, async () => {
    const data = await fetcher();
    setCachedData(key, data);
    return data;
  });
}
