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
    files: ["src/**/*.ts"],
    configDir,
    globals: {
      ...globals.node,
    },
  }),
);
