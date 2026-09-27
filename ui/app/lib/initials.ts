/**
 * Two-letter initials for a person's name, for avatar fallbacks.
 *
 * "Juan dela Cruz" -> "JC", "mika" -> "MI", "" -> "?"
 * Exported as a single implementation — it was previously duplicated in
 * ReceiptModal.vue and OrderCard.vue under two different names.
 */
export function customerInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return (parts[0]!.slice(0, 2) ?? '?').toUpperCase()
  return ((parts[0]![0] ?? '') + (parts[parts.length - 1]![0] ?? '')).toUpperCase()
}
