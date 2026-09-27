<script setup lang="ts">
/**
 * Menu grid. Renders either the grouped view (all categories) or a flat filtered
 * list. Both use the same stagger and transition-group treatment.
 */
import { SearchX } from '@lucide/vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { Button } from '~/components/ui/button'
import type { MenuItem } from '~/types/menu'

const props = defineProps<{
  items: MenuItem[]
  groupedItems: Record<string, MenuItem[]> | null
  catLabels: Record<string, string>
  search: string
}>()

const emit = defineEmits<{
  (e: 'add', id: number): void
  (e: 'clear-filters'): void
}>()
</script>

<template>
  <div class="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 sm:py-5">
    <Empty v-if="!props.items.length" class="anim-fade-up border-0 py-10">
      <EmptyHeader>
        <EmptyMedia class="bg-muted text-muted-foreground">
          <SearchX class="size-5" />
        </EmptyMedia>
        <EmptyTitle class="text-section">Nothing matches that</EmptyTitle>
        <EmptyDescription class="text-body">
          <span v-if="props.search">No menu item is called “{{ props.search }}”.</span>
          <span v-else>That category is empty.</span>
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" size="sm" @click="emit('clear-filters')">Clear filters</Button>
    </Empty>

    <!-- Grouped: one section per category -->
    <template v-else-if="props.groupedItems">
      <section
        v-for="(group, cat) in props.groupedItems"
        :key="cat"
        class="anim-fade-in mb-6 last:mb-0"
      >
        <h2 class="text-label mb-2.5 text-muted-foreground">
          {{ props.catLabels[cat] ?? cat }}
        </h2>
        <TransitionGroup
          name="list"
          tag="div"
          class="relative grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4"
        >
          <MenuCard
            v-for="item in group"
            :key="item.id"
            :item="item"
            @add="emit('add', $event)"
          />
        </TransitionGroup>
      </section>
    </template>

    <!-- Flat: a single category or a search result -->
    <template v-else>
      <TransitionGroup
        name="list"
        tag="div"
        class="relative grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4"
      >
        <MenuCard
          v-for="item in props.items"
          :key="item.id"
          :item="item"
          @add="emit('add', $event)"
        />
      </TransitionGroup>
    </template>
  </div>
</template>
