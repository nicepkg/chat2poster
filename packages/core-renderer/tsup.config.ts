import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  tsconfig: "tsconfig.build.json",
  external: ["react", "react-dom"],
  onSuccess: async () => {
    // Copy CSS file to dist
    const srcCss = join(__dirname, "src/styles.css");
    const distCss = join(__dirname, "dist/styles.css");
    if (existsSync(srcCss)) {
      if (!existsSync(dirname(distCss))) {
        mkdirSync(dirname(distCss), { recursive: true });
      }
      copyFileSync(srcCss, distCss);
      console.log("Copied styles.css to dist/");
    }
  },
});
