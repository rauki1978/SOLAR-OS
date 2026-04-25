import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"

async function checkConnection() {
  console.log("Checking Prisma connection to Supabase...")

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version() as version`

    console.log("✓ Connection successful")
    console.log("  PostgreSQL version:", result[0]?.version ?? "unknown")

    const dbResult = await prisma.$queryRaw<
      Array<{ current_database: string }>
    >`SELECT current_database()`

    console.log("  Connected to database:", dbResult[0]?.current_database ?? "unknown")
  } catch (error) {
    console.error("✗ Connection failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkConnection()
