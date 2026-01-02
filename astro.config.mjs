import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const DEV_PORT = 4321;
const isCI = process.env.CI === "true";

export default defineConfig({
  // CORRECT: Site is just the domain, NOT including the subdirectory
  site: isCI
    ? "https://diealivers.github.io"  // ← Remove "/zamorak-enrage-tracker"
    : `http://localhost:${DEV_PORT}`,

  // The base handles the subdirectory
  base: isCI ? "/zamorak-enrage-tracker" : "/",

  // Add this for GitHub Pages compatibility
  trailingSlash: "always",

  server: {
    port: DEV_PORT,
  },

  integrations: [
    sitemap(),
    tailwind(),
  ],
});