import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "SolarOS",
  description: "Operating system del instalador renovable español",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
