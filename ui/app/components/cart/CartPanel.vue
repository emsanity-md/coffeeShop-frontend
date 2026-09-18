<script setup lang="ts">
import type { CartItem } from '~/types/menu'

defineProps<{
  cartItems: CartItem[]
  cartCount: number
  subtotal: number
  tax: number
  total: number
}>()

defineEmits<{ (e: 'changeQty', id: number, delta: number): void }>()
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

      <!-- 2 column grid -->
      <div class="grid grid-cols-2 gap-2">
        <CartItem
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          @change-qty="(id, delta) => $emit('changeQty', id, delta)"
        />
      </div>
    </div>

    <CartFooter
      v-if="cartItems.length"
      :subtotal="subtotal"
      :tax="tax"
      :total="total"
    />
  </aside>
</template>