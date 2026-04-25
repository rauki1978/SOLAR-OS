import * as Sentry from "@sentry/nextjs"

const isDevelopment = process.env.NODE_ENV === "development"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Trazas de performance
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Session Replay solo en development por decisión
  // explícita en T0.1.5 (privacy/GDPR pendiente para prod)
  replaysSessionSampleRate: isDevelopment ? 0.1 : 0,
  replaysOnErrorSampleRate: isDevelopment ? 1.0 : 0,

  integrations: isDevelopment
    ? [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ]
    : [],

  // Ignora errores conocidos del navegador que no son
  // del producto
  ignoreErrors: ["ResizeObserver loop limit exceeded", "Non-Error promise rejection captured"],

  debug: false,
})
