/**
 * Currency formatting for the Philippine peso.
 *
 * `Intl` is asked for `en-PH` first, but not every runtime ships full ICU data
 * for that locale — when `formatToParts` is unavailable (or the locale falls
 * back) we hand-format so a price is never rendered as bare digits or "NaN".
 */
const LOCALE = 'en-PH'
const CURRENCY = 'PHP'

let formatter: Intl.NumberFormat | null = null
try {
  const candidate = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
  })
  // Guard against a runtime that ignores `style` and returns "1,234.00".
  if (candidate.format(1).includes('₱')) formatter = candidate
} catch {
  formatter = null
}

/** Format a number as pesos, e.g. `₱1,234.50`. */
export function formatPeso(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  if (formatter) return formatter.format(safe)
  return `₱${safe.toFixed(2)}`
}

/** Compact form for dense stat tiles, e.g. `₱12.4K`. */
export function formatPesoCompact(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  if (Math.abs(safe) < 10_000) return formatPeso(safe)
  return `₱${(safe / 1000).toFixed(1)}K`
}

/** Parse a user-entered peso string back to a number. Returns null if invalid. */
export function parsePeso(input: string): number | null {
  const cleaned = input.replace(/[₱,\s]/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}
