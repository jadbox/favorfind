import type { SearchResult } from "../types";
import {
  getCachedSearchResults,
  setCachedSearchResults,
  generateCacheKey,
} from "../services/cache";
import {
  readUserDataCookie,
  serializeUserDataCookie,
  addToHistory,
} from "@/CookieUserData";

// --- Types for the Semantic Scholar API ---
import { mapToSearchResult } from "@/services/semanticScholarMapper";
import type { DataProvider } from "@/services/dataProviderInterface";
import { SemanticScholarDataProvider } from "@/services/semanticScholarDataProvider";
import { GeminiDataProvider } from "@/services/geminiDataProvider";

// Configuration constants
const DEFAULT_SEARCH_LIMIT = parseInt(process.env.DEFAULT_SEARCH_LIMIT || "8");
const MAX_SEARCH_LIMIT = parseInt(process.env.MAX_SEARCH_LIMIT || "20");

// Choose data provider based on environment variable
const getDataProvider = (): DataProvider => {
  const provider = process.env.SEARCH_PROVIDER || "gemini";

  switch (provider) {
    case "gemini":
      return new GeminiDataProvider();
    case "semantic-scholar":
    default:
      return new SemanticScholarDataProvider();
  }
};

// Get provider name for cache key
const getProviderName = (): string => {
  return process.env.SEARCH_PROVIDER || "gemini";
};

export const fetchSearchResults = async (
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  page: number = 1
): Promise<SearchResult[]> => {
  const q = query.trim();

  // Validate and clamp limit
  const clampedLimit = !limit
    ? DEFAULT_SEARCH_LIMIT
    : Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);

  // Check cache first
  const provider = getProviderName();
  const cacheKey = generateCacheKey(provider, q, clampedLimit, page);
  const cachedResults = getCachedSearchResults(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  if (!q) {
    return [];
  }

  try {
    const dataProvider = getDataProvider();
    const papers = await dataProvider.fetchPapers(q, clampedLimit);

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

  try {
    const results = await fetchSearchResults(query, limit, page);
    // Update user_data cookie with new search history entry
    const user = readUserDataCookie(request.headers.get("cookie"));
    const updatedHistory = addToHistory(
      user.searchHistory,
      query,
      results.length
    );
    const setCookie = serializeUserDataCookie({
      searchHistory: updatedHistory,
      savedLibrary: user.savedLibrary,
    });
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
};
