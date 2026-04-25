import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"

import { Button } from "./button"

describe("Button", () => {
  it("renderiza el texto del hijo", () => {
    render(<Button>Crear proyecto</Button>)
    expect(screen.getByRole("button", { name: /crear proyecto/i })).toBeInTheDocument()
  })

  it("aplica la variante destructive", () => {
    render(<Button variant="destructive">Eliminar</Button>)
    const button = screen.getByRole("button", { name: /eliminar/i })
    expect(button).toHaveAttribute("data-variant", "destructive")
  })

  it("respeta la prop disabled", () => {
    render(<Button disabled>Acción</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })
})
