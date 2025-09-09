import React from "react";
import type { SearchResult, SearchHistory } from "../types";
import Header from "../components/Header";
import Disclaimer from "../components/Disclaimer";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";

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
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <a href="/" className="btn btn-ghost btn-sm">
                ← Back
              </a>
              <SearchBar query={query} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{query}"
              </h2>
              <div className="text-sm text-gray-600">
                {results.length} results
              </div>
            </div>
            <div className="grid gap-6">
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No results found
                </div>
              ) : (
                results.map((r) => (
                  <article
                    key={r.id}
                    className="card bg-white border border-gray-200 shadow-sm"
                  >
                    <div className="card-body p-6">
                      <h3 className="card-title text-lg font-semibold text-gray-900 mb-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {r.title}
                        </a>
                      </h3>
                      <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                        <span className="font-medium">{r.source}</span>
                        <span>•</span>
                        <span>{r.publicationDate}</span>
                        <span>•</span>
                        <span>{r.citationCount} citations</span>
                      </div>
                      {r.abstract ? (
                        <p className="text-gray-700 text-sm mb-4">
                          {r.abstract}
                        </p>
                      ) : null}
                      <div className="card-actions justify-end">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Open Article
                        </a>
                        <form action="/library/toggle" method="post">
                          {/* Hidden fields conveying minimal item data for cookie storage */}
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="title" value={r.title} />
                          <input type="hidden" name="source" value={r.source} />
                          <input
                            type="hidden"
                            name="publisher"
                            value={r.publisher || ""}
                          />
                          <input
                            type="hidden"
                            name="publicationDate"
                            value={r.publicationDate}
                          />
                          <input
                            type="hidden"
                            name="abstract"
                            value={r.abstract || ""}
                          />
                          <input
                            type="hidden"
                            name="citationCount"
                            value={String(r.citationCount || 0)}
                          />
                          <input type="hidden" name="url" value={r.url} />
                          <input
                            type="hidden"
                            name="type"
                            value={r.type || "article"}
                          />
                          {r.category ? (
                            <input
                              type="hidden"
                              name="category"
                              value={r.category}
                            />
                          ) : null}
                          <input
                            type="hidden"
                            name="returnTo"
                            value={`/search?q=${encodeURIComponent(query)}`}
                          />
                          {savedIds.includes(r.id) ? (
                            <button
                              type="submit"
                              name="action"
                              value="remove"
                              className="btn btn-outline btn-sm"
                            >
                              Unsave
                            </button>
                          ) : (
                            <button
                              type="submit"
                              name="action"
                              value="save"
                              className="btn btn-secondary btn-sm"
                            >
                              Save
                            </button>
                          )}
                        </form>
                      </div>
                    </div>
                  </article>
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
