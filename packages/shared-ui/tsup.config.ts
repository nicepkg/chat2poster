import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/ui/index.ts",
    "src/components/common/index.ts",
    "src/components/editor/index.ts",
    "src/contexts/index.ts",
    "src/hooks/index.ts",
    "src/lib/utils.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "recharts",
    "next-themes",
  ],
  treeshake: true,
  splitting: true,
  sourcemap: true,
  minify: false,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
