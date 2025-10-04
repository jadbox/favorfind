import type { APIRoute } from "astro";
import type { SearchResult } from "../../../types";

// NOTE: This is now a stub endpoint for future database integration.
// The actual save/remove logic happens client-side in localStorage.
// When adding a database, implement the logic here to persist to DB.

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const action = (form.get("action") as string) || "save";

    if (action === "remove") {
      const itemId = String(form.get("id") || "");
      console.log("[Toggle API Stub] Remove item:", itemId);

      // TODO: When implementing database:
      // 1. Read user session/auth
      // 2. Delete item from database
      // 3. Return success/failure
    } else {
      // Parse the full search result item from form data
      const categoryValue = form.get("category");
      const category =
        categoryValue && categoryValue !== "null"
          ? (categoryValue as "article" | "trial" | "guideline")
          : "article";

      const item: SearchResult = {
        id: String(form.get("id") || ""),
        title: String(form.get("title") || ""),
        source: String(form.get("source") || ""),
        publisher: String(form.get("publisher") || ""),
        publicationDate: String(form.get("publicationDate") || ""),
        abstract: String(form.get("abstract") || ""),
        citationCount: Number(form.get("citationCount") || 0),
        url: String(form.get("url") || ""),
        category: category,
      };

      console.log(
        "[Toggle API Stub] Save item:",
        item.id,
        item.title.substring(0, 50)
      );

      // TODO: When implementing database:
      // 1. Read user session/auth
      // 2. Save/update item in database
      // 3. Return success/failure
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Toggle API Stub] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to update library" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
