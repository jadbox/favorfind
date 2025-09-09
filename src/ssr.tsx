import React from "react";
import { renderToReadableStream } from "react-dom/server";
import type { SearchResult, SearchHistory } from "./types";

type DocumentProps = {
  title?: string;
  stylesHref?: string;
  faviconHref?: string;
  appleTouchIconHref?: string;
  content?: React.ReactNode;
  extraHeaders?: Record<string, string>;
};

export async function renderDocument({
  title = "Medeligo Cancer Research",
  stylesHref = "/frontend.css",
  faviconHref = "/assets/images/Logo-2-scaled.png",
  appleTouchIconHref = "/assets/images/Logo-2-scaled.png",
  content,
  extraHeaders,
}: DocumentProps) {
  const Html = (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {faviconHref ? <link rel="icon" type="image/png" href={faviconHref} /> : null}
        {appleTouchIconHref ? <link rel="apple-touch-icon" href={appleTouchIconHref} /> : null}
        <title>{title}</title>
        {stylesHref ? <link rel="stylesheet" href={stylesHref} /> : null}
      </head>
      <body>
        <div id="root">{content}</div>
      </body>
    </html>
  );

  const stream = await renderToReadableStream(Html);
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    ...(extraHeaders || {}),
  };
  return new Response(stream, { headers });
}

// --------- Simple server-only components (no client JS) ---------

function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <a href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-900">Medeligo</span>
        </a>
        <nav className="flex items-center space-x-4">
          <a href="/library" className="btn btn-ghost btn-sm">Library</a>
        </nav>
      </div>
    </header>
  );
}

function Disclaimer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
      <div className="max-w-7xl mx-auto text-sm text-gray-500">
        For informational purposes only — not a substitute for professional medical advice.
      </div>
    </footer>
  );
}

function Sidebar({ searchHistory }: { searchHistory: SearchHistory[] }) {
  const today = new Date().toDateString();
  const todayHistory = searchHistory.filter((item) => new Date(item.timestamp).toDateString() === today);
  const olderHistory = searchHistory.filter((item) => new Date(item.timestamp).toDateString() !== today);
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen">
      <a href="/" className="btn btn-primary btn-outline w-full mb-6">New Search</a>
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-2">Prepared for You</h3>
        <div className="text-sm text-gray-600">Personalized recommendations will appear here based on your search patterns.</div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Your Search History</h3>
        {todayHistory.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Today</h4>
            <div className="space-y-2">
              {todayHistory.map((item) => (
                <a key={item.id} href={`/search?q=${encodeURIComponent(item.query)}`} className="block text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded">
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">{item.resultsCount} results</div>
                </a>
              ))}
            </div>
          </div>
        )}
        {olderHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Earlier</h4>
            <div className="space-y-2">
              {olderHistory.slice(0, 10).map((item) => (
                <a key={item.id} href={`/search?q=${encodeURIComponent(item.query)}`} className="block text-sm text-gray-700 hover:text-medical-600 hover:bg-gray-50 p-2 rounded">
                  <div className="truncate">{item.query}</div>
                  <div className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleDateString()} • {item.resultsCount} results</div>
                </a>
              ))}
            </div>
          </div>
        )}
        {searchHistory.length === 0 && (
          <div className="text-sm text-gray-500">Your recent searches will appear here.</div>
        )}
      </div>
    </aside>
  );
}

export function HomePage({ searchHistory = [] }: { searchHistory?: SearchHistory[] }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to Medeligo Research.</h1>
              <h2 className="text-2xl text-gray-600 font-medium">What do you want to search today?</h2>
            </div>
            <form action="/search" method="get" className="mb-12">
              <div className="relative flex items-center">
                <input type="text" name="q" placeholder="Ask Medeligo a question" className="input input-bordered w-full pr-24 pl-6 text-lg h-16 bg-white border-2 border-gray-300 focus:border-medical-600 focus:outline-none rounded-xl" />
                <div className="absolute right-3 flex items-center">
                  <button type="submit" className="inline-flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium px-4 rounded-lg shadow h-12">Search</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}

