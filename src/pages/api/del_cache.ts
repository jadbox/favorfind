import type { APIRoute } from "astro";
import { clearCache } from "../../services/cache";

export const GET: APIRoute = async () => {
  try {
    const deletedCount = clearCache();
    console.log(`Cache deletion API called: ${deletedCount} entries removed`);

    return new Response("ok. cache deleted", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Cache deletion error:", error);
    return new Response("error: failed to delete cache", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
};
