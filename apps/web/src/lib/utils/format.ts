export function formatKwp(value: number): string {
  return `${value.toFixed(1)} kWp`
}

export function formatEuros(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatKwh(value: number): string {
  return `${new Intl.NumberFormat("es-ES").format(Math.round(value))} kWh`
}
