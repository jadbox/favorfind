import React from "react";
import type { SearchResult, SearchHistory } from "../types";
import Header from "../components/Header";
import Disclaimer from "../components/Disclaimer";
import Sidebar from "../components/Sidebar";
import { ArrowLeft } from "lucide-react";
import SearchBar from "../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";

export function ResultsPage({
  query,
  results,
  searchHistory = [],
  savedIds = [],
}: {
  query: string;
  results: SearchResult[];
  searchHistory?: SearchHistory[];
  savedIds?: string[];
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <a
                href="/"
                className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </a>
              <br />
              <div className="flex-1">
                <SearchBar query={query} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Search Results for "{query}"
              </h2>
              <div className="text-sm text-gray-600">
                {results.length} results
              </div>
            </div>
            <div className="grid gap-4">
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No results found
                </div>
              ) : (
                results.map((r) => (
                  <SearchResultCard
                    key={r.id}
                    result={r}
                    isSaved={savedIds.includes(r.id)}
                    returnTo={`/search?q=${encodeURIComponent(query)}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}

// Server route handler for "/search"
export async function handleSearchPageRequest(
  ctx: import("@/server/context").RequestContext
) {
  const { url, user } = ctx;
  const q = url.searchParams.get("q")?.trim() || "";
  let results: import("@/types").SearchResult[] = [];
  let setCookie: string | undefined;
  let historyForRender = user.searchHistory;
  const savedIds = user.savedLibrary.map((s) => s.id);

  if (q) {
    const { fetchSearchResults } = await import("@/api/search");
    const { addToHistory, serializeUserDataCookie } = await import(
      "@/CookieUserData"
    );
    results = await fetchSearchResults(q);
    const updatedHistory = addToHistory(user.searchHistory, q, results.length);
    historyForRender = updatedHistory;
    setCookie = serializeUserDataCookie({
      searchHistory: updatedHistory,
      savedLibrary: user.savedLibrary,
    });
  }

  const { renderDocument } = await import("@/Document");
  return renderDocument({
    title: q ? `Results for "${q}"` : "Search",
    content: (
      <ResultsPage
        query={q}
        results={results}
        searchHistory={historyForRender}
        savedIds={savedIds}
      />
    ),
    extraHeaders: setCookie ? { "Set-Cookie": setCookie } : undefined,
  });
}
