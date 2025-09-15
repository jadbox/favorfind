import type { SearchResult } from "@/types";

// Simple client wrapper to call the backend search API and return results.
export async function searchPapers(
  query: string,
  limit: number = 20
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const form = new FormData();
  form.append("query", query);
  form.append("limit", String(limit));
  const res = await fetch("/api/search", { method: "POST", body: form });
  if (!res.ok) return [];
  return (await res.json()) as SearchResult[];
}
