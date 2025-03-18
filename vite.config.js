import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    minify: "terser",  
    terserOptions: {
      format: {
        comments: false, 
      }
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      treeshake: false,
      input: {
        main: resolve(__dirname, "index.html"),
        setupProfile: resolve(__dirname, "html/setup-profile.html"),
        home: resolve(__dirname, "html/home.html"),
        profile: resolve(__dirname, "html/profile.html"),
        settings: resolve(__dirname, "html/settings.html"),
        adminDashboard: resolve(__dirname, "html/admin-dashboard.html"),
        community: resolve(__dirname, "html/community.html"),
        post: resolve(__dirname, "html/post.html"),
        explore: resolve(__dirname, "html/explore.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name]-chunk.js",
        assetFileNames: "assets/[name][extname]",
        manualChunks: { 
           firebase: ['firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    }
  },
  publicDir: "public",
  server: {
    open: true
  }
});