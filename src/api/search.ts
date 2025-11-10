import type { SearchResult } from "../types";
import {
  getCachedSearchResults,
  setCachedSearchResults,
  generateCacheKey,
} from "../services/cache";

// --- Types for the Semantic Scholar API ---
import type { DataProvider } from "../services/dataProviderInterface";
import { GroundedGeminiDataProvider } from "../services/groundedGeminiDataProvider";
// import { UngroundedGeminiDataProvider } from "../services/ungroundedGeminiDataProvider";
// import { PerplexityDataProvider } from "../services/perplexityDataProvider";

// Configuration constants
const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 20;

// Choose data provider based on environment variable
const getDataProvider = (): DataProvider => {
  const provider: string = "gemini"; // Default to perplexity
  // old logic used process.env.SEARCH_PROVIDER ||

  switch (provider) {
    case "gemini":
      return new GroundedGeminiDataProvider();
    // case "perplexity":
    //   return new PerplexityDataProvider();
    default:
      throw new Error(`Unsupported search provider: ${provider}`);
  }
};

// Get provider name for cache key
const getProviderName = (useGrounding: boolean): string => {
  const provider = process.env.SEARCH_PROVIDER || "gemini";
  getDataProvider;
  if (provider === "gemini") {
    return useGrounding ? "gemini-grounded" : "gemini-ungrounded";
  }
  return provider;
};

export const _fetchSearchResults = async (
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  page: number = 1,
  filter_type: string = ""
): Promise<SearchResult[]> => {
  const q = query.trim();

  console.log("q", q);

  // Validate and clamp limit
  const clampedLimit = !limit
    ? DEFAULT_SEARCH_LIMIT
    : Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);

  // Hardcode grounding to true for now
  const useGrounding = true;

  // Check cache first
  const provider = getProviderName(useGrounding);
  const cacheKey = generateCacheKey(
    provider,
    q,
    clampedLimit,
    page,
    filter_type
  );
  const cachedResults = getCachedSearchResults(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  if (!q) {
    return [];
  }

  try {
    const dataProvider = getDataProvider();
    const results = await dataProvider.fetchPapers(
      q,
      clampedLimit,
      filter_type
    );

    // No need to mapToSearchResult here as GeminiDataProvider now returns SearchResult[]
    setCachedSearchResults(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
