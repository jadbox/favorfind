import { serve } from "bun";
import index from "../index.html"; // Updated path to index.html
import { handleSearch } from "./api/search";
import { existsSync } from "fs"; // Added existsSync
import path from "path"; // Added path

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // Serve static assets from the root /assets directory
    "/assets/*": async (req) => {
      const url = new URL(req.url); // Get the URL object from the request
      const filePath = path.join(
        process.cwd(),
        "assets",
        url.pathname.substring("/assets/".length) // Use url.pathname
      );
      if (existsSync(filePath)) {
        return new Response(Bun.file(filePath));
      }
      return new Response("Not Found", { status: 404 });
    },

    "/api/search": {
      async POST(req) {
        return handleSearch(req);
      },
    },

    // Examples
    // "/api/hello": {
    //   async GET(req) {
    //     return Response.json({
    //       message: "Hello, world!",
    //       method: "GET",
    //     });
    //   },
    //   async PUT(req) {
    //     return Response.json({
    //       message: "Hello, world!",
    //       method: "PUT",
    //     });
    //   },
    // },

    // "/api/hello/:name": async (req) => {
    //   const name = req.params.name;
    //   return Response.json({
    //     message: `Hello, ${name}!`,
    //   });
    // },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
