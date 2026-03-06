import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/sokolski-dom/",
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
