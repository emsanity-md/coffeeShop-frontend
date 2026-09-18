<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Order, CustomerReceipt } from '~/composables/useOrders'
import type { CartItem } from '~/types/menu'

const props = defineProps<{ order: Order }>()

const emit = defineEmits<{
  (e: 'view-receipt', receipt: CustomerReceipt): void
  (e: 'delete', id: string): void
}>()

const showDeleteModal = ref(false)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function confirmDelete() {
  showDeleteModal.value = false
  emit('delete', props.order.id)
}

// Get all unique items across all customers
const allItems = computed((): CartItem[] => {
  const itemMap = new Map<number, CartItem>()
  const customers = props.order.customers ?? []
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
  <div class="rounded-xl p-4 flex flex-col gap-3 border"
    style="background: var(--bg-card); border-color: var(--border-color)">

    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span v-for="customer in order.customers ?? []" :key="customer.id" class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {{ customer.name }}
          </span>
          <span v-if="order.splitEqually" class="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
            Split equally
          </span>
        </div>
        <p class="text-xs mt-0.5" style="color: var(--text-muted)">
          {{ formatDate(order.date) }}
        </p>
      </div>
      <UButton
        size="xs"
        variant="ghost"
        color="error"
        icon="i-heroicons-trash"
        @click="showDeleteModal = true"
      />

    <!-- Delete Confirmation Modal -->
    <UModal :open="showDeleteModal" @close="showDeleteModal = false">
      <template #content>
        <div class="p-6 space-y-4 text-center">
          <p class="text-lg font-medium" style="color: var(--text-primary)">Delete this order?</p>
          <p class="text-sm" style="color: var(--text-muted)">
            This action cannot be undone.
          </p>
          <div class="flex gap-2 justify-center">
            <UButton color="neutral" variant="outline" @click="showDeleteModal = false">
              Cancel
            </UButton>
            <UButton color="error" @click="confirmDelete">
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
    </div>

    <div class="border-t border-dashed" style="border-color: var(--border-color)" />

    <!-- Items -->
    <div class="space-y-1 flex-1">
      <div
        v-for="item in allItems"
        :key="item.id"
        class="flex justify-between text-xs"
        style="color: var(--text-muted)"
      >
        <span class="truncate mr-2">{{ item.name }} <span class="opacity-60">× {{ item.qty }}</span></span>
        <span class="shrink-0">₱{{ (item.price * item.qty).toFixed(2) }}</span>
      </div>
    </div>

    <div class="border-t border-dashed" style="border-color: var(--border-color)" />

    <!-- Customers + Receipt buttons -->
    <div class="space-y-2">
      <p class="text-xs" style="color: var(--text-muted)">
        {{ order.splitEqually ? 'Split equally' : 'Individual totals' }} · Order total: ₱{{ order.total.toFixed(2) }}
      </p>
      <div class="flex flex-wrap gap-1">
        <UButton
          v-for="customer in order.customers ?? []"
          :key="customer.id"
          size="xs"
          variant="soft"
          color="primary"
          icon="i-heroicons-document-text"
          @click="$emit('view-receipt', customer)"
        >
          {{ customer.name }}
        </UButton>
      </div>
    </div>

  </div>
</template>