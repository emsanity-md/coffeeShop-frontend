<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders, ORDER_STATUSES, STATUS_META } from '~/composables/useOrders'
import type { Order, CustomerReceipt, OrderStatus } from '~/composables/useOrders'
import ReceiptModal from '~/components/ReceiptModal.vue'

const router = useRouter()
const { orders, updateOrderStatus, deleteOrder, clearOrders } = useOrders()

const showReceipt = ref(false)
const selectedCustomerReceipt = ref<CustomerReceipt | null>(null)
const selectedOrder = ref<Order | null>(null)
const showDeleteModal = ref(false)
const deleteOrderId = ref<string | null>(null)
const showClearAllModal = ref(false)
const activeStatus = ref<OrderStatus | 'all'>('all')

const ordersCount = computed(() => orders.value.length)
const totalRevenue = computed(() =>
  orders.value.reduce((s, o) => s + (o.status === 'cancelled' ? 0 : (o.total || 0)), 0)
)
const statusCounts = computed(() => {
  const counts = {} as Record<OrderStatus, number>
  for (const status of ORDER_STATUSES) counts[status] = 0
  for (const order of orders.value) {
    const status = order.status ?? 'pending'
    counts[status] = (counts[status] ?? 0) + 1
  }
  return counts
})
const filteredOrders = computed(() =>
  activeStatus.value === 'all'
    ? orders.value
    : orders.value.filter(o => (o.status ?? 'pending') === activeStatus.value)
)

function goBack() {
  router.push('/')
}

function openReceipt(customerReceipt: CustomerReceipt, order: Order) {
  selectedCustomerReceipt.value = customerReceipt
  selectedOrder.value = order
  showReceipt.value = true
}

function closeReceipt() {
  showReceipt.value = false
  selectedCustomerReceipt.value = null
  selectedOrder.value = null
}

function handleDelete(id: string) {
  deleteOrderId.value = id
  showDeleteModal.value = true
}

function handleStatusChange(id: string, status: OrderStatus) {
  updateOrderStatus(id, status)
  if (selectedOrder.value?.id === id) {
    selectedOrder.value = { ...selectedOrder.value, status }
  }
}

function confirmDelete() {
  if (deleteOrderId.value) {
    deleteOrder(deleteOrderId.value)
    deleteOrderId.value = null
  }
  showDeleteModal.value = false
}

function handleClearAll() {
  showClearAllModal.value = true
}

function confirmClearAll() {
  clearOrders()
  showClearAllModal.value = false
}
</script>

