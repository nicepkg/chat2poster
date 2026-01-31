import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  minify: false,
  tsconfig: "tsconfig.json",
});
