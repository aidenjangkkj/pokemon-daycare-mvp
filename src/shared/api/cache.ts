import type { CacheEntry } from "../types/api";
import { readStorageJson, writeStorageJson } from "../utils/storage";

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface GetWithCacheParams<TValue> {
  key: string;
  ttlMs?: number;
  fetcher: () => Promise<TValue>;
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

    writeStorageJson<CacheEntry<TValue>>(key, {
      value: freshValue,
      createdAt: now,
      expiresAt: now + ttlMs,
    });

    return freshValue;
  } catch (error) {
    if (cachedEntry) {
      return cachedEntry.value;
    }

    throw error;
  }
}
