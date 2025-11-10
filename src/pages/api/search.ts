import type { APIRoute } from "astro";
import { _fetchSearchResults as fetchSearchResults } from "../../api/search";

// export const GET: APIRoute = async ({ request }) => {
//   const url = new URL(request.url);
//   let query = url.searchParams.get("q")?.trim() || "";
//   query = decodeURIComponent(query);
//   console.log("Received search query:", query);
//   throw new Error("Debugging search API");

//   const limit = Math.min(
//     parseInt(url.searchParams.get("limit") || "0"),
//     50 // Max limit
//   );
//   const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);
//   let filter_type = url.searchParams.get("filter_type") || "";
//   const sortBy = url.searchParams.get("sortBy") || "";
//   filter_type += sortBy ? ` ${sortBy}` : "";

//   console.log(
//     "Search API called with query:",
//     query,
//     "limit:",
//     limit,
//     "page:",
//     page,
//     "filter_type:",
//     filter_type
//   );
//   console.log(
//     "Using search provider:",
//     process.env.SEARCH_PROVIDER || "gemini"
//   );

//   if (!query) {
//     return new Response(JSON.stringify([]), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   try {
//     const results = await fetchSearchResults(query, limit, page, filter_type);
//     console.log("Search results:", results.length);

//     // Note: Search history is now saved client-side via localStorage
//     // See search.astro <script> tag for client-side history saving

//     return new Response(JSON.stringify(results), {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {
//     console.error("Search API error:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     return new Response(
//       JSON.stringify({ error: "Search failed", details: errorMessage }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// };

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    let query = formData.get("query") as string;
    query = decodeURIComponent(query);
    console.log("Received search query:", query);
    throw new Error("Debugging search API");

    const limit = Math.min(
      parseInt((formData.get("limit") as string) || "20"),
      50 // Max limit
    );
    const page = Math.max(parseInt((formData.get("page") as string) || "1"), 1);
    const filter_type = (formData.get("filter_type") as string) || "";

    const results = await fetchSearchResults(query, limit, page, filter_type);

    // Note: Search history is now saved client-side via localStorage

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
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
