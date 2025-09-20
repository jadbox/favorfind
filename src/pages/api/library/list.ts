import type { APIRoute } from "astro";
import { readUserDataCookie } from "../../../CookieUserData";

export const GET: APIRoute = async ({ request }) => {
  try {
    const user = readUserDataCookie(request.headers.get("cookie"));
    return new Response(JSON.stringify(user.savedLibrary), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Library list API error:", error);
    return new Response(JSON.stringify({ error: "Failed to get library" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
