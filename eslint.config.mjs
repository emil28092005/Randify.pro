import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default [
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "src/env.d.ts", "debug-open5e.mjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/db/migrate.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
