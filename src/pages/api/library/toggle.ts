import type { APIRoute } from "astro";
import {
  readUserDataCookie,
  serializeUserDataCookie,
  upsertSaved,
  removeSaved,
} from "../../../CookieUserData";
import type { SearchResult } from "../../../types";

export const POST: APIRoute = async ({ request }) => {
  try {
    const form = await request.formData();
    const action = (form.get("action") as string) || "save";
    const returnTo = (form.get("returnTo") as string) || "/library";

    const user = readUserDataCookie(request.headers.get("cookie"));

    let updated = user.savedLibrary;
    if (action === "remove") {
      const id = String(form.get("id") || "");
      updated = removeSaved(updated, id);
    } else {
      const item: SearchResult = {
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
      };
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
  } catch (error) {
    console.error("Library toggle API error:", error);
    return new Response(JSON.stringify({ error: "Failed to update library" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
