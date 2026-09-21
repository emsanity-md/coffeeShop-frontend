<script setup lang="ts">
import { computed } from 'vue'
import type { Order, CustomerReceipt, OrderStatus } from '~/composables/useOrders'
import { STATUS_META } from '~/composables/useOrders'
import type { CartItem } from '~/types/menu'

const props = defineProps<{ order: Order }>()

const emit = defineEmits<{
  (e: 'view-receipt', receipt: CustomerReceipt, order: Order): void
  (e: 'delete', id: string): void
  (e: 'status-change', id: string, status: OrderStatus): void
}>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '?').toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

const itemCount = computed(() => allItems.value.reduce((s, i) => s + i.qty, 0))
const orderIdShort = computed(() => props.order.id.slice(0, 8).toUpperCase())
const currentStatus = computed<OrderStatus>(() => props.order.status ?? 'pending')
const statusMeta = computed(() => STATUS_META[currentStatus.value])

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed']

const isTerminal = computed(() => currentStatus.value === 'completed' || currentStatus.value === 'cancelled')

const statusMenuItems = computed(() => {
  const flow = STATUS_FLOW.map((s) => ({
    label: STATUS_META[s].label,
    icon: STATUS_META[s].icon,
    color: STATUS_META[s].color,
    type: 'checkbox' as const,
    checked: currentStatus.value === s,
    onSelect: () => emit('status-change', props.order.id, s),
  }))
  const extra: any[] = []
  if (!isTerminal.value) {
    extra.push({
      label: 'Cancel',
      icon: 'i-heroicons-x-circle',
      color: 'error' as const,
      onSelect: () => emit('status-change', props.order.id, 'cancelled' as OrderStatus),
    })
  }
  if (currentStatus.value === 'cancelled') {
    extra.push({
      label: 'Reopen',
      icon: 'i-heroicons-arrow-path',
      onSelect: () => emit('status-change', props.order.id, 'pending' as OrderStatus),
    })
  }
  const groups: any[] = [flow]
  if (extra.length) groups.push(extra)
  return groups
})

// Get items to display for the order.
// When the bill was split equally each receipt holds a copy of the full cart,
// so summing across customers would multiply quantities. Show the first
// customer's items in that case (and for legacy duplicated receipts).
const allItems = computed((): CartItem[] => {
  const customers = props.order.customers ?? []
  if (!customers.length) return []
  const firstItems = customers[0]?.items ?? []
  if (props.order.splitEqually) {
    return firstItems.map(i => ({ ...i }))
  }
  const firstKey = JSON.stringify(firstItems)
  const allIdentical = customers.every(c => JSON.stringify(c.items ?? []) === firstKey)
  if (allIdentical) {
    return firstItems.map(i => ({ ...i }))
  }
  const itemMap = new Map<number, CartItem>()
  for (const customer of customers) {
    for (const item of customer.items ?? []) {
      if (itemMap.has(item.id)) {
        itemMap.get(item.id)!.qty += item.qty
      } else {
        itemMap.set(item.id, { ...item })
      }
    }
  }
  return Array.from(itemMap.values())
})
</script>

<template>
  <div class="warm-card group rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 border min-w-0"
    style="background: var(--bg-card); border-color: var(--border-color)">

    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <UAvatarGroup size="xs" :max="4">
            <UTooltip v-for="customer in (order.customers ?? []).slice(0, 4)" :key="customer.id" :text="customer.name">
              <UAvatar :text="initials(customer.name)" size="xs" color="neutral" variant="soft" />
            </UTooltip>
          </UAvatarGroup>
          <span v-if="order.splitEqually" class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
            <UIcon name="i-heroicons-users" class="w-3 h-3" />
            Split equally
          </span>
          <UBadge :key="currentStatus" :color="statusMeta.color" variant="soft" size="xs" :icon="statusMeta.icon" class="tnum status-fade anim-pop">
            {{ statusMeta.label }}
          </UBadge>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded-full warm-soft-panel tnum" style="color: var(--text-muted)">
            #{{ orderIdShort }}
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          <span v-for="customer in order.customers ?? []" :key="customer.id" class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary truncate max-w-28" :title="customer.name">
            {{ customer.name }}
          </span>
        </div>
        <p class="text-xs mt-1.5 flex items-center gap-1.5" style="color: var(--text-muted)">
          <UIcon name="i-heroicons-calendar-days" class="w-3.5 h-3.5 shrink-0" />
          {{ formatDate(order.date) }}
        </p>
      </div>
      <UTooltip text="Delete order">
        <UButton
          size="xs"
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          aria-label="Delete order"
          class="shrink-0 opacity-60 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          @click="$emit('delete', order.id)"
        />
      </UTooltip>
    </div>

    <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

    <!-- Items -->
    <div class="space-y-1 flex-1">
      <p class="text-[11px] font-semibold uppercase tracking-wider mb-2" style="color: var(--text-faint)">
        Items · {{ itemCount }}
      </p>
      <div
        v-for="item in allItems"
        :key="item.id"
        class="flex justify-between items-baseline gap-2 text-xs py-0.5"
        style="color: var(--text-muted)"
      >
        <span class="truncate mr-2 min-w-0">{{ item.name }} <span class="opacity-60 tnum">× {{ item.qty }}</span></span>
        <span class="shrink-0 tnum font-medium" style="color: var(--text-primary)">₱{{ (item.price * item.qty).toFixed(2) }}</span>
      </div>
    </div>

    <USeparator type="dashed" size="xs" color="neutral" class="opacity-60" />

    <!-- Total + Receipt buttons -->
    <div class="space-y-3">
      <div class="warm-soft-panel rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="text-[11px] font-medium" style="color: var(--text-muted)">
            {{ order.splitEqually ? 'Split equally' : 'Individual totals' }}
          </p>
          <p class="text-[11px]" style="color: var(--text-faint)">Order total</p>
        </div>
        <p class="text-base font-bold tnum shrink-0" style="color: var(--text-primary)">₱{{ order.total.toFixed(2) }}</p>
      </div>
      <UDropdownMenu
        :items="statusMenuItems"
        :content="{ side: 'bottom', align: 'start' }"
      >
        <UBadge
          :color="statusMeta.color"
          variant="soft"
          size="sm"
          :icon="statusMeta.icon"
          class="cursor-pointer tnum status-fade anim-pop"
        >
          {{ statusMeta.label }}
          <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 opacity-60" />
        </UBadge>
      </UDropdownMenu>
      <div class="flex flex-wrap gap-1.5">
        <UTooltip v-for="customer in order.customers ?? []" :key="customer.id" :text="`View ${customer.name}'s receipt`">
          <UButton
            size="xs"
            variant="soft"
            color="primary"
            icon="i-heroicons-document-text"
            class="max-w-full"
            @click="$emit('view-receipt', customer, order)"
          >
            <span class="truncate max-w-24">{{ customer.name }}</span>
            <span class="tnum opacity-70">· ₱{{ customer.total.toFixed(2) }}</span>
          </UButton>
        </UTooltip>
      </div>
    </div>

  </div>
</template>