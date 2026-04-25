import { resolve } from "node:path"

import baseConfig from "@solaros/config/vitest/base"
import { defineConfig, mergeConfig } from "vitest/config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: "@solaros/ui",
      root: resolve(import.meta.dirname),
    },
    resolve: {
      alias: {
        "@solaros/ui": resolve(import.meta.dirname, "./src"),
      },
    },
  }),
)
