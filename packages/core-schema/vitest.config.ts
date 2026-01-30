import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "core-schema",
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
  },
});
