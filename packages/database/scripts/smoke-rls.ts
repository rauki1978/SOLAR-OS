import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"

const ORG_A_CLERK = "org_rls_a"
const ORG_B_CLERK = "org_rls_b"
const USER_A_CLERK = "user_rls_a"
const USER_A_EMAIL = "[email protected]"

interface Created {
  orgA: { id: string }
  orgB: { id: string }
  userA: { id: string }
  membershipAA: { id: string }
  membershipAB: { id: string }
}

async function smokeRls(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  let created: Created | null = null

  try {
    console.log("=== SETUP ===")
    const orgA = await prisma.organization.create({
      data: { clerkId: ORG_A_CLERK, slug: "rls-a", name: "RLS Test A" },
    })
    console.log(`  ✓ Org A id=${orgA.id}`)

    const orgB = await prisma.organization.create({
      data: { clerkId: ORG_B_CLERK, slug: "rls-b", name: "RLS Test B" },
    })
    console.log(`  ✓ Org B id=${orgB.id}`)

    const userA = await prisma.user.create({
      data: { clerkId: USER_A_CLERK, email: USER_A_EMAIL },
    })
    console.log(`  ✓ User A id=${userA.id}`)

    const membershipAA = await prisma.membership.create({
      data: { userId: userA.id, organizationId: orgA.id, role: "OWNER" },
    })
    console.log(`  ✓ Membership User_A→Org_A id=${membershipAA.id}`)

    const membershipAB = await prisma.membership.create({
      data: { userId: userA.id, organizationId: orgB.id, role: "OWNER" },
    })
    console.log(`  ✓ Membership User_A→Org_B id=${membershipAB.id}`)

    created = { orgA, orgB, userA, membershipAA, membershipAB }

    console.log("\n=== TEST 1 — sin org activo, todo bloqueado ===")
    const t1Orgs = await prisma.organization.findMany()
    const t1Users = await prisma.user.findMany()
    const t1Mems = await prisma.membership.findMany()
    console.log(
      `  Organization.findMany → ${t1Orgs.length} rows`,
      t1Orgs.map((o) => o.id),
    )
    console.log(
      `  User.findMany         → ${t1Users.length} rows`,
      t1Users.map((u) => u.id),
    )
    console.log(
      `  Membership.findMany   → ${t1Mems.length} rows`,
      t1Mems.map((m) => m.id),
    )
    if (t1Orgs.length === 0 && t1Users.length === 0 && t1Mems.length === 0) {
      console.log("  ✓ Test 1 PASS (RLS active)")
    } else {
      console.log("  ✗ Test 1 FAIL (rows leaked — role likely BYPASSRLS)")
    }

    console.log("\n=== TEST 2 — org A activo, solo se ve Org A ===")
    const t2 = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_org_id = '${orgA.id}'`)
      return tx.organization.findMany()
    })
    console.log(
      `  Organization.findMany under SET LOCAL orgA → ${t2.length} rows`,
      t2.map((o) => ({ id: o.id, slug: o.slug })),
    )
    if (t2.length === 1 && t2[0]?.id === orgA.id) {
      console.log("  ✓ Test 2 PASS")
    } else {
      console.log("  ✗ Test 2 FAIL")
    }

    console.log("\n=== TEST 3 — User no visible si no hay Membership en org activo ===")
    await prisma.membership.delete({ where: { id: membershipAA.id } })
    console.log("  · Deleted Membership User_A→Org_A (user retains User_A→Org_B)")
    created.membershipAA = { id: "<deleted>" }

    const t3 = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_org_id = '${orgA.id}'`)
      return tx.user.findMany()
    })
    console.log(
      `  User.findMany under SET LOCAL orgA → ${t3.length} rows`,
      t3.map((u) => u.id),
    )
    if (t3.length === 0) {
      console.log("  ✓ Test 3 PASS")
    } else {
      console.log("  ✗ Test 3 FAIL")
    }
  } catch (error) {
    console.error("✗ Smoke RLS error:", error)
    throw error
  } finally {
    console.log("\n=== CLEANUP ===")
    if (created) {
      try {
        await prisma.membership.deleteMany({
          where: {
            OR: [
              { id: created.membershipAA.id },
              { id: created.membershipAB.id },
            ],
          },
        })
        await prisma.user.deleteMany({ where: { id: created.userA.id } })
        await prisma.organization.deleteMany({
          where: { OR: [{ id: created.orgA.id }, { id: created.orgB.id }] },
        })
        const counts = {
          organization: await prisma.organization.count(),
          user: await prisma.user.count(),
          membership: await prisma.membership.count(),
        }
        console.log("  Post-cleanup counts:", counts)
        if (counts.organization || counts.user || counts.membership) {
          console.log("  ! Counts not zero — residual rows present")
        }
      } catch (cleanupErr) {
        console.error("  ✗ Cleanup error:", cleanupErr)
      }
    }
    await prisma.$disconnect()
  }
}

void smokeRls()
