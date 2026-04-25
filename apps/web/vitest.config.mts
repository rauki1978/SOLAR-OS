import { resolve } from "node:path"

import baseConfig from "@solaros/config/vitest/base"
import { defineConfig, mergeConfig } from "vitest/config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: "@solaros/web",
      root: resolve(import.meta.dirname),
    },
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "./src"),
        "@solaros/ui": resolve(import.meta.dirname, "../../packages/ui/src"),
      },
    },
  }),
)
