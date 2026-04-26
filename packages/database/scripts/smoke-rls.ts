import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"

// Two clients, two roles:
//   - adminPrisma → DIRECT_URL (postgres role, BYPASSRLS).
//     Used for setup/cleanup. Mirrors what getAdminPrisma() will do
//     in the production wrapper (T0.2.4 final).
//   - appPrisma   → DATABASE_URL (app_user, no BYPASSRLS).
//     Used for the actual RLS tests. Reads must respect policies.
//
// We construct the PrismaPg adapter with an explicit connectionString
// per client. This is the canonical Prisma 7 pattern when using the
// driver adapter — `datasourceUrl` (Prisma 6 API) does not apply
// because the adapter owns the connection lifecycle.

const CUID_RE = /^c[a-z0-9]{24}$/

function assertCuid(id: string, label: string): void {
  if (!CUID_RE.test(id)) {
    throw new Error(
      `Refusing to interpolate non-cuid value as ${label}: "${id}". ` +
        `SET LOCAL with arbitrary input is unsafe.`,
    )
  }
}

function makeAdminClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
  return new PrismaClient({ adapter })
}

function makeAppClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

// Embryo of the production runTenantTx(). Wraps a query in a
// transaction with SET LOCAL app.current_org_id. SET LOCAL is only
// valid inside a transaction; the value is released on COMMIT/ROLLBACK
// so it cannot leak into reused pooler connections.
//
// TODO: tighten the tx type when the wrapper moves to
// apps/web/src/lib/tenant.ts in T0.2.4 final.
async function runAsOrg<T>(
  client: PrismaClient,
  orgId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (tx: any) => Promise<T>,
): Promise<T> {
  assertCuid(orgId, "orgId")
  return client.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_org_id = '${orgId}'`)
    return fn(tx)
  })
}

async function main(): Promise<void> {
  const admin = makeAdminClient()
  const app = makeAppClient()

  let orgA: { id: string } | null = null
  let orgB: { id: string } | null = null
  let userA: { id: string } | null = null

  try {
    // ====== Setup with admin client (bypasses RLS) ======
    console.log("=== Setup (admin client) ===")
    orgA = await admin.organization.create({
      data: { clerkId: "org_rls_a", slug: "rls-a", name: "RLS Test A" },
    })
    orgB = await admin.organization.create({
      data: { clerkId: "org_rls_b", slug: "rls-b", name: "RLS Test B" },
    })
    userA = await admin.user.create({
      data: { clerkId: "user_rls_a", email: "[email protected]" },
    })
    await admin.membership.create({
      data: { userId: userA.id, organizationId: orgA.id, role: "OWNER" },
    })
    await admin.membership.create({
      data: { userId: userA.id, organizationId: orgB.id, role: "OWNER" },
    })
    console.log("✓ Created 2 orgs, 1 user, 2 memberships")

    // ====== Test 1: app client, no SET LOCAL → 0 rows ======
    console.log("\n=== Test 1: app client, no app.current_org_id active ===")
    const noContext = {
      orgs: await app.organization.findMany(),
      users: await app.user.findMany(),
      memberships: await app.membership.findMany(),
    }
    console.log("Results:", {
      orgs: noContext.orgs.length,
      users: noContext.users.length,
      memberships: noContext.memberships.length,
    })
    const test1Pass =
      noContext.orgs.length === 0 &&
      noContext.users.length === 0 &&
      noContext.memberships.length === 0
    console.log(test1Pass ? "✓ Test 1 PASS (RLS blocked all reads)" : "✗ Test 1 FAIL")

    // ====== Test 2: app client, SET LOCAL = orgA.id → 1 org ======
    console.log("\n=== Test 2: app client with app.current_org_id = orgA ===")
    const withOrgA = await runAsOrg(app, orgA.id, async (tx) => ({
      orgs: await tx.organization.findMany(),
    }))
    console.log("Results:", { orgs: withOrgA.orgs.length })
    const test2Pass =
      withOrgA.orgs.length === 1 && withOrgA.orgs[0].id === orgA.id
    console.log(test2Pass ? "✓ Test 2 PASS (only orgA visible)" : "✗ Test 2 FAIL")

    // ====== Test 3: delete Membership A→A, then check User visibility ======
    console.log("\n=== Test 3: User invisible if no Membership in active org ===")
    await admin.membership.deleteMany({
      where: { userId: userA.id, organizationId: orgA.id },
    })
    const userView = await runAsOrg(app, orgA.id, async (tx) => ({
      users: await tx.user.findMany(),
    }))
    console.log("Results:", { users: userView.users.length })
    const test3Pass = userView.users.length === 0
    console.log(test3Pass ? "✓ Test 3 PASS (user has no membership in orgA)" : "✗ Test 3 FAIL")

    // ====== Summary ======
    const allPass = test1Pass && test2Pass && test3Pass
    console.log(`\n=== Summary: ${allPass ? "3/3 PASS" : "FAILURE"} ===`)
    if (!allPass) process.exit(1)
  } finally {
    // ====== Cleanup with admin client ======
    console.log("\n=== Cleanup (admin client) ===")
    if (userA) {
      await admin.membership.deleteMany({ where: { userId: userA.id } }).catch(() => {})
      await admin.user.delete({ where: { id: userA.id } }).catch(() => {})
    }
    if (orgA) await admin.organization.delete({ where: { id: orgA.id } }).catch(() => {})
    if (orgB) await admin.organization.delete({ where: { id: orgB.id } }).catch(() => {})

    const counts = {
      organization: await admin.organization.count(),
      user: await admin.user.count(),
      membership: await admin.membership.count(),
    }
    console.log("Post-cleanup counts:", counts)

    await admin.$disconnect()
    await app.$disconnect()
  }
}

void main()
