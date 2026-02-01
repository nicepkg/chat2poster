import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import {
  appBaseConfig,
  appIgnores,
  appTsRules,
  createTypeScriptConfig,
  getConfigDir,
  lintOptionsConfig,
} from "../../configs/eslint/shared.mjs";

const configDir = getConfigDir(import.meta.url);

export default defineConfig(
  globalIgnores(["dist/**", ".output/**", ".wxt/**", ...appIgnores]),
  { ...appBaseConfig },
  createTypeScriptConfig({
    files: ["**/*.{ts,tsx}"],
    configDir,
    extraRules: appTsRules,
  }),
  prettier,
  lintOptionsConfig,
);
