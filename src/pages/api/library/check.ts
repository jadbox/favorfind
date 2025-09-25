import type { APIRoute } from "astro";
import { readUserDataCookie } from "../../../CookieUserData";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return new Response(JSON.stringify({ error: "ids must be an array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = readUserDataCookie(request.headers.get("cookie"));
    const savedIds = new Set(user.savedLibrary.map((item) => item.id));

    const result: Record<string, boolean> = {};
    ids.forEach((id) => {
      result[id] = savedIds.has(id);
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Library check API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check saved status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
