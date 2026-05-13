import type { CacheEntry } from "../types/api";
import {
  getStorageKeys,
  isQuotaExceededError,
  readStorageJson,
  removeStorageItem,
  writeStorageJson,
} from "../utils/storage";

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface GetWithCacheParams<TValue> {
  key: string;
  ttlMs?: number;
  fetcher: () => Promise<TValue>;
}

const CACHE_KEY_PREFIXES = ["pokemon:", "species:", "evolution-chain:", "evolution-line:", "nature:", "item:"];

function isManagedCacheKey(key: string): boolean {
  return CACHE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function cleanupExpiredCacheEntries(now: number): void {
  const keys = getStorageKeys().filter(isManagedCacheKey);

  for (const key of keys) {
    const entry = readStorageJson<CacheEntry<unknown>>(key);
    if (!entry || entry.expiresAt <= now) {
      removeStorageItem(key);
    }
  }
}

function cleanupOldestCacheEntries(limit: number): void {
  const entries = getStorageKeys()
    .filter(isManagedCacheKey)
    .map((key) => ({
      key,
      createdAt: readStorageJson<CacheEntry<unknown>>(key)?.createdAt ?? Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.createdAt - b.createdAt);

  for (const entry of entries.slice(0, limit)) {
    removeStorageItem(entry.key);
  }
}

function writeCacheEntrySafely<TValue>(
  key: string,
  value: TValue,
  now: number,
  ttlMs: number,
): void {
  const entry: CacheEntry<TValue> = {
    value,
    createdAt: now,
    expiresAt: now + ttlMs,
  };

  try {
    writeStorageJson<CacheEntry<TValue>>(key, entry);
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      return;
    }

    cleanupExpiredCacheEntries(now);
    cleanupOldestCacheEntries(20);

    try {
      writeStorageJson<CacheEntry<TValue>>(key, entry);
    } catch {
      // Cache write failure should not block runtime flow.
    }
  }
}

export async function getWithCache<TValue>(
  params: GetWithCacheParams<TValue>,
): Promise<TValue> {
  const { key, ttlMs = ONE_DAY_MS, fetcher } = params;
  const cachedEntry = readStorageJson<CacheEntry<TValue>>(key);
  const now = Date.now();

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.value;
  }

  try {
    const freshValue = await fetcher();
    writeCacheEntrySafely(key, freshValue, now, ttlMs);

    return freshValue;
  } catch (error) {
    if (cachedEntry) {
      return cachedEntry.value;
    }

    throw error;
  }
}
