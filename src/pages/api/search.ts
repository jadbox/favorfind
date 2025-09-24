import type { APIRoute } from "astro";
import { fetchSearchResults } from "../../api/search";
import {
  readUserDataCookie,
  serializeUserDataCookie,
  addToHistory,
} from "../../CookieUserData";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "0"),
    50 // Max limit
  );
  const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);
  const filter_type = url.searchParams.get("filter_type") || "";

  console.log(
    "Search API called with query:",
    query,
    "limit:",
    limit,
    "page:",
    page,
    "filter_type:",
    filter_type
  );
  console.log(
    "Using search provider:",
    process.env.SEARCH_PROVIDER || "gemini"
  );

  if (!query) {
    return new Response(JSON.stringify([]), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const results = await fetchSearchResults(query, limit, page, filter_type);
    console.log("Search results:", results.length);

    // Update user_data cookie with new search history entry
    const user = readUserDataCookie(request.headers.get("cookie"));
    const updatedHistory = addToHistory(
      user.searchHistory,
      query,
      results.length
    );
    const setCookie = serializeUserDataCookie({
      searchHistory: updatedHistory,
      savedLibrary: user.savedLibrary,
    });

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Search failed", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query") as string;
    const limit = Math.min(
      parseInt((formData.get("limit") as string) || "20"),
      50 // Max limit
    );
    const page = Math.max(parseInt((formData.get("page") as string) || "1"), 1);
    const filter_type = (formData.get("filter_type") as string) || "";

    const results = await fetchSearchResults(query, limit, page, filter_type);

    // Update user_data cookie with new search history entry
    const user = readUserDataCookie(request.headers.get("cookie"));
    const updatedHistory = addToHistory(
      user.searchHistory,
      query,
      results.length
    );
    const setCookie = serializeUserDataCookie({
      searchHistory: updatedHistory,
      savedLibrary: user.savedLibrary,
    });

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
