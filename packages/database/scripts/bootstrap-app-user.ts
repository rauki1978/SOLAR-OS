import "dotenv/config"

import { Client } from "pg"

async function bootstrapAppUser(): Promise<void> {
  const password = process.env.APP_USER_PASSWORD
  if (!password || password.trim() === "") {
    console.error(
      "✗ APP_USER_PASSWORD is missing or empty. Set it in packages/database/.env before running this script.",
    )
    process.exit(1)
  }

  const directUrl = process.env.DIRECT_URL
  if (!directUrl) {
    console.error(
      "✗ DIRECT_URL is missing. Bootstrap requires the postgres-role connection string to ALTER ROLE.",
    )
    process.exit(1)
  }

  const client = new Client({ connectionString: directUrl })
  await client.connect()

  try {
    // PASSWORD in ALTER ROLE is a grammatical literal, not a value
    // position — bind parameters ($1) are not supported here.
    // We use escapeLiteral for safe quoting/escaping. Source:
    // https://www.postgresql.org/docs/current/sql-alterrole.html
    const escapedPassword = client.escapeLiteral(password)
    await client.query(`ALTER ROLE app_user PASSWORD ${escapedPassword} LOGIN;`)
    console.log("✓ Role app_user activated (password set, LOGIN granted)")
  } catch (error) {
    if (error instanceof Error && (error as { code?: string }).code === "42704") {
      console.error(
        "✗ Role app_user does not exist yet. Run `pnpm db:migrate` first.",
      )
      process.exit(1)
    }
    throw error
  } finally {
    await client.end()
  }
}

void bootstrapAppUser()
