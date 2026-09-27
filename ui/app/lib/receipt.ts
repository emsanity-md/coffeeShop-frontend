import type { CartItem } from '~/types/menu'
import type { OrderStatus } from '~/types/order'
import { STATUS_META } from '~/constants/order-status'
import { formatReceiptDate } from '~/lib/date'

export interface ReceiptData {
  customerName: string
  items: CartItem[]
  /** This customer's share (or the whole total when not split). */
  total: number
  isSplit: boolean
  /** Whole-order total, shown only when `isSplit`. */
  splitTotal?: number
  date?: string
  orderId?: string
  status?: OrderStatus
}

/** Escape untrusted text before interpolating it into the print document. */
function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function peso(value: number): string {
  return `₱${value.toFixed(2)}`
}

function buildDocument(data: ReceiptData): string {
  const orderIdShort = data.orderId ? data.orderId.slice(0, 8).toUpperCase() : null
  const statusMeta = data.status ? STATUS_META[data.status] : null
  const splitTotal = data.splitTotal ?? data.total

  return `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt - Brewed Coffee House</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 13px;
        padding: 24px 20px;
        color: #000;
        width: 300px;
        margin: 0 auto;
      }
      .center { text-align: center; }
      .store-name { font-size: 16px; font-weight: bold; letter-spacing: 0.2em; }
      .store-sub { font-size: 10px; letter-spacing: 0.25em; color: #666; margin-top: 2px; }
      .date { font-size: 11px; color: #555; margin-top: 4px; }
      .order-id { font-size: 10px; color: #777; margin-top: 2px; }
      .divider { border: none; border-top: 1px dashed #999; margin: 12px 0; }
      .customer-name {
        font-size: 20px;
        font-weight: 900;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-align: center;
      }
      .item-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
      .item-name { flex: 1; margin-right: 8px; }
      .item-price { white-space: nowrap; }
      .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
      .split-note { font-size: 11px; color: #666; text-align: center; margin: 8px 0; }
      .status { font-size: 11px; color: #000; text-align: center; margin-top: 6px; font-weight: bold; letter-spacing: 0.12em; text-transform: uppercase; }
      .thanks { font-size: 11px; color: #666; text-align: center; margin-top: 12px; }
    </style>
  </head>
  <body>
    <div class="center">
      <p class="store-name">BREWED</p>
      <p class="store-sub">COFFEE HOUSE</p>
      <p class="date">${escapeHtml(formatReceiptDate(data.date ?? ''))}</p>
      ${orderIdShort ? `<p class="order-id">#${escapeHtml(orderIdShort)}</p>` : ''}
      ${statusMeta ? `<p class="status">Status: ${escapeHtml(statusMeta.label)}</p>` : ''}
    </div>
    <hr class="divider" />
    <p class="customer-name">${escapeHtml(data.customerName)}</p>
    ${data.isSplit ? `<p class="split-note">Split bill (Total: ${escapeHtml(peso(splitTotal))})</p>` : ''}
    <hr class="divider" />
    ${data.items
      .map(
        item => `
      <div class="item-row">
        <span class="item-name">${escapeHtml(item.name)} × ${item.qty}</span>
        <span class="item-price">${escapeHtml(peso(item.price * item.qty))}</span>
      </div>`,
      )
      .join('')}
    <hr class="divider" />
    <div class="total-row">
      <span>${data.isSplit ? 'Your Share' : 'Total'}</span>
      <span>${escapeHtml(peso(data.total))}</span>
    </div>
    <p class="thanks">Thank you · Come again</p>
  </body>
</html>`
}

/**
 * Open a print window containing the receipt and trigger the print dialog.
 * No-ops when the popup is blocked rather than throwing at the call site.
 */
export function printReceipt(data: ReceiptData): void {
  if (typeof window === 'undefined') return
  const printWindow = window.open('', '_blank', 'width=400,height=600')
  if (!printWindow) return

  printWindow.document.write(buildDocument(data))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
