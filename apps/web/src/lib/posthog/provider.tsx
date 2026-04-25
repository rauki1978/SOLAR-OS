"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    if (!key) {
      // En desarrollo sin clave, simplemente no
      // inicializamos. En producción debe estar
      // siempre configurada.
      if (process.env.NODE_ENV === "production") {
        console.warn("PostHog key missing in production")
      }
      return
    }

    posthog.init(key, {
      api_host: host ?? "https://eu.posthog.com",
      capture_pageview: "history_change",
      capture_pageleave: true,
      person_profiles: "identified_only",
      // Respeta DNT (Do Not Track) del navegador
      respect_dnt: true,
      // Solo en producción enviamos eventos reales.
      // En dev grabamos pero no enviamos para no
      // ensuciar la cuenta.
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") {
          ph.opt_out_capturing()
        }
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
