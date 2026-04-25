import baseConfig from "@solaros/config/eslint/base"

export default [
  ...baseConfig,
  {
    ignores: ["prisma/migrations/**", "src/generated/**"],
  },
]
