import { serve } from "bun";
import { handleSearch, fetchSearchResults } from "./api/search";
import { createRequestContext } from "./server/context";
import { serveAssetPrefix, serveFrontendCss } from "./server/static";
import {
  readUserDataCookie,
  serializeUserDataCookie,
  upsertSaved,
  removeSaved,
  addToHistory,
} from "./CookieUserData";
import { renderDocument } from "./Document";
import { HomePage } from "./pages/HomePage";
import { ResultsPage } from "./pages/ResultsPage";
import LibraryPage from "./pages/LibraryPage";
import React from "react";
import { Router as WouterRouter, Route, Switch } from "wouter";

const server = serve({
  fetch: async (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // API: search
    if (
      pathname === "/api/search" &&
      (req.method === "POST" || req.method === "GET")
    ) {
      return handleSearch(req);
    }

    // Static assets
    if (pathname.startsWith("/assets/")) {
      return serveAssetPrefix(req);
    }
    if (pathname === "/frontend.css") {
      return serveFrontendCss();
    }

    // Library API endpoints
    if (pathname === "/library/list") {
      const user = readUserDataCookie(req.headers.get("cookie"));
      return new Response(JSON.stringify(user.savedLibrary), {
        headers: { "Content-Type": "application/json" },
      });
    }
    if (pathname === "/library/toggle" && req.method === "POST") {
      const form = await req.formData();
      const action = (form.get("action") as string) || "save";
      const returnTo = (form.get("returnTo") as string) || "/library";
      const user = readUserDataCookie(req.headers.get("cookie"));

      let updated = user.savedLibrary;
      if (action === "remove") {
        const id = String(form.get("id") || "");
        updated = removeSaved(updated, id);
      } else {
        const item = {
          id: String(form.get("id") || ""),
          title: String(form.get("title") || ""),
          source: String(form.get("source") || ""),
          publisher: String(form.get("publisher") || ""),
          publicationDate: String(form.get("publicationDate") || ""),
          abstract: String(form.get("abstract") || ""),
          citationCount: Number(form.get("citationCount") || 0),
          url: String(form.get("url") || ""),
          type: String(form.get("type") || "article") as any,
          category: form.get("category")
            ? String(form.get("category"))
            : undefined,
        } satisfies import("./types").SearchResult;
        updated = upsertSaved(updated, item);
      }

      const setCookie = serializeUserDataCookie({
        searchHistory: user.searchHistory,
        savedLibrary: updated,
      });

      return new Response(null, {
        status: 303,
        headers: {
          Location: returnTo,
          "Set-Cookie": setCookie,
        },
      });
    }

    // SSR pages via Wouter
    const ctx = createRequestContext(req);
    const ssrPath = url.pathname;
    const ssrSearch = url.search || "";

    // Preload cookie user for SSR pages
    const user = ctx.user;
    const q = url.searchParams.get("q")?.trim() || "";

    // SSR data preparation
    let results: Awaited<ReturnType<typeof fetchSearchResults>> = [];
    let setCookie: string | undefined;
    let historyForRender = user.searchHistory;
    const savedIds = user.savedLibrary.map((s) => s.id);

    if (pathname === "/search" && q) {
      results = await fetchSearchResults(q);
      const updatedHistory = addToHistory(
        user.searchHistory,
        q,
        results.length
      );
      historyForRender = updatedHistory;
      setCookie = serializeUserDataCookie({
        searchHistory: updatedHistory,
        savedLibrary: user.savedLibrary,
      });
    } else if (pathname === "/search") {
      // This handles the case where we redirect back to the search page
      // and the results need to be re-fetched.
      results = await fetchSearchResults(q);
    }

    return renderDocument({
      content: (
        <WouterRouter ssrPath={ssrPath} ssrSearch={ssrSearch}>
          <Switch>
            <Route path="/">
              <HomePage searchHistory={user.searchHistory} />
            </Route>
            <Route path="/search">
              <ResultsPage
                query={q}
                results={results}
                searchHistory={historyForRender}
                savedIds={savedIds}
              />
            </Route>
            <Route path="/library">
              <LibraryPage
                savedLibrary={user.savedLibrary}
                searchHistory={user.searchHistory}
              />
            </Route>
            <Route>Not Found</Route>
          </Switch>
        </WouterRouter>
      ),
      extraHeaders: setCookie ? { "Set-Cookie": setCookie } : undefined,
    });
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
