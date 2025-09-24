import { Database } from "bun:sqlite";
import type { SearchResult } from "../types";

const DB_PATH = "db.sqlite";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

// Generate cache key that includes provider, query, limit, and pagination
export const generateCacheKey = (
  provider: string,
  query: string,
  limit: number,
  page: number = 1
): string => {
  return `${provider}:${query.toLowerCase()}:${limit}:${page}`;
};

export const getCachedSearchResults = (
  cacheKey: string
): SearchResult[] | null => {
  const result = db
    .query("SELECT results, timestamp FROM search_cache WHERE cache_key = ?")
    .get(cacheKey) as { results: string; timestamp: number } | undefined;

  if (result) {
    const { results, timestamp } = result;
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      console.log("Cache hit for key:", cacheKey);
      return JSON.parse(results) as SearchResult[];
    } else {
      // Entry expired, delete it
      db.run("DELETE FROM search_cache WHERE cache_key = ?", [cacheKey]);
      console.log("Cache expired for key:", cacheKey);
    }
  }
  return null;
};

export const setCachedSearchResults = (
  cacheKey: string,
  searchResults: SearchResult[]
): void => {
  const results = JSON.stringify(searchResults);
  const timestamp = Date.now();
  db.run(
    "INSERT OR REPLACE INTO search_cache (cache_key, results, timestamp) VALUES (?, ?, ?)",
    [cacheKey, results, timestamp]
  );
  console.log("Saved cached results for key:", cacheKey);
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
