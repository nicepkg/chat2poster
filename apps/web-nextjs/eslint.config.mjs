import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: configDir,
});

const nextConfigs = compat
  .extends("next/core-web-vitals", "next/typescript")
  .map((config) => {
    const languageOptions =
      config.languageOptions && typeof config.languageOptions === "object"
        ? config.languageOptions
        : {};
    const parserOptions =
      "parserOptions" in languageOptions &&
      languageOptions.parserOptions &&
      typeof languageOptions.parserOptions === "object"
        ? languageOptions.parserOptions
        : {};

    return {
      ...config,
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...parserOptions,
          tsconfigRootDir: configDir,
        },
      },
    };
  });

export default defineConfig(
  ...nextConfigs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      import: eslintPluginImport,
      prettier: eslintPluginPrettier,
    },
    settings: {
      next: {
        rootDir: configDir,
      },
    },
    rules: {
      "import/no-anonymous-default-export": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "prettier/prettier": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: configDir,
      },
    },
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
);