export function ResultsPage({ query, results, searchHistory = [], savedIds = [] }: { query: string; results: SearchResult[]; searchHistory?: SearchHistory[]; savedIds?: string[] }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <a href="/" className="btn btn-ghost btn-sm">← Back</a>
              <form action="/search" method="get" className="flex-1">
                <div className="relative flex items-center">
                  <input type="text" name="q" defaultValue={query} placeholder="Ask Medeligo a question" className="input input-bordered w-full pr-24 pl-6 text-lg h-16 bg-white border-2 border-gray-300 focus:border-medical-600 focus:outline-none rounded-xl" />
                  <div className="absolute right-3 flex items-center">
                    <button type="submit" className="inline-flex items-center gap-2 bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium px-4 rounded-lg shadow h-12">Search</button>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Search Results for "{query}"</h2>
              <div className="text-sm text-gray-600">{results.length} results</div>
            </div>
            <div className="grid gap-6">
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No results found</div>
              ) : (
                results.map((r) => (
                  <article key={r.id} className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body p-6">
                      <h3 className="card-title text-lg font-semibold text-gray-900 mb-2">
                        <a href={r.url} target="_blank" rel="noreferrer" className="hover:underline">{r.title}</a>
                      </h3>
                      <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                        <span className="font-medium">{r.source}</span>
                        <span>•</span>
                        <span>{r.publicationDate}</span>
                        <span>•</span>
                        <span>{r.citationCount} citations</span>
                      </div>
                      {r.abstract ? <p className="text-gray-700 text-sm mb-4">{r.abstract}</p> : null}
                      <div className="card-actions justify-end">
                        <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open Article</a>
                        <form action="/library/toggle" method="post">
                          {/* Hidden fields conveying minimal item data for cookie storage */}
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="title" value={r.title} />
                          <input type="hidden" name="source" value={r.source} />
                          <input type="hidden" name="publisher" value={r.publisher || ""} />
                          <input type="hidden" name="publicationDate" value={r.publicationDate} />
                          <input type="hidden" name="abstract" value={r.abstract || ""} />
                          <input type="hidden" name="citationCount" value={String(r.citationCount || 0)} />
                          <input type="hidden" name="url" value={r.url} />
                          <input type="hidden" name="type" value={r.type || "article"} />
                          {r.category ? <input type="hidden" name="category" value={r.category} /> : null}
                          <input type="hidden" name="returnTo" value={`/search?q=${encodeURIComponent(query)}`} />
                          {savedIds.includes(r.id) ? (
                            <button type="submit" name="action" value="remove" className="btn btn-outline btn-sm">Unsave</button>
                          ) : (
                            <button type="submit" name="action" value="save" className="btn btn-secondary btn-sm">Save</button>
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

export function LibraryPage({ savedLibrary, searchHistory = [] }: { savedLibrary: SearchResult[]; searchHistory?: SearchHistory[] }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar searchHistory={searchHistory} />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
            </div>
            {savedLibrary.length > 0 ? (
              <div className="grid gap-4">
                {savedLibrary.map((item) => (
                  <div key={item.id} className="card bg-white border border-gray-200 shadow-sm">
                    <div className="card-body p-6">
                      <h3 className="card-title text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                        <span className="font-medium">{item.source}</span>
                        <span>•</span>
                        <span>{new Date(item.publicationDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{item.abstract}</p>
                      <div className="card-actions justify-end">
                        <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Open Article</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your library is empty</h3>
                <p className="text-gray-600 mb-6">Start saving articles from your search results to build your personal research library.</p>
                <a href="/" className="btn btn-primary">Start Searching</a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Disclaimer />
    </div>
  );
}

// ---------- Cookie helpers ----------

export type CookieUserData = {
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
};

export function readUserDataCookie(cookieHeader: string | null): CookieUserData {
  const empty: CookieUserData = { searchHistory: [], savedLibrary: [] };
  if (!cookieHeader) return empty;
  const m = cookieHeader.match(/(?:^|; )user_data=([^;]+)/);
  if (!m || !m[1]) return empty;
  try {
    const json = decodeURIComponent(m[1]);
    const parsed = JSON.parse(json) as Partial<CookieUserData>;
    return {
      searchHistory: Array.isArray(parsed.searchHistory) ? parsed.searchHistory : [],
      savedLibrary: Array.isArray(parsed.savedLibrary) ? parsed.savedLibrary : [],
    };
  } catch {
    return empty;
  }
}

export function serializeUserDataCookie(data: CookieUserData): string {
  const payload = encodeURIComponent(JSON.stringify(data));
  return `user_data=${payload}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

export function addToHistory(history: SearchHistory[], query: string, resultsCount: number): SearchHistory[] {
  const filtered = history.filter((h) => h.query.toLowerCase() !== query.toLowerCase());
  const entry: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount,
  };
  return [entry, ...filtered].slice(0, 20);
}

// ---------- Saved Library helpers ----------

export function upsertSaved(list: SearchResult[], item: SearchResult): SearchResult[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    const copy = list.slice();
    copy[idx] = item;
    return copy;
  }
  return [item, ...list].slice(0, 200);
}

export function removeSaved(list: SearchResult[], id: string): SearchResult[] {
  return list.filter((x) => x.id !== id);
}
