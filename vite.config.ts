import { defineConfig } from "vite";

// Relative base so the same build works at the Pages root and under /pr-preview/pr-N/
export default defineConfig({
  base: "./",
});
