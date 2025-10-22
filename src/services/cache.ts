import { Database } from "bun:sqlite";
import type { SearchResult } from "../types";

const DB_PATH = "db.sqlite";
const CACHE_TTL_MS = 1 * 1000; // 1 * 60 * 60 * 1000; // 12 hours in milliseconds

const db = new Database(DB_PATH);

// Initialize the cache table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS search_cache (
    cache_key TEXT PRIMARY KEY,
    results TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );
`);

// Function to clean up old cache entries
const cleanupCache = () => {
  const now = Date.now();
  const cutoff = now - CACHE_TTL_MS;
  const deleted = db.run("DELETE FROM search_cache WHERE timestamp < ?", [
    cutoff,
  ]);
  if (deleted.changes > 0) {
    console.log(`Cache cleanup: removed ${deleted.changes} expired entries`);
  }
};

// Run cleanup periodically (e.g., every hour)
setInterval(cleanupCache, 60 * 60 * 1000); // Every hour
cleanupCache(); // Run once on startup

// Generate cache key that includes provider, query, limit, pagination, and filters
export const generateCacheKey = (
  provider: string,
  query: string,
  limit: number,
  page: number = 1,
  filter_type: string = "",
): string => {
  const filterPart = filter_type ? `:${filter_type}` : "";
  return `${provider}:${query.toLowerCase()}:${limit}:${page}${filterPart}`;
};

export const getCachedData = <T>(cacheKey: string): T | null => {
  const result = db
    .query("SELECT results, timestamp FROM search_cache WHERE cache_key = ?")
    .get(cacheKey) as { results: string; timestamp: number } | undefined;

  if (result) {
    const { results, timestamp } = result;
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      console.log("Cache hit for key:", cacheKey);
      return JSON.parse(results) as T;
    } else {
      // Entry expired, delete it
      db.run("DELETE FROM search_cache WHERE cache_key = ?", [cacheKey]);
      console.log("Cache expired for key:", cacheKey);
    }
  }
  return null;
};

export const setCachedData = (cacheKey: string, data: any): void => {
  const results = JSON.stringify(data);
  const timestamp = Date.now();
  db.run(
    "INSERT OR REPLACE INTO search_cache (cache_key, results, timestamp) VALUES (?, ?, ?)",
    [cacheKey, results, timestamp]
  );
  console.log("Saved cached results for key:", cacheKey);
};

export const getCachedSearchResults = (
  cacheKey: string
): SearchResult[] | null => {
  return getCachedData<SearchResult[]>(cacheKey);
};

export const setCachedSearchResults = (
  cacheKey: string,
  searchResults: SearchResult[]
): void => {
  setCachedData(cacheKey, searchResults);
};

// Get cache statistics
export const getCacheStats = () => {
  const totalEntries = db
    .query("SELECT COUNT(*) as count FROM search_cache")
    .get() as { count: number };
  const expiredEntries = db
    .query(
      "SELECT COUNT(*) as count FROM search_cache WHERE timestamp < $timestamp"
    )
    .get({
      $timestamp: Date.now() - CACHE_TTL_MS,
    }) as { count: number };

  return {
    totalEntries: totalEntries.count,
    expiredEntries: expiredEntries.count,
    validEntries: totalEntries.count - expiredEntries.count,
  };
};

// Clear all cache entries
export const clearCache = (): number => {
  const result = db.run("DELETE FROM search_cache");
  console.log(`Cache cleared: removed ${result.changes} entries`);
  return result.changes;
};
