import "dotenv/config"

import { Client } from "pg"

async function verifyRls(): Promise<void> {
  const client = new Client({ connectionString: process.env.DIRECT_URL })
  await client.connect()

  try {
    console.log("→ pg_class (RLS flags):")
    const tables = await client.query(
      `SELECT c.relname AS tablename,
              c.relrowsecurity AS rowsecurity,
              c.relforcerowsecurity AS forcerowsecurity
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'
           AND c.relname IN ('Organization', 'User', 'Membership')
         ORDER BY c.relname;`,
    )
    console.table(tables.rows)

    console.log("→ pg_policies:")
    const policies = await client.query(
      `SELECT schemaname, tablename, policyname, cmd
         FROM pg_policies
         WHERE tablename IN ('Organization', 'User', 'Membership')
         ORDER BY tablename, policyname;`,
    )
    console.table(policies.rows)

    console.log("→ current_user / session_user:")
    const role = await client.query(`SELECT current_user, session_user;`)
    console.table(role.rows)
  } finally {
    await client.end()
  }
}

void verifyRls()
