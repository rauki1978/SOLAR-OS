import "dotenv/config"

import { Client } from "pg"

async function main(): Promise<void> {
  const directUrl = process.env.DIRECT_URL
  if (!directUrl) {
    console.error("✗ DIRECT_URL missing")
    process.exit(1)
  }

  const client = new Client({ connectionString: directUrl })
  await client.connect()
  try {
    const { rows } = await client.query(`
      SELECT rolname, rolcanlogin, rolbypassrls, rolsuper, rolcreaterole, rolcreatedb
        FROM pg_roles
        WHERE rolname IN ('postgres', 'app_user')
        ORDER BY rolname;
    `)
    console.log("Current role state:")
    console.table(rows)

    // Bonus: existing grants on public schema for app_user
    const { rows: grants } = await client.query(`
      SELECT grantee, table_schema, privilege_type, table_name
        FROM information_schema.role_table_grants
        WHERE grantee = 'app_user' AND table_schema = 'public'
        ORDER BY table_name, privilege_type;
    `)
    console.log(`\napp_user grants on public schema (count: ${grants.length}):`)
    if (grants.length > 0) console.table(grants.slice(0, 20))
  } finally {
    await client.end()
  }
}

void main()
