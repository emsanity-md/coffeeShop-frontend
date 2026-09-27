<script setup lang="ts">
/**
 * Sticky cart footer: the running total, the customer split (when there is one)
 * and the place-order action. Kept out of the scroll area so the total and the
 * primary action are always reachable.
 */
import { Users } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import type { CartItem, Customer } from '~/types/menu'
import type { CustomerReceipt } from '~/types/order'
import { formatPeso } from '~/utils'

defineProps<{
  items: CartItem[]
  total: number
  customers: Customer[]
  receipts: CustomerReceipt[]
  canPlaceOrder: boolean
}>()

const emit = defineEmits<{
  (e: 'placeOrder'): void
  (e: 'viewReceipt', receipt: CustomerReceipt): void
}>()
</script>

<template>
  <div class="shrink-0 space-y-2.5 border-t border-border bg-card p-3.5">
    <!-- Per-customer shares, only meaningful once customers exist. -->
    <div v-if="receipts.length" class="space-y-1">
      <div
        v-for="receipt in receipts"
        :key="receipt.id"
        class="flex items-baseline justify-between gap-2 text-meta"
      >
        <button
          type="button"
          class="flex min-w-0 items-center gap-1.5 truncate text-left text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          @click="emit('viewReceipt', receipt)"
        >
          <Users class="size-3 shrink-0" />
          <span class="truncate">{{ receipt.name }}</span>
        </button>
        <span class="tnum shrink-0 font-medium text-foreground">
          {{ formatPeso(receipt.total) }}
        </span>
      </div>
    </div>

    <div
      v-if="receipts.length"
      class="flex items-baseline justify-between border-t border-border pt-2.5"
    >
      <span class="text-label text-muted-foreground">Order total</span>
      <span class="tnum font-mono text-section font-semibold">
        {{ formatPeso(total) }}
      </span>
    </div>

    <Button
      class="w-full"
      size="lg"
      :disabled="!canPlaceOrder"
      @click="emit('placeOrder')"
    >
      {{ customers.length ? 'Place split order' : 'Place order' }}
    </Button>

    <p
      v-if="!customers.length && items.length"
      class="text-center text-meta text-muted-foreground"
    >
      Add at least one customer to check out
    </p>
  </div>
</template>
