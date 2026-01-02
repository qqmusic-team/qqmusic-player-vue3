import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,mjs,jsx,ts,tsx,vue}"],
  },

  {
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },

  // JavaScript files configuration
  {
    files: ["**/*.{js,mjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // TypeScript files configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tsparser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Vue files configuration
  {
    files: ["**/*.vue"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: pluginVue.parser,
      parserOptions: {
        parser: tsparser,
        sourceType: "module",
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  js.configs.recommended,
  ...pluginVue.configs["flat/essential"],

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  {
    rules: {
      "no-unused-vars": "off",
    },
  },
];
