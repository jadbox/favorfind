import type { APIRoute } from "astro";

// NOTE: This is a debug endpoint. User data is now stored client-side in localStorage.
// This endpoint can be used to verify the migration was successful.

export const GET: APIRoute = async () => {
  try {
    return new Response(
      JSON.stringify(
        {
          message: "User data migrated to localStorage",
          storage: "client-side",
          note: "Check browser DevTools > Application > Local Storage for 'medeligo-user-data'",
          apiStatus: "Endpoints are stubs for future database integration",
        },
        null,
        2
      ),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Debug API] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
