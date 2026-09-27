/**
 * Split a peso total across N people without losing or inventing a cent.
 *
 * Works in integer cents, hands out the base share to everyone, then gives the
 * leftover cent to the first `remainder` people. 100.00 / 3 -> [33.34, 33.33,
 * 33.33] and the parts always sum back to the input exactly.
 */
export function splitTotalEqually(total: number, count: number): number[] {
  if (count <= 1) return [round2(total)]
  const totalCents = Math.round(total * 100)
  const base = Math.floor(totalCents / count)
  const remainder = totalCents - base * count
  return Array.from({ length: count }, (_, i) => (base + (i < remainder ? 1 : 0)) / 100)
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}
