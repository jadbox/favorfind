import { SearchResult } from "../types";
import { useFetcher } from "react-router"; // Import useFetcher

// The actual search logic is now in src/actions/search.ts
export const useSearchPapers = () => {
  const fetcher = useFetcher(); // { key: "useSearchPapers" }

  const searchPapers = async (
    query: string,
    limit: number = 20
  ): Promise<SearchResult[]> => {
    // Use fetcher to call the server action
    console.log("searchPapers", query);
    fetcher.submit(
      { query, limit: limit.toString() },
      { method: "post", action: "/search" } // Target the search action
    );

    // The results will be available via fetcher.data or useLoaderData in the component
    // For now, we'll return an empty array or handle loading state in the component
    return []; // Or handle loading state in the component
  };

  return { searchPapers, fetcher };
};

// mapToSearchResult and related interfaces are now in src/actions/search.ts
// getApiKey is now in src/actions/search.ts
