import type { APIRoute } from "astro";

// NOTE: This is now a stub endpoint for future database integration.
// Saved status is checked client-side via localStorage.
// When adding a database, implement the logic here to check saved status.

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return new Response(JSON.stringify({ error: "ids must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("[Check API Stub] Checking saved status for", ids.length, "items");

    // TODO: When implementing database:
    // 1. Read user session/auth
    // 2. Query database for saved items
    // 3. Return status for each ID

    // For now, return empty result since data is client-side
    const result: Record<string, boolean> = {};
    ids.forEach((id) => {
      result[id] = false;
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Check API Stub] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check saved status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
