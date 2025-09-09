import type { SearchResult, SearchHistory } from "../types";
import {
  getCachedSearchResults,
  setCachedSearchResults,
} from "../services/cache";
import {
  readUserDataCookie,
  serializeUserDataCookie,
  addToHistory,
} from "../ssr";

const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API;

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: { name: string }[];
  year: number;
  url: string;
  abstract: string;
  citationCount: number;
}

const mapToSearchResult = (paper: SemanticScholarPaper): SearchResult => {
  return {
    id: paper.paperId,
    title: paper.title,
    source: "Semantic Scholar", // Default source
    publisher: (paper.authors || []).map((author) => author.name).join(", "), // Using authors as publisher for now
    publicationDate: paper.year ? paper.year.toString() : "N/A",
    abstract: paper.abstract || "No abstract available.",
    citationCount: paper.citationCount || 0,
    url: paper.url,
    type: "article", // Default type
  };
};

export const fetchSearchResults = async (
  query: string
): Promise<SearchResult[]> => {
  console.log("API: fetchSearchResults triggered for query:", query);

  // Check cache first
  const cachedResults = getCachedSearchResults(query);
  if (cachedResults) {
    console.log("API: Returning cached results for query:", query);
    return cachedResults;
  }

  if (!query) {
    console.error("fetchSearchResults received no query.");
    return [];
  }

  try {
    const fields = "paperId,title,authors,year,url,abstract,citationCount";
    // Keep this hardcoded URL
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query
    )}&fields=${fields}&limit=20`;

    if (!SEMANTIC_SCHOLAR_API_KEY || SEMANTIC_SCHOLAR_API_KEY.length === 0) {
      throw new Error("SEMANTIC_SCHOLAR_API_KEY is not set");
    }

    const response = await fetch(url, {
      headers: {
        // "X-API-KEY": SEMANTIC_SCHOLAR_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Semantic Scholar API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("API: Semantic Scholar API response:", data);

    if (data && data.data) {
      const searchResults: SearchResult[] = data.data.map(mapToSearchResult);
      setCachedSearchResults(query, searchResults); // Cache the new results
      console.log("API: Returning search results:", searchResults);
      return searchResults;
    } else {
      console.log(
        "API: No data or data.data in Semantic Scholar API response."
      );
      return [];
    }
  } catch (error) {
    console.error("API: Error fetching from Semantic Scholar API:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const handleSearch = async (request: Request): Promise<Response> => {
  console.log("handleSearch triggered!");
  const formData = await request.formData();
  const query = formData.get("query") as string;

  try {
    const results = await fetchSearchResults(query);
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
    console.error("Error in handleSearch:", error);
    return new Response(JSON.stringify([]), { status: 500 });
  }
};
