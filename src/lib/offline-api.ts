import { openDB, IDBPDatabase } from 'idb';

type CacheRecord = {
  key: string;
  data: unknown;
  updatedAt: number;
};

const API_CACHE_DB_NAME = 'albadel-api-cache';
const API_CACHE_DB_VERSION = 1;

let dbInstance: Promise<IDBPDatabase> | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('offline-api: indexedDB is only available in the browser.');
  }
  if (!dbInstance) {
    dbInstance = openDB(API_CACHE_DB_NAME, API_CACHE_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'key' });
        }
      },
    });
  }
  return dbInstance;
}

async function getCached<T>(key: string, ttlMs?: number): Promise<T | null> {
  const db = await getDb();
  const record = (await db.get('responses', key)) as CacheRecord | undefined;
  if (!record) return null;
  if (typeof ttlMs === 'number' && ttlMs > 0) {
    if (Date.now() - record.updatedAt > ttlMs) return null;
  }
  return record.data as T;
}

async function setCached(key: string, data: unknown): Promise<void> {
  const db = await getDb();
  const record: CacheRecord = { key, data, updatedAt: Date.now() };
  await db.put('responses', record);
}

export async function fetchJsonWithCache<T>(
  url: string,
  init?: RequestInit,
  opts?: { cacheKey?: string; ttlMs?: number; fallback?: T }
): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const cacheKey = opts?.cacheKey || url;

  if (typeof window === 'undefined') {
    const res = await fetch(url, init);
    return (await res.json()) as T;
  }

  if (method !== 'GET') {
    const res = await fetch(url, init);
    return (await res.json()) as T;
  }

  try {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = (await res.json()) as T;
    await setCached(cacheKey, data);
    return data;
  } catch {
    const cached = await getCached<T>(cacheKey, opts?.ttlMs);
    if (cached !== null) return cached;
    if (opts && 'fallback' in opts) return opts.fallback as T;
    throw new Error('Network error and no cached data');
  }
}
