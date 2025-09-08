import { serve } from "bun";
import { handleSearch } from "./api/search";
import { existsSync } from "fs";
import { stat } from "fs/promises"; // Import stat for directory checking
import path from "path";

const server = serve({
  routes: {
    // Serve static assets from the /dist directory
    "/*": async (req) => {
      const url = new URL(req.url);
      let filePath = path.join(process.cwd(), "dist", url.pathname);

      // If the path is a directory or root or /search, serve index.html
      if (url.pathname === "/" || url.pathname === "/search") {
        filePath = path.join(process.cwd(), "dist", "index.html");
      } else {
        const fileStats = await stat(filePath);
        if (fileStats.isDirectory()) {
          filePath = path.join(filePath, "index.html");
        }
      }

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
