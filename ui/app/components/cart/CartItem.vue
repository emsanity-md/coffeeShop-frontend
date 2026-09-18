<script setup lang="ts">
import type { CartItem } from '~/types/menu'

defineProps<{ item: CartItem }>()
defineEmits<{
  (e: 'changeQty', id: number, delta: number): void
  (e: 'remove', id: number): void
}>()
</script>

<template>
  <div class="relative rounded-xl overflow-hidden cursor-pointer"
    style="background: var(--bg-card)">

    <!-- Image or icon -->
    <div class="w-full h-36 flex items-center justify-center overflow-hidden"
      style="background: var(--bg-sidebar)">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.name"
        class="w-full h-full object-cover"
      />
      <span v-else class="text-2xl">{{ item.icon }}</span>
    </div>

    <!-- Bottom gradient for qty controls visibility -->
    <div class="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
      style="background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" />

    <!-- X button — top right -->
    <UButton
      size="xs"
      variant="soft"
      color="error"
      icon="i-heroicons-x-mark"
      class="absolute top-1 right-1 z-10"
      @click="$emit('remove', item.id)"
    />

    <!-- Name + price + qty — bottom -->
    <div class="absolute inset-x-0 bottom-0 p-2 z-10">
      <p class="text-xs font-medium text-white leading-tight truncate">{{ item.name }}</p>
      <p class="text-xs text-white/60">₱{{ item.price }}</p>
      <div class="flex items-center justify-between mt-1">
        <UButton size="xs" variant="ghost" @click="$emit('changeQty', item.id, -1)">−</UButton>
        <span class="text-xs text-white">{{ item.qty }}</span>
        <UButton size="xs" variant="ghost" @click="$emit('changeQty', item.id, 1)">+</UButton>
      </div>
    </div>

  </div>
</template>