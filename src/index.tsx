import { serve } from "bun";
import { handleSearch } from "./api/search";
import { existsSync } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { renderDocument, HomePage, ResultsPage, LibraryPage, readUserDataCookie, serializeUserDataCookie, addToHistory, upsertSaved, removeSaved } from "./ssr";
import { fetchSearchResults } from "./api/search";

const server = serve({
  routes: {
    "/api/search": {
      async POST(req) {
        return handleSearch(req);
      },
    },

    // Static file server for built assets under /dist
    "/assets/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(process.cwd(), "dist", url.pathname);
      if (existsSync(filePath)) return new Response(Bun.file(filePath));
      return new Response("Not Found", { status: 404 });
    },
    "/frontend.css": async () => {
      const filePath = path.join(process.cwd(), "dist", "frontend.css");
      if (existsSync(filePath)) return new Response(Bun.file(filePath));
      return new Response("Not Found", { status: 404 });
    },

    // Library API endpoints
    "/library/list": async (req) => {
      const user = readUserDataCookie(req.headers.get("cookie"));
      return new Response(JSON.stringify(user.savedLibrary), {
        headers: { "Content-Type": "application/json" },
      });
    },
    "/library/toggle": async (req) => {
      if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
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
          type: (String(form.get("type") || "article") as any),
          category: (form.get("category") ? String(form.get("category")) : undefined),
        } satisfies import("./types").SearchResult;
        updated = upsertSaved(updated, item);
      }

      const setCookie = serializeUserDataCookie({
        searchHistory: user.searchHistory,
        savedLibrary: updated,
      });

      // For form submissions, redirect back to the originating page
      return new Response(null, {
        status: 303,
        headers: {
          Location: returnTo,
          "Set-Cookie": setCookie,
        },
      });
    },

    // App routes -> SSR full pages, no client JS
    "/*": async (req) => {
      const url = new URL(req.url);
      const pathname = url.pathname;

      const cookiesHeader = req.headers.get("cookie");
      const user = readUserDataCookie(cookiesHeader);

      if (pathname === "/" || pathname === "") {
        return renderDocument({ content: <HomePage searchHistory={user.searchHistory} /> });
      }

      if (pathname === "/search") {
        const q = url.searchParams.get("q")?.trim() || "";
        let results: Awaited<ReturnType<typeof fetchSearchResults>> = [];
        let setCookie: string | undefined;
        let historyForRender = user.searchHistory;
        const savedIds = user.savedLibrary.map((s) => s.id);
        if (q) {
          try {
            results = await fetchSearchResults(q);
            const updatedHistory = addToHistory(user.searchHistory, q, results.length);
            historyForRender = updatedHistory;
            setCookie = serializeUserDataCookie({
              searchHistory: updatedHistory,
              savedLibrary: user.savedLibrary,
            });
          } catch (e) {
            console.error("SSR search failed:", e);
          }
        }
        return renderDocument({
          title: q ? `Results for "${q}"` : "Search",
          content: <ResultsPage query={q} results={results} searchHistory={historyForRender} savedIds={savedIds} />,
          extraHeaders: setCookie ? { "Set-Cookie": setCookie } : undefined,
        });
      }

      if (pathname === "/library") {
        return renderDocument({
          title: "Your Library",
          content: <LibraryPage savedLibrary={user.savedLibrary} searchHistory={user.searchHistory} />,
        });
      }

      // Fallback: home
  return renderDocument({ content: <HomePage searchHistory={user.searchHistory} /> });
    },

    // Examples
    // "/api/hello": {
    //   async GET(req) {
    //     return Response.json({
    //       message: "Hello, world!",
    //       method: "GET",
    //     });
    //   },
    //   async PUT(req) {
    //     return Response.json({
    //       message: "Hello, world!",
    //       method: "PUT",
    //     });
    //   },
    // },

    // "/api/hello/:name": async (req) => {
    //   const name = req.params.name;
    //   return Response.json({
    //     message: `Hello, ${name}!`,
    //   });
    // },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
