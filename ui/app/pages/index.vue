<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem, Customer } from '~/types/menu'
import menuData from '~/data/menu.json'
import categoriesData from '~/data/categories.json'

const menu: MenuItem[] = menuData
const categories = categoriesData

const catLabels: Record<string, string> = {
  coffee: 'Coffee',
  tea: 'Tea',
  pastry: 'Pastries',
  cold: 'Cold drinks'
}

const search = ref('')
const activeCategory = ref('all')
const { cartItems, cartCount, total, addToCart, changeQty, removeFromCart, clearCart: clearCartItems } = useCart(menu)

function clearCart() {
  clearCartItems()
  customers.value = []
}

const customers = ref<Customer[]>([])
const nameInput = ref('')
const showNameModal = ref(true)
const editingCustomerId = ref<string | null>(null)

function openNameModal() {
  nameInput.value = ''
  editingCustomerId.value = null
  showNameModal.value = true
}

function addCustomer() {
  if (!nameInput.value.trim()) return
  if (editingCustomerId.value) {
    const customer = customers.value.find(c => c.id === editingCustomerId.value)
    if (customer) customer.name = nameInput.value.trim()
  } else {
    customers.value.push({
      id: crypto.randomUUID(),
      name: nameInput.value.trim(),
      items: [],
    })
  }
  nameInput.value = ''
  editingCustomerId.value = null
}

function editCustomer(customer: Customer) {
  nameInput.value = customer.name
  editingCustomerId.value = customer.id
  showNameModal.value = true
}

function removeCustomer(id: string) {
  customers.value = customers.value.filter(c => c.id !== id)
}

function confirmCustomers() {
  if (customers.value.length === 0) return
  showNameModal.value = false
}

const customerNames = computed(() => customers.value.map(c => c.name).join(', '))

const filteredMenu = computed(() => {
  let items = menu
  if (activeCategory.value !== 'all')
    items = items.filter(i => i.cat === activeCategory.value)
  if (search.value)
    items = items.filter(i =>
      i.name.toLowerCase().includes(search.value.toLowerCase()) ||
      i.desc.toLowerCase().includes(search.value.toLowerCase())
    )
  return items
})

const groupedMenu = computed(() => {
  if (activeCategory.value !== 'all') return null
  const groups: Record<string, MenuItem[]> = {}
  filteredMenu.value.forEach(item => {
    if (!groups[item.cat]) groups[item.cat] = []
    groups[item.cat]!.push(item)
  })
  return groups
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-(--bg-app) text-(--text-primary)">

    <!-- Customer name modal -->
    <UModal :open="showNameModal" :dismissible="true" @close="showNameModal = false">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium" style="color: var(--text-primary)">
              {{ editingCustomerId ? 'Edit customer' : 'Add customer' }}
            </p>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-x-mark"
              size="xs"
              @click="showNameModal = false"
            />
          </div>

          <UInput
            v-model="nameInput"
            placeholder="e.g. Juan dela Cruz"
            size="lg"
            class="w-full"
            autofocus
            @keyup.enter="addCustomer"
          />

          <div v-if="customers.length" class="space-y-2 max-h-40 overflow-y-auto border-t pt-3" style="border-color: var(--border-color)">
            <p class="text-xs font-medium" style="color: var(--text-muted)">Customers:</p>
            <div v-for="customer in customers" :key="customer.id" class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate flex-1">{{ customer.name }}</span>
              <div class="flex gap-1">
                <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-pencil" @click="editCustomer(customer)" />
                <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-trash" @click="removeCustomer(customer.id)" />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton block color="primary" :disabled="!nameInput.trim() && !editingCustomerId" @click="addCustomer">
              {{ editingCustomerId ? 'Save' : 'Add' }}
            </UButton>
            <UButton v-if="customers.length" block color="neutral" variant="outline" @click="confirmCustomers">
              Done
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <MenuSidebar
      :categories="categories"
      :active-category="activeCategory"
      @update:active-category="activeCategory = $event"
    />
    <main class="flex-1 flex flex-col overflow-hidden">
      <MenuSearchBar
        v-model="search"
        @open-name-modal="openNameModal"
      />
      <MenuGrid
        :items="filteredMenu"
        :grouped-items="groupedMenu"
        :cat-labels="catLabels"
        @add="addToCart"
      />
    </main>
    <CartPanel
      :cart-items="cartItems"
      :cart-count="cartCount"
      :total="total"
      :customers="customers"
      @change-qty="changeQty"
      @remove="removeFromCart"
      @clear-cart="clearCart"
    />
  </div>
</template>