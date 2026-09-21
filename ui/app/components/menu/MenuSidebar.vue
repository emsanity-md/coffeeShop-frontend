<script setup lang="ts">
defineProps<{
  categories: { key: string; label: string }[]
  activeCategory: string
  showClose?: boolean
}>()

defineEmits<{
  (e: 'update:activeCategory', val: string): void
  (e: 'close'): void
}>()
</script>

<template>
  <aside class="w-full sm:w-64 lg:w-48 xl:w-56 shrink-0 border-r p-4 flex flex-col gap-2 overflow-y-auto overscroll-contain"
    style="background: var(--bg-sidebar); border-color: var(--border-color)">
    <!-- Logo + Theme Toggle -->
    <div class="flex items-center justify-between pb-4 border-b mb-2" style="border-color: var(--border-color)">
      <span class="font-medium text-sm flex items-center gap-1.5" style="color: var(--accent)">☕ Brewed</span>
      <div class="flex items-center gap-1">
        <ThemeToggle />
        <UButton
          v-if="showClose"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-x-mark"
          size="xs"
          aria-label="Close menu"
          class="lg:hidden"
          @click="$emit('close')"
        />
      </div>
    </div>
    <nav class="flex flex-col gap-1.5" aria-label="Menu categories">
      <UButton
        v-for="cat in categories"
        :key="cat.key"
        :variant="activeCategory === cat.key ? 'soft' : 'ghost'"
        color="neutral"
        class="justify-start text-sm anim-press w-full"
        :aria-pressed="activeCategory === cat.key"
        @click="$emit('update:activeCategory', cat.key); $emit('close')"
      >
        {{ cat.label }}
      </UButton>
    </nav>
  </aside>
</template>