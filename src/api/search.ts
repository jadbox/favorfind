import type { SearchResult } from "../types";
import { TTLCache } from "@brokerloop/ttlcache";

const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API;

const searchCache = new TTLCache<string, SearchResult[]>({
  ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 10000, // Maximum 10,000 entries
});

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

export const handleSearch = async (request: Request): Promise<Response> => {
  console.log("handleSearch triggered!");
  const formData = await request.formData();
  const query = formData.get("query") as string;

  console.log("Received query in action:", query);

  // Check if the query is already in the cache
  if (searchCache.has(query)) {
    const cachedResult = searchCache.get(query);
    console.log("Returning cached result for query:", query);
    return new Response(JSON.stringify(cachedResult), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!query) {
    console.error("Search action received no query.");
    return new Response(JSON.stringify([]), { status: 400 });
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
    console.log("Semantic Scholar API response:", data);

    if (data && data.data) {
      const searchResults: SearchResult[] = data.data.map(mapToSearchResult);
      // Cache the result before returning
      searchCache.set(query, searchResults);
      return new Response(JSON.stringify(searchResults), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching from Semantic Scholar API:", error);
    return new Response(JSON.stringify([]), { status: 500 });
  }
};
