import type { SearchResult } from "../types";
import {
  getCachedSearchResults,
  setCachedSearchResults,
  generateCacheKey,
} from "../services/cache";

// --- Types for the Semantic Scholar API ---
import { mapToSearchResult } from "@/services/semanticScholarMapper";
import type { DataProvider } from "@/services/dataProviderInterface";
import { SemanticScholarDataProvider } from "@/services/semanticScholarDataProvider";
import { GeminiDataProvider } from "@/services/geminiDataProvider";
import { PerplexityDataProvider } from "@/services/perplexityDataProvider";

// Configuration constants
const DEFAULT_SEARCH_LIMIT = 12;
const MAX_SEARCH_LIMIT = 20;

// Choose data provider based on environment variable
const getDataProvider = (): DataProvider => {
  const provider = process.env.SEARCH_PROVIDER || "perplexity" || "gemini";

  switch (provider) {
    case "gemini":
      return new GeminiDataProvider();
    case "perplexity":
      return new PerplexityDataProvider();
    case "semantic-scholar":
    default:
      return new SemanticScholarDataProvider();
  }
};

// Get provider name for cache key
const getProviderName = (): string => {
  return process.env.SEARCH_PROVIDER || "gemini";
};

export const _fetchSearchResults = async (
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  page: number = 1,
  filter_type: string = ""
): Promise<SearchResult[]> => {
  const q = query.trim();

  // Validate and clamp limit
  const clampedLimit = !limit
    ? DEFAULT_SEARCH_LIMIT
    : Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);

  // Check cache first
  const provider = getProviderName();
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
    const papers = await dataProvider.fetchPapers(q, clampedLimit, filter_type);

    const searchResults: SearchResult[] = papers.map(mapToSearchResult);
    setCachedSearchResults(cacheKey, searchResults);
    return searchResults;
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

export const handleSearch = async (request: Request): Promise<Response> => {
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const limit = Math.min(
    Math.max(parseInt(formData.get("limit") as string), DEFAULT_SEARCH_LIMIT),
    MAX_SEARCH_LIMIT
  );
  const page = Math.max(parseInt((formData.get("page") as string) || "1"), 1);
  const filter_type = (formData.get("filter_type") as string) || "";
  const primaryTumorSite = (formData.get("primaryTumorSite") as string) || "";
  const ageGroup = (formData.get("ageGroup") as string) || "";
  const gender = (formData.get("gender") as string) || "";
  const sortBy = (formData.get("sortBy") as string) || "";

  try {
    const results = await _fetchSearchResults(query, limit, page, filter_type);

    // Note: Search history is now saved client-side via localStorage

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
};
