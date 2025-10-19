import type { SearchResult } from "@/types";

export interface DataProvider {
  fetchPapers(
    query: string,
    limit: number,
    filter_type?: string
  ): Promise<SearchResult[]>;
}
