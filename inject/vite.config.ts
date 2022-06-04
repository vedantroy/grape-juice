import path, { resolve, join } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import glob from "glob";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        dir: join(__dirname, "dist"),
      },
      input: glob
        .sync(resolve(__dirname, "samples", "*.html"))
        .filter((filePath) => {
          const fileName = path.basename(filePath);
          return !fileName.startsWith("IGNORE");
        }),
    },
  },
  server: {
    open: "/samples/index.html",
  },
});
