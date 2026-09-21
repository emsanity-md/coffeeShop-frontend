<script setup lang="ts">
import type { MenuItem } from '~/types/menu'

defineProps<{
  items: MenuItem[]
  groupedItems: Record<string, MenuItem[]> | null
  catLabels: Record<string, string>
}>()

defineEmits<{ (e: 'add', id: number): void }>()
</script>

<template>
  <div class="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 lg:p-5 space-y-5 sm:space-y-6">

    <div v-if="!items.length" class="anim-fade-up px-2">
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-heroicons-magnifying-glass"
        title="No items found"
        description="Try a different search or category."
      />
    </div>

    <!-- Grouped view -->
    <template v-else-if="groupedItems">
      <div v-for="(group, cat) in groupedItems" :key="cat" class="anim-fade-in">
        <p class="text-xs font-medium mb-2 sm:mb-3 tracking-wide" style="color: var(--text-muted)">{{ catLabels[cat] }}</p>
        <TransitionGroup name="menu-card" tag="div" class="relative grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
          <MenuCard
            v-for="(item, i) in group"
            :key="item.id"
            :item="item"
            :style="{ '--stagger': `${Math.min(i, 10) * 32}ms` }"
            @add="$emit('add', $event)"
          />
        </TransitionGroup>
      </div>
    </template>

    <!-- Filtered single category view -->
    <template v-else>
      <TransitionGroup name="menu-card" tag="div" class="relative grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
        <MenuCard
          v-for="(item, i) in items"
          :key="item.id"
          :item="item"
          :style="{ '--stagger': `${Math.min(i, 12) * 32}ms` }"
          @add="$emit('add', $event)"
        />
      </TransitionGroup>
    </template>

  </div>
</template>