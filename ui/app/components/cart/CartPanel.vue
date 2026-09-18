<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CartItem, Customer } from '~/types/menu'
import { useOrders } from '~/composables/useOrders'
import type { CustomerReceipt } from '~/composables/useOrders'

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
}>()

const showReceipt = ref(false)
const selectedCustomerReceipt = ref<CustomerReceipt | null>(null)
const { addOrder } = useOrders()

const customerReceipts = computed((): CustomerReceipt[] => {
  if (!props.customers.length) return []
  
  return props.customers.map(c => ({
    id: c.id,
    name: c.name,
    items: props.cartItems,
    total: props.total,
  }))
})

function handlePlaceOrder() {
  if (!props.cartItems.length || !props.customers.length) return
  const receipts = customerReceipts.value
  if (!receipts.length) return
  addOrder(receipts, props.total, false)
  emit('clearCart')
  const firstReceipt = receipts[0]
  if (firstReceipt) {
    selectedCustomerReceipt.value = firstReceipt
    showReceipt.value = true
  }
}

function viewCustomerReceipt(receipt: CustomerReceipt) {
  selectedCustomerReceipt.value = receipt
  showReceipt.value = true
}
</script>

<template>
  <aside class="w-72 shrink-0 flex flex-col border-l"
    style="background: var(--bg-cart); border-color: var(--border-color)">

    <div class="p-4 border-b flex items-center gap-2"
      style="border-color: var(--border-color)">
      <span class="font-medium text-sm" style="color: var(--text-primary)">Your order</span>
      <UBadge v-if="cartCount > 0" color="primary" size="sm">{{ cartCount }}</UBadge>
    </div>

    <div class="flex-1 overflow-y-auto p-3">
      <div v-if="!cartItems.length" class="text-center py-10 text-xs"
        style="color: var(--text-faint)">
        Your cart is empty
      </div>

      <div class="grid grid-cols-2 gap-2">
        <CartItem
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          @change-qty="(id, delta) => $emit('changeQty', id, delta)"
          @remove="$emit('remove', $event)"
        />
      </div>

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
      :is-split="customers.length > 1"
      :split-total="total"
      @close="showReceipt = false"
    />

  </aside>
</template>