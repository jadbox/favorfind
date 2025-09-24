import type { SearchResult } from "../types";
import {
  getCachedSearchResults,
  setCachedSearchResults,
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

// Choose data provider based on environment variable
const getDataProvider = (): DataProvider => {
  const provider = process.env.SEARCH_PROVIDER || "gemini"; // || "semantic-scholar";

  switch (provider) {
    case "gemini":
      return new GeminiDataProvider();
    case "semantic-scholar":
    default:
      return new SemanticScholarDataProvider();
  }
};

export const fetchSearchResults = async (
  query: string,
  limit: number = 20
): Promise<SearchResult[]> => {
  const q = query.trim();
  // console.debug("fetchSearchResults:", q, limit);

  // Check cache first
  const cacheKey = q.toLowerCase();
  const cachedResults = getCachedSearchResults(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  if (!q) {
    return [];
  }

  try {
    const provider = getDataProvider();
    const papers = await provider.fetchPapers(q, limit);

    const searchResults: SearchResult[] = papers.map(mapToSearchResult);
    setCachedSearchResults(cacheKey, searchResults); // Cache the new results
    return searchResults;
  } catch (error) {
    throw error; // Re-throw to be handled by the caller
  }
};

export const handleSearch = async (request: Request): Promise<Response> => {
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const limit = Number(formData.get("limit") || 20);

  try {
    const results = await fetchSearchResults(query, limit);
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
