import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "html/home.html"),
        profile: resolve(__dirname, "html/profile.html"),
        settings: resolve(__dirname, "html/settings.html"),
        adminDashboard: resolve(__dirname, "html/admin-dashboard.html"),
        community: resolve(__dirname, "html/community.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  publicDir: "public",
  server: {
    open: true
    }
});