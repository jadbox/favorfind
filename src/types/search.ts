// Shared search types and utilities used by both client and server

export interface SearchParams {
  query: string;
  selectedType: string;
  sortBy: string;
  limit: number;
}

/**
 * Parse search parameters from a URL
 * Can be used on both client and server since URL is standard Web API
 */
export function parseSearchParams(url: URL): SearchParams {
  return {
    query: url.searchParams.get("q")?.trim() || "",
    selectedType: url.searchParams.get("filter_type") || "All",
    sortBy: url.searchParams.get("sortBy") || "relevance",
    limit: parseInt(url.searchParams.get("limit") || "0"),
  };
}
