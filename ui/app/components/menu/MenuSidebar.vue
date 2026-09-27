<script setup lang="ts">
/**
 * Category rail. Doubles as the mobile sheet's content, which is why the close
 * button and the `showClose` flag live here rather than at the call site.
 */
import { Coffee, Croissant, Layers, Leaf, ShieldCheck, Snowflake, X } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import type { Category } from '~/types/menu'
import type { Component } from 'vue'

defineProps<{
  categories: Category[]
  activeCategory: string
  showClose?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeCategory', val: string): void
  (e: 'close'): void
  (e: 'open-notice'): void
}>()

/** Menu emoji would be quicker but inconsistent; Lucide keeps one icon weight. */
const ICONS: Record<string, Component> = {
  all: Layers,
  coffee: Coffee,
  tea: Leaf,
  pastry: Croissant,
  cold: Snowflake,
}
</script>

<template>
  <aside class="flex h-full w-full flex-col border-border bg-card lg:w-60 lg:border-r">
    <div class="flex items-center justify-between gap-2 border-b border-border p-3.5">
      <h2 class="text-label text-muted-foreground">Categories</h2>
      <div class="flex items-center gap-1">
        <ThemeToggle />
        <Button
          v-if="showClose"
          variant="ghost"
          size="icon-xs"
          aria-label="Close categories"
          class="lg:hidden"
          @click="emit('close')"
        >
          <X class="size-4" />
        </Button>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-2.5" aria-label="Menu categories">
      <ul class="flex flex-col gap-1">
        <li v-for="cat in categories" :key="cat.key">
          <button
            type="button"
            class="anim-press flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            :class="activeCategory === cat.key
              ? 'bg-primary/12 font-medium text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'"
            :aria-pressed="activeCategory === cat.key"
            @click="emit('update:activeCategory', cat.key); emit('close')"
          >
            <component
              :is="ICONS[cat.key] ?? Layers"
              class="size-4 shrink-0"
            />
            <span class="truncate">{{ cat.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Prototype notice, pinned to the bottom of the rail. -->
    <div class="border-t border-border p-3">
      <button
        type="button"
        class="flex w-full items-start gap-2 rounded-lg p-2 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('open-notice')"
      >
        <ShieldCheck class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <span class="text-meta leading-snug text-muted-foreground">
          Prototype — no real data is collected.
          <span class="underline underline-offset-2">Privacy notice</span>
        </span>
      </button>
    </div>
  </aside>
</template>
