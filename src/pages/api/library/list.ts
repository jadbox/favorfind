import type { APIRoute } from "astro";

// NOTE: This is now a stub endpoint for future database integration.
// The actual library data is stored client-side in localStorage.
// When adding a database, implement the logic here to fetch from DB.

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("[List API Stub] Fetching saved library");

    // TODO: When implementing database:
    // 1. Read user session/auth
    // 2. Query database for user's saved library
    // 3. Return the list of saved items

    // For now, return empty array since data is client-side
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[List API Stub] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to get library" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
