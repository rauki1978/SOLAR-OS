import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
}

export default withSentryConfig(nextConfig, {
  // Configuración de build de Sentry
  org: "arquitectos-tecnicos-del-levan",
  project: "solaros-web",

  // Subir source maps en builds — pero por ahora SIN
  // SENTRY_AUTH_TOKEN configurado, el upload se omite
  // silenciosamente. Lo activamos en M0.5 con CI/CD.
  silent: !process.env.CI,

  // Túnel para evitar adblockers que bloquean
  // *.ingest.sentry.io
  tunnelRoute: "/monitoring",

  disableLogger: true,
})
