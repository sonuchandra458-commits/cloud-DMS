import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities":          "off",
      "@typescript-eslint/no-unused-vars":    "off",
      "react-hooks/exhaustive-deps":          "off",
      "react-hooks/set-state-in-effect":      "off",
      "react-hooks/rules-of-hooks":           "off",
    },
  },
];

export default eslintConfig;