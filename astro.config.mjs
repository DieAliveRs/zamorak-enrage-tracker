import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const DEV_PORT = 4321;
const isCI = process.env.CI === "true";
const isProd = process.env.NODE_ENV === "production";

// For GitHub Pages, we need special handling
const isGitHubPages = isCI || isProd;

export default defineConfig({
  // Correct: This should be the full URL where your site will be hosted
  site: "https://diealivers.github.io",
  
  // IMPORTANT: GitHub Pages serves from your repository name
  base: isGitHubPages ? "/zamorak-enrage-tracker/" : "/",
  
  // This is good for GitHub Pages
  trailingSlash: "always",
  
  // Add output configuration
  output: "static", // or "hybrid" if using SSR
  
  // Build configuration
  build: {
    // Ensure assets are referenced correctly
    assets: "assets",
    // This helps with path resolution
    format: "directory"
  },
  
  server: {
    port: DEV_PORT,
  },

  integrations: [
    sitemap(),
    tailwind(),
  ],
});