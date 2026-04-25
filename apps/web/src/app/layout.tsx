import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SolarOS",
  description: "Operating system del instalador renovable español",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
