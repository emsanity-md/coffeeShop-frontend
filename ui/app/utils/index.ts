/**
 * Auto-import surface for the app's pure helpers.
 *
 * Two jobs, deliberately:
 *   1. Nuxt scans `app/utils/**` and auto-imports these names, so call sites
 *      just write `formatPeso(12)`.
 *   2. The shadcn-vue components under `app/components/ui/` were generated with
 *      `import { cn } from '@/utils'`, so this path has to keep resolving.
 *
 * The implementations live in `app/lib/`. That directory is NOT auto-scanned, so
 * each name is registered exactly once — keeping the two files apart avoids the
 * "Duplicated imports" warning a barrel sitting next to its own sources causes.
 */

export { cn } from '~/lib/cva'
export { formatPeso, formatPesoCompact, parsePeso } from '~/lib/currency'
export { formatDateTime, formatReceiptDate, formatRelative } from '~/lib/date'
export { customerInitials } from '~/lib/initials'
export { splitTotalEqually, round2 } from '~/lib/split'
export { printReceipt } from '~/lib/receipt'
export type { ReceiptData } from '~/lib/receipt'
