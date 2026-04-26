/**
 * Operational tool: removes a migration from _prisma_migrations
 * so Prisma treats it as new on the next `migrate dev`.
 *
 * Use ONLY for migrations that were registered but never
 * actually applied to the schema (failed transactions,
 * rolled-back states with checksum drift).
 *
 * NEVER use for migrations that did apply changes to the
 * schema — that creates real drift.
 *
 * Usage: pnpm tsx scripts/forget-migration.ts <migration_name>
 */
import "dotenv/config"

import { Client } from "pg"

async function main(): Promise<void> {
  const migrationName = process.argv[2]
  if (!migrationName) {
    console.error("✗ Missing argument. Usage: forget-migration <migration_name>")
    process.exit(1)
  }

  const directUrl = process.env.DIRECT_URL
  if (!directUrl) {
    console.error("✗ DIRECT_URL missing")
    process.exit(1)
  }

  const client = new Client({ connectionString: directUrl })
  await client.connect()

  try {
    const before = await client.query(
      `SELECT migration_name, started_at, finished_at, rolled_back_at
         FROM _prisma_migrations
         WHERE migration_name = $1;`,
      [migrationName],
    )

    if (before.rows.length === 0) {
      console.log(`✓ No row found for "${migrationName}". Nothing to forget.`)
      return
    }

    console.log("Row(s) about to be deleted:")
    console.table(before.rows)

    const safe =
      before.rows.every((r) => r.finished_at === null) &&
      before.rows.every((r) => r.rolled_back_at !== null)

    if (!safe) {
      console.error(
        "✗ ABORT: at least one matching row is finished_at != null OR rolled_back_at == null.",
      )
      console.error(
        "  This means the migration may have actually applied changes. Forgetting it would create drift.",
      )
      console.error("  Resolve manually before retrying.")
      process.exit(1)
    }

    const result = await client.query(
      `DELETE FROM _prisma_migrations WHERE migration_name = $1;`,
      [migrationName],
    )
    console.log(`✓ Deleted ${result.rowCount} row(s) from _prisma_migrations.`)

    const after = await client.query(
      `SELECT COUNT(*)::int AS count FROM _prisma_migrations WHERE migration_name = $1;`,
      [migrationName],
    )
    console.log(`Verification: ${after.rows[0].count} row(s) remain for "${migrationName}".`)
  } finally {
    await client.end()
  }
}

void main()
