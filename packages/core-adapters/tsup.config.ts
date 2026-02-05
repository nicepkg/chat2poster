import { defineConfig } from "tsup";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { TsconfigPathsPlugin } = require("@esbuild-plugins/tsconfig-paths");

export default defineConfig({
  entry: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
    "!src/**/*.stories.*",
  ],
  format: ["esm"],
  bundle: true,
  tsconfig: "tsconfig.json",
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  treeshake: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  clean: true,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  esbuildPlugins: [TsconfigPathsPlugin({ tsconfig: "tsconfig.json" })],
  external: ["@chat2poster/core-schema"],
});
