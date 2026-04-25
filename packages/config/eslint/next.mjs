import baseConfig from "./base.mjs"
import nextPlugin from "eslint-config-next"

export default [
  ...baseConfig,
  ...nextPlugin,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]
