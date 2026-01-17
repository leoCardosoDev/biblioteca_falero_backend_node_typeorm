import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "boundaries/elements": [
        { type: "shared", pattern: "src/shared/**" },
        { type: "module", pattern: "src/modules/*", capture: ["moduleName"] },
        { type: "domain", pattern: "src/domain/**" },
        { type: "application", pattern: "src/application/**" },
        { type: "presentation", pattern: "src/presentation/**" },
        { type: "infrastructure", pattern: "src/infra/**" }
      ]
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            // Modular Monolith Rules - modules can access shared, other modules, and legacy layers during migration
            { from: "module", allow: ["shared", "module", "domain", "application", "infrastructure"] },
            {
              from: [["module", { moduleName: "identity" }]],
              allow: [["module", { moduleName: "geography" }], "shared", "domain", "application"]
            },
            // Legacy Horizontal Layer Rules (to be removed after migration)
            { from: "domain", allow: ["domain", "shared"] },
            { from: "application", allow: ["domain", "application", "shared"] },
            { from: "presentation", allow: ["domain", "application", "presentation", "shared", "module"] },
            { from: "infrastructure", allow: ["domain", "application", "infrastructure", "shared", "module"] }
          ]
        }
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/comma-spacing": "off",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-namespace": "off",
      "import/export": "off"
    }
  },
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**", "**/index.ts"]
  },
  {
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/config/routes.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["src/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/!(domain)*/**", "@/!(domain)*"],
              message:
                "Domain layer can only import from \"@/domain\". Cross-layer imports are forbidden.",
            }
          ],
        },
      ],
    }
  },
  {
    files: ["src/application/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "axios",
            "zod",
            "typeorm",
            "@prisma/*",
            "express",
            "next/*"
          ]
        }
      ]
    }
  }
];
