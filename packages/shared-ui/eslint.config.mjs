import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import {
  createTypeScriptConfig,
  getConfigDir,
  packageIgnores,
} from "../../configs/eslint/shared.mjs";

const configDir = getConfigDir(import.meta.url);

export default defineConfig(
  globalIgnores(packageIgnores),
  createTypeScriptConfig({
    files: ["src/**/*.ts", "src/**/*.tsx"],
    configDir,
    globals: {
      ...globals.node,
      ...globals.browser,
    },
    extraRules: {
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  }),
);
