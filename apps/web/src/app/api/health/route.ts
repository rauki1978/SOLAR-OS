import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "solaros-web",
    version: process.env.npm_package_version ?? "0.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    checks: {
      app: "ok",
      // Otros checks (db, storage, queue) se irán
      // añadiendo en sus tareas:
      // - db: M0.2 (T0.2.x)
      // - storage R2: posiblemente M0.3 o M0.5
      // - queue Inngest: F4
    },
  })
}
