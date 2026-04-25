import * as Sentry from "@sentry/nextjs"

const isDevelopment = process.env.NODE_ENV === "development"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Server-side no usa replay
  debug: false,
})
