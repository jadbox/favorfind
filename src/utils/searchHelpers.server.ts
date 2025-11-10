// Server-side search helpers - imports server-only modules (cache, API)
import type { SearchResult } from "../types";
import type { SearchParams } from "../types/search";
import { parseSearchParams } from "../types/search";
import { _fetchSearchResults as fetchSearchResults } from "../api/search";

// Re-export shared utilities
export { parseSearchParams };

export interface SearchData {
  results: SearchResult[];
  error: string | null;
  savedStatus: Record<string, boolean>;
}

export function buildFilterParams(params: SearchParams): string {
  return [
    params.selectedType !== "All" && params.selectedType,
    params.sortBy !== "relevance" && `${params.sortBy}`,
  ]
    .filter(Boolean)
    .join(",");
}

export async function performSearch(params: SearchParams): Promise<SearchData> {
  let results: SearchResult[] = [];
  let error: string | null = null;
  let savedStatus: Record<string, boolean> = {};

  if (!params.query) {
    return { results, error, savedStatus };
  }

  const query = decodeURIComponent(params.query);

  try {
    const filterParams = buildFilterParams(params);
    results = await fetchSearchResults(query, params.limit, 1, filterParams);
  } catch (err) {
    console.error("Search error:", err);
    error = err instanceof Error ? err.message : "Search failed";
  }

  return { results, error, savedStatus };
}
