<script setup lang="ts">
/**
 * KPI row above the order grid. Each figure is a count-up and each is derived
 * from the same `orders` array the grid renders, so the tiles and the list can
 * never disagree.
 */
import { Banknote, ClipboardList, Flame } from '@lucide/vue'
import { Card } from '~/components/ui/card'
import { STATUS_META } from '~/constants/order-status'
import type { Order } from '~/types/order'
import { formatPesoCompact } from '~/utils'

const props = defineProps<{ orders: Order[] }>()

const revenue = computed(() =>
  props.orders.reduce((sum, o) => sum + (o.status === 'cancelled' ? 0 : (o.total || 0)), 0))

const activeCount = computed(() =>
  props.orders.filter(o => o.status === 'preparing' || o.status === 'ready').length)

const tiles = computed(() => [
  {
    key: 'orders',
    label: 'Orders',
    value: props.orders.length,
    format: (n: number) => String(Math.round(n)),
    icon: ClipboardList,
    tone: 'var(--primary)',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    value: revenue.value,
    format: formatPesoCompact,
    icon: Banknote,
    tone: 'var(--status-ready)',
    hint: 'excludes cancelled',
  },
  {
    key: 'in-progress',
    label: 'In progress',
    value: activeCount.value,
    format: (n: number) => String(Math.round(n)),
    icon: Flame,
    tone: STATUS_META.preparing.tone,
    hint: 'preparing or ready',
  },
])
</script>

<template>
  <StaggerList class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <StaggerItem v-for="tile in tiles" :key="tile.key">
      <Card class="lift-card lift-card-hover h-full">
        <div class="flex items-center gap-3 p-4">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-lg"
            :style="{
              color: tile.tone,
              background: `color-mix(in srgb, ${tile.tone} 14%, transparent)`,
            }"
          >
            <component :is="tile.icon" class="size-4" />
          </span>
          <div class="min-w-0">
            <p class="tnum font-mono text-title font-semibold leading-none">
              <NumberTicker :value="tile.value" :format="tile.format" />
            </p>
            <p class="text-meta mt-1 truncate text-muted-foreground">
              {{ tile.label }}
              <span v-if="tile.hint" class="opacity-70">· {{ tile.hint }}</span>
            </p>
          </div>
        </div>
      </Card>
    </StaggerItem>
  </StaggerList>
</template>
