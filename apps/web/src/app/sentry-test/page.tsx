"use client"

import { Button } from "@solaros/ui/components/button"

export default function SentryTestPage() {
  return (
    <main className="mx-auto max-w-md p-8 space-y-4">
      <h1 className="text-xl font-medium">Sentry test page</h1>
      <p className="text-sm text-muted-foreground">
        Esta página existe solo para verificar que Sentry captura errores. Eliminar antes de
        producción.
      </p>
      <Button
        variant="destructive"
        onClick={() => {
          throw new Error("Sentry test error - cliente")
        }}
      >
        Disparar error cliente
      </Button>
      <Button
        variant="destructive"
        onClick={async () => {
          await fetch("/api/sentry-test")
        }}
      >
        Disparar error servidor
      </Button>
    </main>
  )
}
