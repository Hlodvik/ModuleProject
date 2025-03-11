import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".", // Root remains the project folder
  build: {
    outDir: "dist", // Everything is built into dist/
    emptyOutDir: true, // Clears dist before building
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"), // Define entry points manually
        home: resolve(__dirname, "html/home.html"),
        profile: resolve(__dirname, "html/profile.html"),
        settings: resolve(__dirname, "html/settings.html"),
        settings: resolve(__dirname, "html/admin-dashboard.html"),
        settings: resolve(__dirname, "html/community.html")

      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  publicDir: "public", // If you have assets like images, icons, etc.
  server: {
    open: true, // Open browser on dev start
  },
});