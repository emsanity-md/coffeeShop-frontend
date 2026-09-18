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
  <div class="flex-1 overflow-y-auto p-5 space-y-6">

    <!-- Grouped view -->
    <template v-if="groupedItems">
      <div v-for="(group, cat) in groupedItems" :key="cat">
        <p class="text-xs text-[#a89880] font-medium mb-3">{{ catLabels[cat] }}</p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <MenuCard
            v-for="item in group"
            :key="item.id"
            :item="item"
            @add="$emit('add', $event)"
          />
        </div>
      </div>
    </template>

    <!-- Filtered single category view -->
    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <MenuCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @add="$emit('add', $event)"
        />
      </div>
    </template>

  </div>
</template>