import { test, expect } from "@playwright/test"

test.describe("Showcase page", () => {
  test("renderiza el título y los componentes base", async ({ page }) => {
    await page.goto("/showcase")
    await expect(
      page.getByRole("heading", { name: /sistema de diseño solaros/i, level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /acción primaria/i })).toBeVisible()
    await expect(page.getByRole("heading", { name: /^card de ejemplo$/i })).toBeVisible()
  })

  test("muestra el card de Bodegas Pérez con su importe", async ({ page }) => {
    await page.goto("/showcase")
    await expect(page.getByText("Bodegas Pérez SL")).toBeVisible()
    await expect(page.getByText("PRY-0141 · Huércal-Overa · 45.0 kWp")).toBeVisible()
  })
})
