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

const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API;

// --- Types for the Semantic Scholar API ---
import type { SemanticScholarPaper } from "@/services/semanticScholarMapper";
import { mapToSearchResult } from "@/services/semanticScholarMapper";

interface SemanticScholarSearchResponse {
  data: SemanticScholarPaper[];
  total?: number;
}

// mapping function moved to services/semanticScholarMapper

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
    const fields = "paperId,title,authors,year,url,abstract,citationCount";
    const base = new URL(
      "https://api.semanticscholar.org/graph/v1/paper/search"
    );
    base.search = new URLSearchParams({
      query: q,
      fields,
      limit: String(limit),
    }).toString();

    const headers: Record<string, string> = {};
    if (SEMANTIC_SCHOLAR_API_KEY && SEMANTIC_SCHOLAR_API_KEY.length > 0) {
      headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY;
    }

    const response = await fetch(base.toString(), { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Semantic Scholar API error: ${response.status} - ${errorText}`
      );
    }

    const payload = (await response.json()) as SemanticScholarSearchResponse;

    if (payload?.data) {
      const papers = payload.data;
      const searchResults: SearchResult[] = papers.map(mapToSearchResult);
      setCachedSearchResults(cacheKey, searchResults); // Cache the new results
      return searchResults;
    } else {
      return [];
    }
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
