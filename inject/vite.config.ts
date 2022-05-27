import { resolve, join } from "path";
import { defineConfig } from "vite";
import glob from "glob";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        dir: join(__dirname, "dist"),
      },
      input: glob.sync(resolve(__dirname, "samples", "*.html")),
    },
  },
  server: {
    open: "/samples/vite_default.html",
  },
});
