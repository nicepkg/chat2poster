import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core-export",
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  },
});
