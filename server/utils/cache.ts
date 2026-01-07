import NodeCache from "node-cache";

// initialize cache with:
// - standard TTL: 1 hour (3600s)
// - check period: 2 minutes (120s)
export const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120,
  useClones: false, // Store references for better performance
});

/**
 * Cache Keys enum to prevent typos
 */
export enum CacheKeys {
  CONFIG_ALL = "config:all",
  TAGS_POPULAR = "tags:popular",
  FEED_DEFAULT = "feed:default",
  TAGS_ALL = "tags:all",
}

/**
 * Helper to get or set cache data
 */
export const getOrSetCache = async <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> => {
  const cachedData = cache.get<T>(key);
  
  if (cachedData) {
    return cachedData;
  }

  const freshData = await fetchFunction();
  
  if (ttlSeconds) {
    cache.set(key, freshData, ttlSeconds);
  } else {
    cache.set(key, freshData);
  }
  
  return freshData;
};

/**
 * Helper to invalidate cache by key or prefix
 */
export const invalidateCache = (keyOrPrefix: string) => {
  const keys = cache.keys();
  // If exact match
  if (keys.includes(keyOrPrefix)) {
    cache.del(keyOrPrefix);
    return;
  }
  
  // If prefix match (simulated)
  const matchingKeys = keys.filter(k => k.startsWith(keyOrPrefix));
  if (matchingKeys.length > 0) {
    cache.del(matchingKeys);
  }
};
