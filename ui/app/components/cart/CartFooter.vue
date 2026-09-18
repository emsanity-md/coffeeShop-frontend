<script setup lang="ts">
import type { CartItem } from '~/types/menu'

defineProps<{
  items: CartItem[]
  total: number
}>()

defineEmits<{ (e: 'placeOrder'): void }>()
</script>

<template>
  <div class="p-4 border-t space-y-2" style="border-color: var(--border-color)">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex justify-between text-xs"
      style="color: var(--text-muted)"
    >
      <span class="truncate mr-2">
        {{ item.name }}
        <span class="opacity-60">× {{ item.qty }}</span>
      </span>
      <span class="shrink-0">₱{{ (item.price * item.qty).toFixed(2) }}</span>
    </div>

    <div class="flex justify-between text-sm font-medium pt-2 border-t"
      style="border-color: var(--border-color); color: var(--text-primary)">
      <span>Total</span><span>₱{{ total.toFixed(2) }}</span>
    </div>

    <UButton block color="primary" class="mt-2" @click="$emit('placeOrder')">
      Place order
    </UButton>
  </div>
</template>