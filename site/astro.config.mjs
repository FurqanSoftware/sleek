import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const sleekScss = fileURLToPath(new URL("../scss", import.meta.url));

export default defineConfig({
  site: "https://furqansoftware.github.io",
  base: "/sleek",
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          loadPaths: [sleekScss],
          importers: [new sass.NodePackageImporter()],
        },
      },
    },
  },
});
