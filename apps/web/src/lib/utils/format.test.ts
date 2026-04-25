import { describe, it, expect } from "vitest"

import { formatEuros, formatKwh, formatKwp } from "./format"

describe("formatKwp", () => {
  it("formatea con un decimal y unidad", () => {
    expect(formatKwp(6.5)).toBe("6.5 kWp")
  })

  it("añade decimal en enteros", () => {
    expect(formatKwp(45)).toBe("45.0 kWp")
  })
})

describe("formatEuros", () => {
  it("formatea importes en euros sin decimales", () => {
    const result = formatEuros(52300)
    expect(result).toContain("52")
    expect(result).toContain("300")
    expect(result).toContain("€")
  })
})

describe("formatKwh", () => {
  it("formatea kwh con separador de miles", () => {
    const result = formatKwh(71800)
    expect(result).toContain("71")
    expect(result).toContain("800")
    expect(result).toContain("kWh")
  })
})