<template>
  <div class="min-h-screen min-h-[100dvh] overflow-x-hidden" style="background: var(--bg-app); color: var(--text-primary)">

    <!-- Header -->
    <div class="sticky top-0 z-10 px-3 sm:px-4 lg:px-6 py-3 border-b backdrop-blur-md" style="background: var(--bg-topbar); border-color: var(--border-color)">
      <div class="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
        <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-left" size="sm" aria-label="Back to menu" class="shrink-0" @click="goBack" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span class="text-base sm:text-lg">☕</span>
            <h1 class="text-sm sm:text-base font-bold truncate">Orders</h1>
            <UBadge v-if="ordersCount > 0" color="primary" variant="soft" size="sm" class="tnum shrink-0">{{ ordersCount }}</UBadge>
          </div>
          <p v-if="ordersCount > 0" class="text-[11px] sm:text-xs tnum truncate" style="color: var(--text-muted)">
            {{ ordersCount }} {{ ordersCount === 1 ? 'order' : 'orders' }} · ₱{{ totalRevenue.toFixed(2) }} total
          </p>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <UButton color="primary" variant="soft" size="sm" icon="i-heroicons-plus" class="h-8 sm:h-auto" @click="goBack"> <span class="hidden xs:inline">New order</span><span class="xs:hidden">New</span> </UButton>
          <UButton v-if="orders.length" color="neutral" variant="ghost" size="sm" icon="i-heroicons-trash" aria-label="Clear all orders" class="h-8 w-8 p-0 sm:w-auto sm:px-2.5" @click="handleClearAll" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full min-w-0">
      <div v-if="!orders.length" class="anim-fade-up mx-auto max-w-md text-center py-12 sm:py-20 lg:py-28 px-2">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-heroicons-receipt-text"
          title="No orders yet"
          description="Orders will appear here after placing them. Start a new order from the menu."
          :actions="[{ label: 'Back to menu', icon: 'i-heroicons-arrow-left', color: 'primary', onClick: goBack }]"
          orientation="vertical"
        />
      </div>

      <div v-else class="space-y-3 sm:space-y-4 min-w-0">
        <div class="flex items-baseline justify-between gap-2">
          <h2 class="text-sm font-semibold" style="color: var(--text-primary)">Recent orders</h2>
          <p class="text-xs hidden sm:block" style="color: var(--text-faint)">Newest first</p>
        </div>
        <div class="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none flex-nowrap" role="tablist" aria-label="Filter orders by status">
          <UButton
            size="xs"
            :variant="activeStatus === 'all' ? 'soft' : 'ghost'"
            color="neutral"
            :aria-pressed="activeStatus === 'all'"
            class="anim-press shrink-0"
            @click="activeStatus = 'all'"
          >
            All
            <UBadge color="neutral" variant="soft" size="xs" class="tnum">{{ ordersCount }}</UBadge>
          </UButton>
          <UButton
            v-for="status in ORDER_STATUSES"
            :key="status"
            size="xs"
            :variant="activeStatus === status ? 'soft' : 'ghost'"
            :color="STATUS_META[status].color"
            :icon="STATUS_META[status].icon"
            :aria-pressed="activeStatus === status"
            class="anim-press shrink-0"
            @click="activeStatus = status"
          >
            {{ STATUS_META[status].label }}
            <UBadge :color="STATUS_META[status].color" variant="soft" size="xs" class="tnum">{{ statusCounts[status] }}</UBadge>
          </UButton>
        </div>
        <div v-if="!filteredOrders.length" class="anim-fade-up mx-auto max-w-md text-center py-8 sm:py-12 px-2">
          <UAlert
            color="neutral"
            variant="soft"
            icon="i-heroicons-magnifying-glass"
            :title="`No ${activeStatus === 'all' ? '' : STATUS_META[activeStatus].label.toLowerCase() + ' '}orders`"
            description="Try a different status filter."
            :actions="[{ label: 'Clear filter', color: 'neutral', variant: 'soft', onClick: () => activeStatus = 'all' }]"
            orientation="vertical"
          />
        </div>
        <TransitionGroup name="order-card" tag="div" class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          <OrderCard v-for="(order, i) in filteredOrders" :key="order.id" :order="order" :style="{ '--stagger': `${Math.min(i, 8) * 40}ms` }" class="anim-fade-up min-w-0" @view-receipt="openReceipt" @delete="handleDelete" @status-change="handleStatusChange" />
        </TransitionGroup>
      </div>
    </div>

    <ReceiptModal v-if="selectedCustomerReceipt && selectedOrder" :open="showReceipt" :customer-name="selectedCustomerReceipt.name" :items="selectedCustomerReceipt.items" :total="selectedCustomerReceipt.total" :is-split="selectedOrder.splitEqually" :split-total="selectedOrder.total" :date="selectedOrder.date" :order-id="selectedOrder.id" :status="selectedOrder.status" @close="closeReceipt" />

    <!-- Delete Order Modal -->
    <UModal :open="showDeleteModal" @close="showDeleteModal = false">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <div class="mx-auto w-11 h-11 rounded-full flex items-center justify-center bg-error/10">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-error" />
          </div>
          <div class="space-y-1">
            <p class="text-base font-semibold" style="color: var(--text-primary)">Delete this order?</p>
            <p class="text-sm" style="color: var(--text-muted)"> This action cannot be undone. The receipt will be removed permanently. </p>
          </div>
          <div class="flex gap-2 justify-center">
            <UButton color="neutral" variant="outline" @click="showDeleteModal = false"> Cancel </UButton>
            <UButton color="error" icon="i-heroicons-trash" @click="confirmDelete"> Delete </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Clear All Orders Modal -->
    <UModal :open="showClearAllModal" @close="showClearAllModal = false">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <div class="mx-auto w-11 h-11 rounded-full flex items-center justify-center bg-error/10">
            <UIcon name="i-heroicons-trash" class="w-6 h-6 text-error" />
          </div>
          <div class="space-y-1">
            <p class="text-base font-semibold" style="color: var(--text-primary)">Clear all orders?</p>
            <p class="text-sm" style="color: var(--text-muted)"> This will remove {{ ordersCount }} {{ ordersCount === 1 ? 'order' : 'orders' }} ({{ '₱' + totalRevenue.toFixed(2) }}) and cannot be undone. </p>
          </div>
          <div class="flex gap-2 justify-center">
            <UButton color="neutral" variant="outline" @click="showClearAllModal = false"> Cancel </UButton>
            <UButton color="error" icon="i-heroicons-trash" @click="confirmClearAll"> Clear all </UButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>