<script setup lang="ts">
import type { CartItem } from '~/types/menu'

const props = defineProps<{
  open: boolean
  customerName: string
  items: CartItem[]
  total: number
  isSplit?: boolean
  splitTotal?: number
}>()

defineEmits<{ (e: 'close'): void }>()

function getDateOrdered() {
  const now = new Date()
  return now.toLocaleDateString('en-PH', {
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
        <title>Receipt - Coffee Shop</title>
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
          .store-name { font-size: 16px; font-weight: bold; letter-spacing: 0.15em; }
          .date { font-size: 11px; color: #555; margin-top: 4px; }
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
        </style>
      </head>
      <body>
        <div class="center">
          <p class="store-name">Coffee Shop</p>
          <p class="date">${getDateOrdered()}</p>
        </div>
        <hr class="divider" />
        <p class="customer-name">${props.customerName}</p>
        ${isSplit ? `<p class="split-note">Split bill (Total: ₱${splitTotal.toFixed(2)})</p>` : ''}
        <hr class="divider" />
        ${props.items.map(item => `
          <div class="item-row">
            <span class="item-name">${item.name} × ${item.qty}</span>
            <span class="item-price">₱${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('')}
        <hr class="divider" />
        <div class="total-row">
          <span>${isSplit ? 'Your Share' : 'Total'}</span>
          <span>₱${props.total.toFixed(2)}</span>
        </div>
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
      <div class="p-6 space-y-4 font-mono text-sm" style="color: var(--text-primary)">

        <!-- Store name -->
        <div class="text-center space-y-1">
          <p class="text-base font-bold tracking-widest">Coffee Shop</p>
          <p class="text-xs" style="color: var(--text-muted)">{{ getDateOrdered() }}</p>
        </div>

        <div class="border-t border-dashed" style="border-color: var(--border-color)" />

        <!-- Customer name -->
        <div class="text-center">
          <p class="text-xl font-black tracking-widest uppercase">{{ customerName }}</p>
        </div>

        <div class="border-t border-dashed" style="border-color: var(--border-color)" />

        <!-- Split note -->
        <div v-if="isSplit" class="text-center text-xs" style="color: var(--text-muted)">
          Split bill · Order total: ₱{{ splitTotal?.toFixed(2) }}
        </div>

        <div v-if="isSplit" class="border-t border-dashed" style="border-color: var(--border-color)" />

        <!-- Items -->
        <div class="space-y-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex justify-between text-xs"
          >
            <span class="truncate mr-2">
              {{ item.name }}
              <span style="color: var(--text-muted)">× {{ item.qty }}</span>
            </span>
            <span class="shrink-0">₱{{ (item.price * item.qty).toFixed(2) }}</span>
          </div>
        </div>

        <div class="border-t border-dashed" style="border-color: var(--border-color)" />

        <!-- Total -->
        <div class="flex justify-between font-bold text-sm">
          <span>{{ isSplit ? 'Your Share' : 'Total' }}</span>
          <span>₱{{ total.toFixed(2) }}</span>
        </div>

        <div class="border-t border-dashed" style="border-color: var(--border-color)" />

        <!-- Actions -->
        <div class="flex gap-2">
          <UButton block color="primary" variant="soft" icon="i-heroicons-printer" @click="printReceipt">
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