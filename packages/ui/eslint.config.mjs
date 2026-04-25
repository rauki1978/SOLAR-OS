import baseConfig from "@solaros/config/eslint/base"

export default [
  ...baseConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]
