import { defineConfig } from "vite";
import { resolve } from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  base: "/sokolski-dom/",
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 82 },
      jpeg: { quality: 82 },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        arhiv: resolve(__dirname, "arhiv-u-slikama.html"),
        projekti: resolve(__dirname, "projekti.html"),
      },
    },
  },
});
