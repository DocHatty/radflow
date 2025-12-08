// services/aiCacheService.ts
// Semantic caching for AI responses with TTL and deduplication

import { logEvent } from "./loggingService";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// Cache configuration
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries
const CACHE_CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// In-memory cache stores
const responseCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, PendingRequest<unknown>>();

// Track when we last cleaned up
let lastCleanup = Date.now();

/**
 * Generate a hash key for a request based on its parameters
 * This creates a deterministic key for semantic caching
 */
export const generateCacheKey = (params: {
  taskType: string;
  providerId: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
}): string => {
  // Create a normalized string from the parameters
  const normalized = JSON.stringify({
    t: params.taskType,
    p: params.providerId,
    m: params.model,
    // Hash the prompt to keep keys manageable
    ph: simpleHash(params.prompt),
    // Hash system instruction if present
    sh: params.systemInstruction ? simpleHash(params.systemInstruction) : "",
  });

  return simpleHash(normalized);
};

/**
 * Simple hash function for strings
 * Not cryptographic, but fast and good enough for cache keys
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Clean up expired cache entries
 */
const cleanupCache = (): void => {
  const now = Date.now();

  // Don't clean up too frequently
  if (now - lastCleanup < CACHE_CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;
  let removed = 0;

  // Remove expired entries
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiresAt < now) {
      responseCache.delete(key);
      removed++;
    }
  }

  // Remove stale pending requests (older than 2 minutes)
  for (const [key, pending] of pendingRequests.entries()) {
    if (now - pending.timestamp > 120000) {
      pendingRequests.delete(key);
      removed++;
    }
  }

  // If cache is too large, remove oldest entries
  if (responseCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      responseCache.delete(key);
      removed++;
    }
  }

  if (removed > 0) {
    logEvent("Cache cleanup", { removed, remaining: responseCache.size });
  }
};

/**
 * Get a cached response if available and not expired
 */
export const getCached = <T>(key: string): T | null => {
  cleanupCache();

  const entry = responseCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return null;
  }

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }

  // Update hit count
  entry.hitCount++;

  logEvent("Cache hit", { key: key.substring(0, 8), hitCount: entry.hitCount });
  return entry.value;
};

/**
 * Store a response in the cache
 */
export const setCached = <T>(key: string, value: T, ttl: number = DEFAULT_TTL): void => {
  cleanupCache();

  const now = Date.now();
  responseCache.set(key, {
    value,
    timestamp: now,
    expiresAt: now + ttl,
    hitCount: 0,
  });

  logEvent("Cache set", { key: key.substring(0, 8), ttl, cacheSize: responseCache.size });
};

/**
 * Check if there's already a pending request for this key
 * This prevents duplicate concurrent requests for the same data
 */
export const getPendingRequest = <T>(key: string): Promise<T> | null => {
  const pending = pendingRequests.get(key) as PendingRequest<T> | undefined;
  if (!pending) {
    return null;
  }

  // Check if the pending request is stale (older than 2 minutes)
  if (Date.now() - pending.timestamp > 120000) {
    pendingRequests.delete(key);
    return null;
  }

  logEvent("Request deduplicated", { key: key.substring(0, 8) });
  return pending.promise;
};

/**
 * Register a pending request to prevent duplicates
 */
export const setPendingRequest = <T>(key: string, promise: Promise<T>): void => {
  pendingRequests.set(key, {
    promise: promise as Promise<unknown>,
    timestamp: Date.now(),
  });

  // Clean up when the promise resolves or rejects
  promise.finally(() => {
    pendingRequests.delete(key);
  });
};

/**
 * Invalidate cache entries matching a pattern
 */
export const invalidateCache = (pattern?: string): number => {
  if (!pattern) {
    const size = responseCache.size;
    responseCache.clear();
    logEvent("Cache cleared", { entriesRemoved: size });
    return size;
  }

  let removed = 0;
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
      removed++;
    }
  }

  logEvent("Cache invalidated", { pattern, entriesRemoved: removed });
  return removed;
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  size: number;
  pendingRequests: number;
  totalHits: number;
} => {
  let totalHits = 0;
  for (const entry of responseCache.values()) {
    totalHits += entry.hitCount;
  }

  return {
    size: responseCache.size,
    pendingRequests: pendingRequests.size,
    totalHits,
  };
};

/**
 * Wrapper function to cache AI requests with deduplication
 * This is the main function to use for caching AI responses
 */
export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  options: { ttl?: number; skipCache?: boolean } = {}
): Promise<T> => {
  const { ttl = DEFAULT_TTL, skipCache = false } = options;

  // Check if caching is disabled
  if (skipCache) {
    return fn();
  }

  // Check for cached response
  const cached = getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Check for pending request (deduplication)
  const pending = getPendingRequest<T>(key);
  if (pending) {
    return pending;
  }

  // Create new request
  const promise = fn();
  setPendingRequest(key, promise);

  const result = await promise;
  setCached(key, result, ttl);
  return result;
};

// TTL presets for different task types
export const CacheTTL = {
  CATEGORIZATION: 10 * 60 * 1000, // 10 minutes - clinical data parsing
  GUIDANCE: 5 * 60 * 1000, // 5 minutes - guidance can change
  REPORT_DRAFT: 2 * 60 * 1000, // 2 minutes - drafts are iterative
  DIFFERENTIALS: 5 * 60 * 1000, // 5 minutes
  GUIDELINES: 30 * 60 * 1000, // 30 minutes - guidelines are stable
  APPROPRIATENESS: 10 * 60 * 1000, // 10 minutes
  RUNDOWN: 5 * 60 * 1000, // 5 minutes - rundown sections
  NO_CACHE: 0, // Disable caching
} as const;
