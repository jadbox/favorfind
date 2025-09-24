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
  const limit = Number(url.searchParams.get("limit") || 20);

  console.log("Search API called with query:", query);
  console.log(
    "Using search provider:",
    process.env.SEARCH_PROVIDER || "semantic-scholar"
  );
  console.log(
    "Environment check:",
    process.env.SEMANTIC_SCHOLAR_API
      ? "Semantic Scholar API key found"
      : "Semantic Scholar API key missing"
  );
  console.log(
    "Gemini API key check:",
    process.env.GEMINI_API_KEY
      ? "Gemini API key found"
      : "Gemini API key missing"
  );

  if (!query) {
    return new Response(JSON.stringify([]), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const results = await fetchSearchResults(query, limit);
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
    const limit = Number(formData.get("limit") || 20);

    const results = await fetchSearchResults(query, limit);

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
