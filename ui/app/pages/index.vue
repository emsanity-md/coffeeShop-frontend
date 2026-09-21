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
const showNameModal = ref(false)
const editingCustomerId = ref<string | null>(null)
const showMobileMenu = ref(false)
const showMobileCart = ref(false)

function openNameModal() {
  nameInput.value = ''
  editingCustomerId.value = null
  showNameModal.value = true
}

function addCustomer() {
  const trimmed = nameInput.value.trim()
  if (!trimmed) return
  const duplicate = customers.value.some(
    c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingCustomerId.value
  )
  if (duplicate) return
  if (editingCustomerId.value) {
    const customer = customers.value.find(c => c.id === editingCustomerId.value)
    if (customer) customer.name = trimmed
  } else {
    customers.value.push({
      id: crypto.randomUUID(),
      name: trimmed,
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

function handleCategorySelect(val: string) {
  activeCategory.value = val
  showMobileMenu.value = false
}
</script>

<template>
  <div class="flex h-[100dvh] h-screen overflow-hidden bg-(--bg-app) text-(--text-primary)">

    <!-- Customer name modal -->
    <UModal :open="showNameModal" :dismissible="true" @close="showNameModal = false">
      <template #content>
        <div class="p-4 sm:p-6 space-y-4 max-w-full">
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
              <span class="truncate flex-1 min-w-0">{{ customer.name }}</span>
              <div class="flex gap-1 shrink-0">
                <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-pencil" @click="editCustomer(customer)" />
                <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-trash" @click="removeCustomer(customer.id)" />
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton block color="primary" :disabled="!nameInput.trim()" @click="addCustomer">
              {{ editingCustomerId ? 'Save' : 'Add' }}
            </UButton>
            <UButton v-if="customers.length" block color="neutral" variant="outline" @click="confirmCustomers">
              Done
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Desktop sidebar -->
    <div class="hidden lg:flex shrink-0">
      <MenuSidebar
        :categories="categories"
        :active-category="activeCategory"
        @update:active-category="handleCategorySelect"
      />
    </div>

    <!-- Mobile menu drawer — Nuxt UI -->
    <UDrawer
      v-model:open="showMobileMenu"
      direction="left"
      :handle="false"
      :overlay="true"
      should-scale-background
      class="lg:hidden"
      :ui="{ content: 'w-[82%] max-w-[300px] p-0' }"
      title="Categories"
      description="Browse menu categories"
    >
      <template #content>
        <MenuSidebar
          :categories="categories"
          :active-category="activeCategory"
          show-close
          @update:active-category="handleCategorySelect"
          @close="showMobileMenu = false"
        />
      </template>
    </UDrawer>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <MenuSearchBar
        v-model="search"
        :cart-count="cartCount"
        @open-name-modal="openNameModal"
        @open-menu="showMobileMenu = true"
        @open-cart="showMobileCart = true"
      />
      <MenuGrid
        :items="filteredMenu"
        :grouped-items="groupedMenu"
        :cat-labels="catLabels"
        @add="addToCart"
      />
    </main>

    <!-- Desktop cart -->
    <div class="hidden lg:flex shrink-0">
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

    <!-- Mobile cart drawer — Nuxt UI -->
    <UDrawer
      v-model:open="showMobileCart"
      direction="right"
      :handle="false"
      :overlay="true"
      should-scale-background
      class="lg:hidden"
      :ui="{ content: 'w-[92%] max-w-[380px] p-0' }"
      title="Your order"
      description="Review cart and place order"
    >
      <template #content>
        <CartPanel
          data-drawer
          :cart-items="cartItems"
          :cart-count="cartCount"
          :total="total"
          :customers="customers"
          class="h-full"
          @change-qty="changeQty"
          @remove="removeFromCart"
          @clear-cart="() => { clearCart(); showMobileCart = false }"
          @close-drawer="showMobileCart = false"
        />
      </template>
    </UDrawer>
  </div>
</template>