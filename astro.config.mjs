import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: undefined, // Using Bun's built-in server
  vite: {
    plugins: [tailwindcss()],
  },
});
