import type { SearchResult } from "../types";
import type { SearchParams } from "../types/search";
import {
  getCachedSearchResults,
  setCachedSearchResults,
  generateCacheKey,
} from "../services/cache";
import { getClientIP, checkRateLimit } from "../services/rateLimiter";
import type { DataProvider } from "../services/dataProviderInterface";
import { GroundedGeminiDataProvider } from "../services/groundedGeminiDataProvider";

// Re-export for convenience
export { parseSearchParams } from "../types/search";

// Configuration
const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 20;

// Search result with error handling
export interface SearchData {
  results: SearchResult[];
  error: string | null;
}

const getDataProvider = (): DataProvider => new GroundedGeminiDataProvider();

const getProviderName = (): string => {
  const provider = process.env.SEARCH_PROVIDER || "gemini";
  return provider === "gemini" ? "gemini-grounded" : provider;
};

/**
 * Build filter string from search params
 */
function buildFilterParams(params: SearchParams): string {
  return [
    params.selectedType !== "All" && params.selectedType,
    params.sortBy !== "relevance" && params.sortBy,
  ]
    .filter(Boolean)
    .join(",");
}

/**
 * Perform a search with caching and rate limiting
 */
export async function performSearch(
  params: SearchParams,
  request?: Request
): Promise<SearchData> {
  const query = params.query?.trim();

  if (!query) {
    return { results: [], error: null };
  }

  const limit = Math.min(
    Math.max(params.limit || DEFAULT_SEARCH_LIMIT, 1),
    MAX_SEARCH_LIMIT
  );
  const filterType = buildFilterParams(params);

  // Check cache first (no rate limiting for cached results)
  const cacheKey = generateCacheKey(
    getProviderName(),
    query,
    limit,
    1,
    filterType
  );
  const cachedResults = getCachedSearchResults(cacheKey);

  if (cachedResults) {
    return { results: cachedResults, error: null };
  }

  // Rate limit only for non-cached requests
  if (request) {
    const clientIP = getClientIP(request);
    const { allowed } = checkRateLimit(clientIP);
    if (!allowed) {
      return {
        results: [],
        error: "Too many requests. Please try again later.",
      };
    }
  }

  try {
    const results = await getDataProvider().fetchPapers(
      query,
      limit,
      filterType
    );
    setCachedSearchResults(cacheKey, results);
    return { results, error: null };
  } catch (err) {
    console.error("Search error:", err);
    return {
      results: [],
      error: err instanceof Error ? err.message : "Search failed",
    };
  }
}
