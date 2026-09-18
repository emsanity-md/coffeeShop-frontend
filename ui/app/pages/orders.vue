<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders } from '~/composables/useOrders'
import ReceiptModal from '~/components/ReceiptModal.vue'
import type { Order, CustomerReceipt } from '~/composables/useOrders'

const router = useRouter()
const { orders, deleteOrder, clearOrders } = useOrders()

const showReceipt = ref(false)
const selectedCustomerReceipt = ref<CustomerReceipt | null>(null)
const showDeleteModal = ref(false)
const deleteOrderId = ref<string | null>(null)
const showClearAllModal = ref(false)

const selectedOrderTotal = computed(() => {
  if (!selectedCustomerReceipt.value) return 0
  const order = orders.value.find(o => o.customers.some(c => c.id === selectedCustomerReceipt.value!.id))
  return order?.total ?? selectedCustomerReceipt.value.total
})

function goBack() {
  router.push('/')
}

function openReceipt(customerReceipt: CustomerReceipt) {
  selectedCustomerReceipt.value = customerReceipt
  showReceipt.value = true
}

function closeReceipt() {
  showReceipt.value = false
  selectedCustomerReceipt.value = null
}

function handleDelete(id: string) {
  deleteOrderId.value = id
  showDeleteModal.value = true
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
  <div class="min-h-screen" style="background: var(--bg-app); color: var(--text-primary)">

    <!-- Header -->
    <div class="sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between gap-2" style="background: var(--bg-topbar); border-color: var(--border-color)">
      <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-left" size="sm" aria-label="Back to menu" @click="goBack" />
      <h1 class="text-base font-bold flex-1 text-center">Orders</h1>
      <UButton v-if="orders.length" color="neutral" variant="soft" size="sm" icon="i-heroicons-trash" @click="handleClearAll"> Clear All </UButton>
    </div>

    <!-- Content -->
    <div class="p-4 max-w-6xl mx-auto">
      <div v-if="!orders.length" class="text-center py-24 text-sm" style="color: var(--text-muted)">
        <p class="font-medium mb-1">No orders yet</p>
        <p>Orders will appear here after placing them</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <OrderCard v-for="order in orders" :key="order.id" :order="order" @view-receipt="openReceipt" @delete="handleDelete" />
      </div>
    </div>

    <ReceiptModal v-if="selectedCustomerReceipt" :open="showReceipt" :customer-name="selectedCustomerReceipt.name" :items="selectedCustomerReceipt.items" :total="selectedCustomerReceipt.total" :is-split="true" :split-total="selectedOrderTotal" @close="closeReceipt" />

    <!-- Delete Order Modal -->
    <UModal :open="showDeleteModal" @close="showDeleteModal = false">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <p class="text-lg font-medium" style="color: var(--text-primary)">Delete this order?</p>
          <p class="text-sm" style="color: var(--text-muted)"> This action cannot be undone. </p>
          <div class="flex gap-2 justify-center">
            <UButton color="neutral" variant="outline" @click="showDeleteModal = false"> Cancel </UButton>
            <UButton color="error" @click="confirmDelete"> Delete </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Clear All Orders Modal -->
    <UModal :open="showClearAllModal" @close="showClearAllModal = false">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <p class="text-lg font-medium" style="color: var(--text-primary)">Clear all orders?</p>
          <p class="text-sm" style="color: var(--text-muted)"> This action cannot be undone. </p>
          <div class="flex gap-2 justify-center">
            <UButton color="neutral" variant="outline" @click="showClearAllModal = false"> Cancel </UButton>
            <UButton color="error" @click="confirmClearAll"> Clear All </UButton>
          </div>
        </div>
      </template>
    </UModal>

  </div>
</template>