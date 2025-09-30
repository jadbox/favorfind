// Simple client wrapper to call the backend search API and return results.
// export async function searchPapers(
//   query: string,
//   limit: number = 0,
//   sortBy: string = "",
//   page: number = 1,
//   filter_type: string = "",
//   origin: string = ""
// ): Promise<SearchResult[]> {
//   if (!query.trim()) return [];
//   const form = new FormData();
//   form.append("query", query);
//   form.append("limit", String(limit));
//   form.append("page", String(page));
//   form.append("filter_type", filter_type);
//   form.append("sortBy", sortBy);
//   const res = await fetch(`${origin}/api/search`, {
//     method: "POST",
//     body: form,
//   });
//   if (!res.ok) return [];
//   return (await res.json()) as SearchResult[];
// }
