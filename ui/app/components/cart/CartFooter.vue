<script setup lang="ts">
defineProps<{
  subtotal: number
  tax: number
  total: number
}>()
</script>

<template>
  <div class="p-4 border-t space-y-2" style="border-color: var(--border-color)">
    <div class="flex justify-between text-xs" style="color: var(--text-muted)">
      <span>Subtotal</span><span>₱{{ subtotal.toFixed(2) }}</span>
    </div>
    <div class="flex justify-between text-xs" style="color: var(--text-muted)">
      <span>Tax (12%)</span><span>₱{{ tax.toFixed(2) }}</span>
    </div>
    <div class="flex justify-between text-sm font-medium pt-1 border-t"
      style="border-color: var(--border-color); color: var(--text-primary)">
      <span>Total</span><span>₱{{ total.toFixed(2) }}</span>
    </div>
    <UButton block color="primary" class="mt-2">Place order</UButton>
  </div>
</template>