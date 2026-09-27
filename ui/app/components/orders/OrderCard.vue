<script setup lang="ts">
/**
 * Order card.
 *
 * `allItems` guards against a real bug in the data model: when a bill is split
 * equally, every customer receipt holds a copy of the *whole* cart, so naively
 * summing across customers would multiply every quantity. It shows the first
 * customer's items in that case, and only merges when the receipts genuinely
 * differ.
 */
import { computed } from 'vue'
import { ChevronDown, Trash2, Users } from '@lucide/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { REOPEN_ICON, STATUS_FLOW, STATUS_META, TERMINAL_STATUSES } from '~/constants/order-status'
import type { Order, OrderStatus, CustomerReceipt } from '~/types/order'
import type { CartItem } from '~/types/menu'
import { customerInitials, formatDateTime, formatPeso } from '~/utils'

const props = defineProps<{ order: Order }>()

const emit = defineEmits<{
  (e: 'view-receipt', receipt: CustomerReceipt, order: Order): void
  (e: 'delete', id: string): void
  (e: 'status-change', id: string, status: OrderStatus): void
}>()

const currentStatus = computed<OrderStatus>(() => props.order.status ?? 'pending')
const statusMeta = computed(() => STATUS_META[currentStatus.value])
const orderIdShort = computed(() => props.order.id.slice(0, 8).toUpperCase())
const isTerminal = computed(() => TERMINAL_STATUSES.includes(currentStatus.value))

const allItems = computed<CartItem[]>(() => {
  const receipts = props.order.customers ?? []
  if (!receipts.length) return []
  const firstItems = receipts[0]?.items ?? []

  if (props.order.splitEqually) return firstItems.map(i => ({ ...i }))

  const firstKey = JSON.stringify(firstItems)
  const identical = receipts.every(r => JSON.stringify(r.items ?? []) === firstKey)
  if (identical) return firstItems.map(i => ({ ...i }))

  const merged = new Map<number, CartItem>()
  for (const r of receipts) {
    for (const item of r.items ?? []) {
      const existing = merged.get(item.id)
      if (existing) existing.qty += item.qty
      else merged.set(item.id, { ...item })
    }
  }
  return [...merged.values()]
})

const itemCount = computed(() => allItems.value.reduce((s, i) => s + i.qty, 0))
</script>

<template>
  <article
    class="lift-card group flex h-full min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4"
  >
    <header class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Customer avatars, capped at 4 -->
          <div class="flex -space-x-1.5">
            <Tooltip
              v-for="customer in (props.order.customers ?? []).slice(0, 4)"
              :key="customer.id"
            >
              <TooltipTrigger as-child>
                <Avatar class="size-6 ring-2 ring-card">
                  <AvatarFallback class="bg-primary/12 text-[10px] font-semibold text-primary">
                    {{ customerInitials(customer.name) }}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{{ customer.name }}</TooltipContent>
            </Tooltip>
          </div>

          <span
            v-if="props.order.splitEqually"
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label"
            style="color: var(--status-ready); background: color-mix(in srgb, var(--status-ready) 14%, transparent)"
          >
            <Users class="size-3" />
            Split equally
          </span>

          <span
            class="tnum rounded-full px-2 py-0.5 font-mono text-label text-muted-foreground"
            style="background: var(--muted)"
          >#{{ orderIdShort }}</span>
        </div>

        <div v-if="(props.order.customers ?? []).length" class="mt-2 flex flex-wrap gap-1.5">
          <Badge
            v-for="customer in props.order.customers"
            :key="customer.id"
            variant="secondary"
            class="max-w-28 truncate text-label"
            :title="customer.name"
          >{{ customer.name }}</Badge>
        </div>

        <p class="tnum mt-1.5 text-meta text-muted-foreground">
          {{ formatDateTime(props.order.date) }}
        </p>
      </div>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Delete order"
            class="shrink-0 text-muted-foreground opacity-60 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-100"
            @click="emit('delete', props.order.id)"
          >
            <Trash2 class="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete order</TooltipContent>
      </Tooltip>
    </header>

    <Separator class="opacity-60" />

    <!-- Items -->
    <div class="min-h-0 flex-1 space-y-1">
      <p class="text-label mb-1.5 text-muted-foreground">
        Items · {{ itemCount }}
      </p>
      <p
        v-for="item in allItems"
        :key="item.id"
        class="flex items-baseline justify-between gap-2 py-0.5 text-meta"
      >
        <span class="min-w-0 truncate text-muted-foreground">
          {{ item.name }}
          <span class="tnum opacity-60">× {{ item.qty }}</span>
        </span>
        <span class="tnum shrink-0 font-medium text-foreground">
          {{ formatPeso(item.price * item.qty) }}
        </span>
      </p>
    </div>

    <Separator class="opacity-60" />

    <footer class="space-y-2.5">
      <div class="soft-panel flex items-center justify-between gap-2 rounded-lg px-3 py-2">
        <div class="min-w-0">
          <p class="text-label text-foreground">
            {{ props.order.splitEqually ? 'Split equally' : 'Individual totals' }}
          </p>
          <p class="text-label text-muted-foreground">Order total</p>
        </div>
        <p class="tnum shrink-0 font-mono text-section font-bold">
          {{ formatPeso(props.order.total) }}
        </p>
      </div>

      <!-- Status control: a badge that opens the transition menu. -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button
            type="button"
            class="anim-press inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-transparent px-2.5 py-1.5 text-body font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            :style="{
              color: statusMeta.tone,
              background: `color-mix(in srgb, ${statusMeta.tone} 14%, transparent)`,
            }"
            :aria-label="`Status: ${statusMeta.label}. Change status`"
          >
            <component :is="statusMeta.icon" class="size-4" />
            {{ statusMeta.label }}
            <ChevronDown class="size-3.5 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-48">
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              v-for="status in STATUS_FLOW"
              :key="status"
              :checked="currentStatus === status"
              @select="emit('status-change', props.order.id, status)"
            >
              <component :is="STATUS_META[status].icon" class="size-4" />
              {{ STATUS_META[status].label }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-if="!isTerminal"
            class="text-destructive focus:text-destructive"
            @select="emit('status-change', props.order.id, 'cancelled')"
          >
            Cancel order
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="currentStatus === 'cancelled'"
            @select="emit('status-change', props.order.id, 'pending')"
          >
            <component :is="REOPEN_ICON" class="size-4" />
            Reopen as pending
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="flex flex-wrap gap-1.5">
        <Button
          v-for="customer in props.order.customers ?? []"
          :key="customer.id"
          variant="secondary"
          size="xs"
          class="max-w-full"
          @click="emit('view-receipt', customer, props.order)"
        >
          <span class="truncate">{{ customer.name }}</span>
          <span class="tnum opacity-70">· {{ formatPeso(customer.total) }}</span>
        </Button>
      </div>
    </footer>
  </article>
</template>
