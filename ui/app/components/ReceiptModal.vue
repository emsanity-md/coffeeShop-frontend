<script setup lang="ts">
import { computed } from 'vue'
import type { CartItem } from '~/types/menu'
import { STATUS_META } from '~/composables/useOrders'
import type { OrderStatus } from '~/composables/useOrders'

const props = defineProps<{
  open: boolean
  customerName: string
  items: CartItem[]
  total: number
  isSplit?: boolean
  splitTotal?: number
  date?: string
  orderId?: string
  status?: OrderStatus
}>()

defineEmits<{ (e: 'close'): void }>()

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

const orderIdShort = computed(() => props.orderId ? props.orderId.slice(0, 8).toUpperCase() : null)
const statusMeta = computed(() => (props.status ? STATUS_META[props.status] : null))

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getDateOrdered() {
  const d = props.date ? new Date(props.date) : new Date()
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function printReceipt() {
  const printWindow = window.open('', '_blank', 'width=400,height=600')
  if (!printWindow) return

  const isSplit = props.isSplit
  const splitTotal = props.splitTotal ?? props.total

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Brewed Coffee House</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: monospace;
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
          <p class="date">${escapeHtml(getDateOrdered())}</p>
          ${orderIdShort.value ? `<p class="order-id">#${orderIdShort.value}</p>` : ''}
          ${statusMeta.value ? `<p class="status">Status: ${escapeHtml(statusMeta.value.label)}</p>` : ''}
        </div>
        <hr class="divider" />
        <p class="customer-name">${escapeHtml(props.customerName)}</p>
        ${isSplit ? `<p class="split-note">Split bill (Total: ₱${splitTotal.toFixed(2)})</p>` : ''}
        <hr class="divider" />
        ${props.items.map(item => `
          <div class="item-row">
            <span class="item-name">${escapeHtml(item.name)} × ${item.qty}</span>
            <span class="item-price">₱${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        <hr class="divider" />
        <div class="total-row">
          <span>${isSplit ? 'Your Share' : 'Total'}</span>
          <span>₱${props.total.toFixed(2)}</span>
        </div>
        <p class="thanks">Thank you · Come again</p>
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}
</script>

<template>
  <UModal :open="open" @close="$emit('close')">
    <template #content>
      <div class="p-6 sm:p-7 space-y-5 font-mono text-sm" style="color: var(--text-primary)">

        <!-- Store name -->
        <div class="text-center space-y-1.5">
          <div class="mx-auto w-10 h-10 rounded-full flex items-center justify-center text-lg" style="background: var(--bg-soft-strong)">
            ☕
          </div>
          <p class="text-base font-bold tracking-[0.2em]">BREWED</p>
          <p class="text-[11px] uppercase tracking-widest" style="color: var(--text-faint)">Coffee House</p>
          <p class="text-xs tnum" style="color: var(--text-muted)">{{ getDateOrdered() }}</p>
          <p v-if="orderIdShort" class="text-[11px] font-mono tnum" style="color: var(--text-faint)">#{{ orderIdShort }}</p>
          <UBadge v-if="statusMeta" :color="statusMeta.color" variant="soft" size="xs" :icon="statusMeta.icon" class="mt-1">
            {{ statusMeta.label }}
          </UBadge>
        </div>

        <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

        <!-- Customer name -->
        <div class="flex items-center justify-center gap-3 text-center">
          <UAvatar :text="customerInitials(customerName)" size="lg" color="neutral" variant="soft" />
          <p class="text-xl font-black tracking-widest uppercase truncate">{{ customerName }}</p>
        </div>

        <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

        <!-- Split note -->
        <div v-if="isSplit" class="mx-auto w-fit flex items-center gap-1.5 text-xs px-3 py-1 rounded-full warm-soft-panel" style="color: var(--text-muted)">
          <UIcon name="i-heroicons-users" class="w-3.5 h-3.5" />
          Split bill · Order total: <span class="tnum font-semibold">₱{{ splitTotal?.toFixed(2) }}</span>
        </div>

        <USeparator v-if="isSplit" type="dashed" size="xs" color="neutral" class="opacity-60" />

        <!-- Items -->
        <div class="space-y-2.5">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex justify-between items-baseline gap-3 text-xs"
          >
            <span class="truncate mr-2 min-w-0">
              {{ item.name }}
              <span class="tnum" style="color: var(--text-muted)">× {{ item.qty }}</span>
            </span>
            <span class="shrink-0 tnum font-medium">₱{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>

        <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

        <!-- Total -->
        <div class="warm-soft-panel rounded-xl px-4 py-3 flex justify-between items-center font-bold">
          <span class="text-sm">{{ isSplit ? 'Your Share' : 'Total' }}</span>
          <span class="text-lg tnum">₱{{ total.toFixed(2) }}</span>
        </div>

        <p class="text-center text-[11px] tracking-wide" style="color: var(--text-faint)">Thank you · Come again ☕</p>

        <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

        <!-- Actions -->
        <div class="flex gap-2">
          <UButton block color="primary" icon="i-heroicons-printer" @click="printReceipt">
            Print
          </UButton>
          <UButton block color="neutral" variant="soft" @click="$emit('close')">
            Close
          </UButton>
        </div>

      </div>
    </template>
  </UModal>
</template>