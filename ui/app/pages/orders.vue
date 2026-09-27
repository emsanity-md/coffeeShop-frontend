<script setup lang="ts">
/**
 * Order history. Scrolls as a normal page (unlike the POS, which locks to the
 * viewport) because a long list is expected here and a pinned cart would be in
 * the way.
 */
import { computed, ref } from 'vue'
import { ArrowLeft, ClipboardList, Plus, SearchX, Trash2, TriangleAlert } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { Separator } from '~/components/ui/separator'
import { ORDER_STATUSES, STATUS_META } from '~/constants/order-status'
import { ROUTES, SITE } from '~/constants/site'
import type { CustomerReceipt, Order, OrderStatus } from '~/types/order'
import { formatPeso } from '~/utils'

definePageMeta({ layout: 'pos' })

const { orders, updateOrderStatus, deleteOrder, clearOrders } = useOrders()

const activeStatus = ref<OrderStatus | 'all'>('all')

const totalRevenue = computed(() =>
  orders.value.reduce((sum, o) => sum + (o.status === 'cancelled' ? 0 : (o.total || 0)), 0))

const statusCounts = computed<Record<OrderStatus, number>>(() => {
  const counts = Object.fromEntries(ORDER_STATUSES.map(s => [s, 0])) as Record<OrderStatus, number>
  for (const order of orders.value) {
    const status = order.status ?? 'pending'
    counts[status] = (counts[status] ?? 0) + 1
  }
  return counts
})

const filteredOrders = computed(() =>
  activeStatus.value === 'all'
    ? orders.value
    : orders.value.filter(o => (o.status ?? 'pending') === activeStatus.value))

const statusOptions = computed(() => [
  { value: 'all', label: 'All', count: orders.value.length },
  ...ORDER_STATUSES.map(status => ({
    value: status,
    label: STATUS_META[status].label,
    icon: STATUS_META[status].icon,
    count: statusCounts.value[status] ?? 0,
    tone: STATUS_META[status].tone,
  })),
])

// --- Receipt ---------------------------------------------------------------
const receipt = ref<{ receipt: CustomerReceipt, order: Order } | null>(null)

// --- Confirmations ---------------------------------------------------------
const confirmDelete = ref<string | null>(null)
const confirmClearAll = ref(false)

function onStatusChange(id: string, status: OrderStatus) {
  updateOrderStatus(id, status)
  // Keep an open receipt in sync with the order behind it.
  if (receipt.value?.order.id === id) {
    receipt.value = { ...receipt.value, order: { ...receipt.value.order, status } }
  }
}

function doDelete() {
  if (confirmDelete.value) deleteOrder(confirmDelete.value)
  confirmDelete.value = null
}

