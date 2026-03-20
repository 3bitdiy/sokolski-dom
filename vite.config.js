import { defineConfig } from "vite";
import { resolve } from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  base: "/",
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 82 },
      jpeg: { quality: 82 },
    }),
    {
      name: "remove-noindex",
      transformIndexHtml(html) {
        return html
          .replace(/<meta name="robots"[^>]*noindex[^>]*>\s*/gi, "")
          .replace(/<meta name="googlebot"[^>]*noindex[^>]*>\s*/gi, "");
      },
    },
  ],
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        arhiv: resolve(__dirname, "arhiv-u-slikama.html"),
        projekti: resolve(__dirname, "projekti.html"),
      },
    },
  },
});
