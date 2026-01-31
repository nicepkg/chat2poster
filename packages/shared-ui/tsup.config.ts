import { defineConfig } from "tsup";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/ui/index.ts",
    "src/components/common/index.ts",
    "src/components/editor/index.ts",
    "src/components/renderer/index.ts",
    "src/contexts/index.ts",
    "src/hooks/index.ts",
    "src/lib/utils.ts",
    "src/utils/index.ts",
    "src/themes/index.ts",
  ],
  format: ["esm"],
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "recharts",
    "next-themes",
    "framer-motion",
    "shiki",
    "mermaid",
  ],
  treeshake: true,
  splitting: true,
  sourcemap: true,
  minify: false,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  async onSuccess() {
    // Copy CSS files to dist
    const cssFiles = [
      { src: "src/styles/globals.css", dist: "dist/styles/globals.css" },
      { src: "src/styles/renderer.css", dist: "dist/styles/renderer.css" },
    ];

    for (const { src, dist } of cssFiles) {
      const srcPath = join(dir, src);
      const distPath = join(dir, dist);

      if (existsSync(srcPath)) {
        const distDir = dirname(distPath);
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        copyFileSync(srcPath, distPath);
        console.log(`Copied ${src} to ${dist}`);
      }
    }
  },
});