useSeoMeta({ title: `Orders · ${SITE.fullName}`, description: 'Order history, status tracking and revenue.' })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
    <header
      class="sticky top-0 z-10 border-b border-border bg-card/85 px-3 py-3 backdrop-blur-md sm:px-4 lg:px-6"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
        <Button
          as-child
          variant="ghost"
          size="icon-sm"
          aria-label="Back to the menu"
          class="shrink-0"
        >
          <NuxtLink :to="ROUTES.pos">
            <ArrowLeft class="size-4" />
          </NuxtLink>
        </Button>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="truncate text-title">Orders</h1>
            <Badge v-if="orders.length" variant="secondary" class="tnum shrink-0">
              {{ orders.length }}
            </Badge>
          </div>
          <p v-if="orders.length" class="tnum truncate text-meta text-muted-foreground">
            {{ orders.length }} {{ orders.length === 1 ? 'order' : 'orders' }} ·
            {{ formatPeso(totalRevenue) }} total
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-1.5">
          <Button as-child size="sm">
            <NuxtLink :to="ROUTES.pos">
              <Plus class="size-4" />
              <span class="hidden sm:inline">New order</span>
            </NuxtLink>
          </Button>
          <Button
            v-if="orders.length"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear all orders"
            class="text-muted-foreground hover:text-destructive"
            @click="confirmClearAll = true"
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <Empty v-if="!orders.length" class="anim-fade-up mx-auto max-w-md border-0 py-16">
        <EmptyHeader>
          <EmptyMedia class="bg-muted text-muted-foreground">
            <ClipboardList class="size-5" />
          </EmptyMedia>
          <EmptyTitle class="text-section">No orders yet</EmptyTitle>
          <EmptyDescription class="text-body">
            Orders appear here once you place one. Start from the menu.
          </EmptyDescription>
        </EmptyHeader>
        <Button as-child variant="outline" size="sm">
          <NuxtLink :to="ROUTES.pos">
            <ArrowLeft class="size-4" />
            Back to the menu
          </NuxtLink>
        </Button>
      </Empty>

      <div v-else class="space-y-4">
        <OrderKpis :orders="orders" />

        <div class="flex items-baseline justify-between gap-2">
          <h2 class="text-section">Recent orders</h2>
          <p class="hidden text-meta text-muted-foreground sm:block">Newest first</p>
        </div>

        <div class="-mx-3 overflow-x-auto px-3 no-scrollbar sm:mx-0 sm:px-0">
          <PillNav
            v-model="activeStatus"
            :options="statusOptions"
            aria-label="Filter orders by status"
          />
        </div>

        <Empty v-if="!filteredOrders.length" class="anim-fade-up mx-auto max-w-md border-0 py-10">
          <EmptyHeader>
            <EmptyMedia class="bg-muted text-muted-foreground">
              <SearchX class="size-5" />
            </EmptyMedia>
            <EmptyTitle class="text-card">
              No {{ activeStatus === 'all' ? '' : STATUS_META[activeStatus].label.toLowerCase() + ' ' }}orders
            </EmptyTitle>
            <EmptyDescription class="text-meta">Try a different status filter.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" @click="activeStatus = 'all'">Clear filter</Button>
        </Empty>

        <TransitionGroup
          v-else
          name="list"
          tag="div"
          class="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          <OrderCard
            v-for="order in filteredOrders"
            :key="order.id"
            :order="order"
            @view-receipt="(r, o) => { receipt = { receipt: r, order: o } }"
            @delete="confirmDelete = $event"
            @status-change="onStatusChange"
          />
        </TransitionGroup>
      </div>
    </main>

    <ReceiptDialog
      v-if="receipt"
      :open="!!receipt"
      :customer-name="receipt.receipt.name"
      :items="receipt.receipt.items"
      :total="receipt.receipt.total"
      :is-split="receipt.order.splitEqually"
      :split-total="receipt.order.total"
      :date="receipt.order.date"
      :order-id="receipt.order.id"
      :status="receipt.order.status"
      @close="receipt = null"
    />

    <!-- Delete one -->
    <Dialog :open="!!confirmDelete" @update:open="confirmDelete = null">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader class="items-center text-center">
          <span class="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <TriangleAlert class="size-5" />
          </span>
          <DialogTitle class="mt-2 text-section">Delete this order?</DialogTitle>
          <DialogDescription class="text-body">
            This can't be undone — the receipts go with it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-2">
          <Button variant="outline" class="flex-1" @click="confirmDelete = null">Cancel</Button>
          <Button variant="destructive" class="flex-1" @click="doDelete">
            <Trash2 class="size-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Clear all -->
    <Dialog v-model:open="confirmClearAll">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader class="items-center text-center">
          <span class="mx-auto flex size-11 items-center justify-center rounded-full bg-destructive/12 text-destructive">
            <Trash2 class="size-5" />
          </span>
          <DialogTitle class="mt-2 text-section">Clear all orders?</DialogTitle>
          <DialogDescription class="text-body">
            Removes {{ orders.length }} {{ orders.length === 1 ? 'order' : 'orders' }}
            ({{ formatPeso(totalRevenue) }}) permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="gap-2 sm:gap-2">
          <Button variant="outline" class="flex-1" @click="confirmClearAll = false">Cancel</Button>
          <Button variant="destructive" class="flex-1" @click="clearOrders(); confirmClearAll = false">
            Clear all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
