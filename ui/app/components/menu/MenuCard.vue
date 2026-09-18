<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

defineProps<{ item: MenuItem }>()
defineEmits<{ (e: 'add', id: number): void }>()
</script>

<template>
  <div
    class="relative w-full h-70 rounded-xl overflow-hidden cursor-pointer"
    style="background: var(--bg-sidebar)"
    @click.self="$emit('add', item.id)"
  >
    <!-- Image or icon -->
    <img
      v-if="item.image"
      :src="item.image"
      :alt="item.name"
      class="w-full h-full object-cover"
    />
    <span v-else class="absolute inset-0 flex items-center justify-center text-3xl">
      {{ item.icon }}
    </span>

    <!-- Bottom gradient overlay -->
    <div
      class="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
      style="background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)"
    />

    <!-- Labels -->
    <div class="absolute inset-x-0 bottom-0 p-2 flex items-end justify-between">
      <div class="min-w-0 flex-1 pr-2">
        <p class="text-sm font-medium text-white leading-tight truncate">{{ item.name }}</p>
        <p class="text-xs text-white/60 truncate">{{ item.desc }}</p>
      </div>
      <div class="flex flex-col items-end gap-1 shrink-0">
        <span class="text-xs font-medium text-white/90">₱{{ item.price }}</span>
        <UButton size="xs" @click.stop="$emit('add', item.id)">+</UButton>
      </div>
    </div>
  </div>
</template>