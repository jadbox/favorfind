import { Database } from "bun:sqlite";
import type { SearchResult } from "../types";

const DB_PATH = "db.sqlite";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const db = new Database(DB_PATH);

// Initialize the cache table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS search_cache (
    query TEXT PRIMARY KEY,
    results TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );
`);

// Function to clean up old cache entries
const cleanupCache = () => {
  const now = Date.now();
  const cutoff = now - CACHE_TTL_MS;
  db.run("DELETE FROM search_cache WHERE timestamp < ?", [cutoff]);
  console.log("Cache cleanup performed.");
};

// Run cleanup periodically (e.g., every hour)
setInterval(cleanupCache, 60 * 60 * 1000); // Every hour
cleanupCache(); // Run once on startup

export const getCachedSearchResults = (
  query: string
): SearchResult[] | null => {
  const result = db
    .query("SELECT results, timestamp FROM search_cache WHERE query = ?")
    .get(query) as { results: string; timestamp: number } | undefined;

  if (result) {
    const { results, timestamp } = result;
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      console.error("Cache hit for query:", query);
      return JSON.parse(results) as SearchResult[];
    } else {
      // Entry expired, delete it
      db.run("DELETE FROM search_cache WHERE query = ?", [query]);
    }
  }
  return null;
};

export const setCachedSearchResults = (
  query: string,
  searchResults: SearchResult[]
): void => {
  const results = JSON.stringify(searchResults);
  const timestamp = Date.now();
  db.run(
    "INSERT OR REPLACE INTO search_cache (query, results, timestamp) VALUES (?, ?, ?)",
    [query, results, timestamp]
  );
  console.log("Saved cached results for query:", query);
};
