<script setup lang="ts">
defineProps<{
  categories: { key: string; label: string }[]
  activeCategory: string
}>()

defineEmits<{
  (e: 'update:activeCategory', val: string): void
}>()
</script>

<template>
  <aside class="w-48 shrink-0 bg-[#1a1612] border-r border-[#2e2820] p-4 flex flex-col gap-2"
    style="background: var(--bg-sidebar); border-color: var(--border-color)">
    <!-- Logo + Theme Toggle -->
    <div class="flex items-center justify-between pb-4 border-b border-[#2e2820] mb-2">
      <span class="text-[#c9a96e] font-medium text-sm">☕ Brewed</span>
      <ThemeToggle />
    </div>
    <UButton
      v-for="cat in categories"
      :key="cat.key"
      :variant="activeCategory === cat.key ? 'soft' : 'ghost'"
      color="neutral"
      class="justify-start text-sm"
      @click="$emit('update:activeCategory', cat.key)"
    >
      {{ cat.label }}
    </UButton>
  </aside>
</template>