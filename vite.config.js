import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // Root directory remains the project folder
  build: {
    outDir: "dist", // Ensure everything is built into dist/
    emptyOutDir: true, // Clears dist before building
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  publicDir: "html", // Tells Vite to copy everything inside html/ to dist/
  server: {
    open: true, // Automatically open browser on start
  },
});
