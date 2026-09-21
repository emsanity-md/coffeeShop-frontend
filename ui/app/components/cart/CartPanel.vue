<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CartItem, Customer } from '~/types/menu'
import { useOrders } from '~/composables/useOrders'
import type { CustomerReceipt, OrderStatus } from '~/composables/useOrders'

const props = defineProps<{
  cartItems: CartItem[]
  cartCount: number
  total: number
  customers: Customer[]
}>()

const emit = defineEmits<{
  (e: 'changeQty', id: number, delta: number): void
  (e: 'remove', id: number): void
  (e: 'clearCart'): void
  (e: 'close-drawer'): void
}>()

const showReceipt = ref(false)
const selectedCustomerReceipt = ref<CustomerReceipt | null>(null)
const selectedReceiptOrderTotal = ref(0)
const selectedReceiptIsSplit = ref(false)
const selectedReceiptDate = ref<string | undefined>(undefined)
const selectedReceiptOrderId = ref<string | undefined>(undefined)
const selectedReceiptStatus = ref<OrderStatus | undefined>(undefined)
const { addOrder } = useOrders()

function splitTotalEqually(total: number, count: number): number[] {
  if (count <= 1) return [Math.round(total * 100) / 100]
  const totalCents = Math.round(total * 100)
  const base = Math.floor(totalCents / count)
  const remainder = totalCents - base * count
  return Array.from({ length: count }, (_, i) => (base + (i < remainder ? 1 : 0)) / 100)
}

const customerReceipts = computed((): CustomerReceipt[] => {
  if (!props.customers.length) return []
  const shares = splitTotalEqually(props.total, props.customers.length)

  return props.customers.map((c, index) => ({
    id: c.id,
    name: c.name,
    items: props.cartItems.map(i => ({ ...i })),
    total: shares[index] ?? 0,
  }))
})

function handlePlaceOrder() {
  if (!props.cartItems.length || !props.customers.length) return
  const receipts = customerReceipts.value
  if (!receipts.length) return
  const isSplit = props.customers.length > 1
  const order = addOrder(receipts, props.total, isSplit)
  emit('clearCart')
  const firstReceipt = receipts[0]
  if (firstReceipt) {
    selectedCustomerReceipt.value = firstReceipt
    selectedReceiptOrderTotal.value = order.total
    selectedReceiptIsSplit.value = order.splitEqually
    selectedReceiptDate.value = order.date
    selectedReceiptOrderId.value = order.id
    selectedReceiptStatus.value = order.status
    showReceipt.value = true
  }
}

function viewCustomerReceipt(receipt: CustomerReceipt) {
  selectedCustomerReceipt.value = receipt
  selectedReceiptOrderTotal.value = props.total
  selectedReceiptIsSplit.value = props.customers.length > 1
  selectedReceiptDate.value = new Date().toISOString()
  selectedReceiptOrderId.value = undefined
  selectedReceiptStatus.value = undefined
  showReceipt.value = true
}
</script>

<template>
  <aside class="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col border-l lg:border-l overflow-hidden"
    style="background: var(--bg-cart); border-color: var(--border-color)">

    <div class="p-3 sm:p-4 border-b flex items-center gap-2 shrink-0"
      style="border-color: var(--border-color)">
      <span class="font-medium text-sm flex-1 min-w-0" style="color: var(--text-primary)">Your order</span>
      <UBadge v-if="cartCount > 0" :key="cartCount" color="primary" size="sm" class="anim-pop tnum shrink-0">{{ cartCount }}</UBadge>
      <UButton
        v-if="$attrs['data-drawer'] !== undefined"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-x-mark"
        size="xs"
        aria-label="Close cart"
        class="lg:hidden shrink-0 -mr-1"
        @click="$emit('close-drawer')"
      />
    </div>

    <div class="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-3">
      <div v-if="!cartItems.length" class="anim-fade-up text-center py-8 sm:py-10 text-xs px-4"
        style="color: var(--text-faint)">
        Your cart is empty
      </div>

      <TransitionGroup name="cart-item" tag="div" class="relative grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
        <CartItem
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          @change-qty="(id, delta) => $emit('changeQty', id, delta)"
          @remove="$emit('remove', $event)"
        />
      </TransitionGroup>

      <div v-if="customers.length" class="mt-4 space-y-2 border-t pt-3" style="border-color: var(--border-color)">
        <div v-for="receipt in customerReceipts" :key="receipt.id" class="flex justify-between text-xs" style="color: var(--text-primary)">
          <span class="font-medium">{{ receipt.name }}</span>
          <span>₱{{ receipt.total.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-xs font-medium pt-1 border-t" style="border-color: var(--border-color); color: var(--text-primary)">
          <span>Total</span>
          <span>₱{{ total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <CartFooter
      v-if="cartItems.length"
      :items="cartItems"
      :total="total"
      @place-order="handlePlaceOrder"
    />

    <ReceiptModal
      v-if="selectedCustomerReceipt"
      :open="showReceipt"
      :customer-name="selectedCustomerReceipt.name"
      :items="selectedCustomerReceipt.items"
      :total="selectedCustomerReceipt.total"
      :is-split="selectedReceiptIsSplit"
      :split-total="selectedReceiptOrderTotal"
      :date="selectedReceiptDate"
      :order-id="selectedReceiptOrderId"
      :status="selectedReceiptStatus"
      @close="showReceipt = false"
    />

  </aside>
</template>