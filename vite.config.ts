/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

const fileName = {
  es: "embed.js",
  iife: "embed.iife.js",
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build/dist",
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "TaskonEmbed",
      formats,
      fileName: format => fileName[format],
    },
  },
  test: {
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@@": path.resolve(__dirname),
    },
  },
});
