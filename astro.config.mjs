import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
  site: "https://randify.pro",
  integrations: [sitemap({
    i18n: {
      defaultLocale: "en",
      locales: {
        en: "en-US",
        ru: "ru-RU",
      },
    },
  })],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
