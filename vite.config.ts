import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {},
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {},
});

// IGNORE proxy: {
//   "/api/semantic-scholar": {
//     target: "https://api.semanticscholar.org",
//     changeOrigin: true,
//     rewrite: (path) => path.replace(/^\/api\/semantic-scholar/, ""),
//   },
// },
