import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core-adapters",
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  },
});
