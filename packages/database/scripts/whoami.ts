import "dotenv/config"

import { Client } from "pg"

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("✗ DATABASE_URL missing")
    process.exit(1)
  }
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT current_user, session_user,
              (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS bypassrls;`,
    )
    console.log("Connected as:")
    console.table(rows)
  } finally {
    await client.end()
  }
}

void main()
