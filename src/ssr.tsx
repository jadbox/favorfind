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
        {faviconHref ? (
          <link rel="icon" type="image/png" href={faviconHref} />
        ) : null}
        {appleTouchIconHref ? (
          <link rel="apple-touch-icon" href={appleTouchIconHref} />
        ) : null}
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

import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";
import LibraryPage from "./pages/LibraryPage";

export { HomePage, ResultsPage, LibraryPage };

// ---------- Cookie helpers ----------

export type CookieUserData = {
  searchHistory: SearchHistory[];
  savedLibrary: SearchResult[];
};

export function readUserDataCookie(
  cookieHeader: string | null
): CookieUserData {
  const empty: CookieUserData = { searchHistory: [], savedLibrary: [] };
  if (!cookieHeader) return empty;
  const m = cookieHeader.match(/(?:^|; )user_data=([^;]+)/);
  if (!m || !m[1]) return empty;
  try {
    const json = decodeURIComponent(m[1]);
    const parsed = JSON.parse(json) as Partial<CookieUserData>;
    return {
      searchHistory: Array.isArray(parsed.searchHistory)
        ? parsed.searchHistory
        : [],
      savedLibrary: Array.isArray(parsed.savedLibrary)
        ? parsed.savedLibrary
        : [],
    };
  } catch {
    return empty;
  }
}

export function serializeUserDataCookie(data: CookieUserData): string {
  const payload = encodeURIComponent(JSON.stringify(data));
  return `user_data=${payload}; Path=/; Max-Age=${
    365 * 24 * 60 * 60
  }; SameSite=Lax`;
}

export function addToHistory(
  history: SearchHistory[],
  query: string,
  resultsCount: number
): SearchHistory[] {
  const filtered = history.filter(
    (h) => h.query.toLowerCase() !== query.toLowerCase()
  );
  const entry: SearchHistory = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount,
  };
  return [entry, ...filtered].slice(0, 20);
}

// ---------- Saved Library helpers ----------

export function upsertSaved(
  list: SearchResult[],
  item: SearchResult
): SearchResult[] {
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
