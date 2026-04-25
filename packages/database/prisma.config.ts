import "dotenv/config"

import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    url: process.env.DIRECT_URL,
  },
})
