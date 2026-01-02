import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const DEV_PORT = 4321;
const isCI = process.env.CI === "true";

export default defineConfig({
  site: isCI
    ? "https://diealivers.github.io/zamorak-enrage-tracker"
    : `http://localhost:${DEV_PORT}`,

  base: isCI ? "/zamorak-enrage-tracker" : "/",

  server: {
    port: DEV_PORT,
  },

  integrations: [
    sitemap(),
    tailwind(),
  ],
});
