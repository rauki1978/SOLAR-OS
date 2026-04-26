import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"

const SMOKE_ORG_CLERK_ID = "org_smoke_test"
const SMOKE_USER_CLERK_ID = "user_smoke_test"
const SMOKE_ORG_SLUG = "smoke-test"
const SMOKE_USER_EMAIL = "[email protected]"

async function smokeTenancy(): Promise<void> {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log("→ Creating Organization…")
    const org = await prisma.organization.create({
      data: {
        clerkId: SMOKE_ORG_CLERK_ID,
        slug: SMOKE_ORG_SLUG,
        name: "Smoke Test Org",
      },
    })
    console.log(`  ✓ Organization id=${org.id} plan=${org.plan}`)

    console.log("→ Creating User…")
    const user = await prisma.user.create({
      data: {
        clerkId: SMOKE_USER_CLERK_ID,
        email: SMOKE_USER_EMAIL,
      },
    })
    console.log(`  ✓ User id=${user.id} email=${user.email}`)

    console.log("→ Creating Membership (role=OWNER)…")
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role: "OWNER",
      },
    })
    console.log(`  ✓ Membership id=${membership.id} role=${membership.role}`)

    console.log("→ findUnique on three records…")
    const [foundOrg, foundUser, foundMembership] = await Promise.all([
      prisma.organization.findUnique({ where: { id: org.id } }),
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.membership.findUnique({ where: { id: membership.id } }),
    ])
    if (!foundOrg || !foundUser || !foundMembership) {
      throw new Error(
        `findUnique miss: org=${Boolean(foundOrg)} user=${Boolean(foundUser)} membership=${Boolean(foundMembership)}`,
      )
    }
    console.log(`  ✓ Org found id=${foundOrg.id}`)
    console.log(`  ✓ User found id=${foundUser.id}`)
    console.log(`  ✓ Membership found id=${foundMembership.id}`)

    const preCounts = {
      organization: await prisma.organization.count(),
      user: await prisma.user.count(),
      membership: await prisma.membership.count(),
    }
    console.log("  Pre-cleanup counts:", preCounts)

    console.log("→ Cleanup (Membership → User → Organization)…")
    await prisma.membership.delete({ where: { id: membership.id } })
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.organization.delete({ where: { id: org.id } })

    const postCounts = {
      organization: await prisma.organization.count(),
      user: await prisma.user.count(),
      membership: await prisma.membership.count(),
    }
    console.log("  Post-cleanup counts:", postCounts)

    if (
      postCounts.organization !== 0 ||
      postCounts.user !== 0 ||
      postCounts.membership !== 0
    ) {
      throw new Error(`Counts not zero after cleanup: ${JSON.stringify(postCounts)}`)
    }

    console.log("✓ Smoke test passed")
  } catch (error) {
    console.error("✗ Smoke test failed:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

void smokeTenancy()
