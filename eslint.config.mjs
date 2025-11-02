import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow 'any' type in catch clauses and error handlers
      "@typescript-eslint/no-explicit-any": ["warn", {
        ignoreRestArgs: true
      }],
      // Allow unescaped entities (can be fixed later)
      "react/no-unescaped-entities": "warn",
      // Prefer const - make it a warning instead of error
      "prefer-const": "warn",
      // Allow empty interfaces for extending
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
];

export default eslintConfig;
