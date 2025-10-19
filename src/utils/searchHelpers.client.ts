// Client-side only search helpers (no server imports)
import type { SearchParams } from "../types/search";
import { parseSearchParams } from "../types/search";
import { addSearchToHistory } from "./localStorage";

// Re-export shared utilities
export { parseSearchParams };

// Client-side only function to save search to history
export function saveSearchToHistory(
  params: SearchParams,
  resultsCount: number
): void {
  if (typeof window === "undefined") return;

  const filters = {
    selectedType:
      params.selectedType !== "All" ? params.selectedType : undefined,
    sortBy: params.sortBy !== "relevance" ? params.sortBy : undefined,
  };

  addSearchToHistory(params.query, resultsCount, filters);
}
