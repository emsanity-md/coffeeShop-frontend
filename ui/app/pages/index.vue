<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MenuItem, Customer } from '~/types/menu'
import menuData from '~/data/menu.json'
import categoriesData from '~/data/categories.json'

const DISCLAIMER_STORAGE_KEY = 'coffee_shop_disclaimer_dismissed'

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
const showDisclaimerModal = ref(false)

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

function dismissDisclaimer() {
  showDisclaimerModal.value = false
}

function dismissDisclaimerPermanently() {
  if (import.meta.client) {
    try { localStorage.setItem(DISCLAIMER_STORAGE_KEY, '1') } catch {}
  }
  showDisclaimerModal.value = false
}

function openDisclaimerModal() {
  showDisclaimerModal.value = true
}

onMounted(() => {
  if (import.meta.client) {
    try {
      const dismissed = localStorage.getItem(DISCLAIMER_STORAGE_KEY)
      if (!dismissed) showDisclaimerModal.value = true
    } catch {
      showDisclaimerModal.value = true
    }
  }
})
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

    <!-- Prototype disclaimer — no real data collected -->
    <UModal :open="showDisclaimerModal" :dismissible="true" @close="dismissDisclaimer">
      <template #content>
        <div class="p-4 sm:p-6 space-y-4 max-w-full">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-primary" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold leading-tight" style="color: var(--text-primary)">Prototype — No real data will be collected</p>
                <p class="text-xs" style="color: var(--text-muted)">Demo & UI preview only</p>
              </div>
            </div>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-x-mark"
              size="xs"
              aria-label="Close disclaimer"
              @click="dismissDisclaimer"
            />
          </div>

          <div class="rounded-lg border p-3 sm:p-4 space-y-3" style="background: var(--bg-soft); border-color: var(--border-color)">
            <div class="flex gap-2.5">
              <UIcon name="i-heroicons-information-circle" class="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <p class="text-xs sm:text-sm leading-relaxed" style="color: var(--text-primary)">
                This is a <span class="font-semibold">prototype</span> build. No real personal or payment data is collected, stored, or transmitted to any server.
              </p>
            </div>
            <ul class="space-y-1.5 text-xs sm:text-sm list-disc pl-5" style="color: var(--text-muted)">
              <li><span class="font-medium" style="color: var(--text-primary)">Local only:</span> Cart, customer names, and orders are saved only in your browser's <code class="px-1 py-0.5 rounded text-xs" style="background: var(--bg-app); border: 1px solid var(--border-color)">localStorage</code> and never sent anywhere.</li>
              <li><span class="font-medium" style="color: var(--text-primary)">No backend:</span> Menu and orders use static demo data. Prices and totals are mock values (₱).</li>
              <li><span class="font-medium" style="color: var(--text-primary)">No tracking:</span> No analytics, cookies, or third-party tracking in this prototype. Clearing site data removes all demo orders.</li>
              <li>Use any placeholder names for testing — do not enter real personal information.</li>
            </ul>
            <p class="text-[11px] leading-relaxed" style="color: var(--text-faint)">
              Production would add a secure backend, encrypted storage, authentication, and a payment provider before handling real data. See README for the production roadmap.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-2">
            <UButton block color="primary" icon="i-heroicons-check" @click="dismissDisclaimer">
              I understand — continue to demo
            </UButton>
            <UButton block color="neutral" variant="outline" @click="dismissDisclaimerPermanently">
              Don't show again
            </UButton>
          </div>
          <p class="text-[11px] text-center" style="color: var(--text-faint)">
            You can reopen this notice anytime via the <span class="font-medium">Privacy notice</span> link at the bottom of the menu.
          </p>
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
      <div class="shrink-0 px-3 py-2 border-t flex items-center justify-center gap-2" style="background: var(--bg-topbar); border-color: var(--border-color)">
        <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 shrink-0" style="color: var(--text-faint)" />
        <p class="text-[11px] hidden sm:inline" style="color: var(--text-faint)">Prototype — No real data will be collected.</p>
        <p class="text-[11px] sm:hidden" style="color: var(--text-faint)">Prototype — demo only.</p>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          class="h-6 text-[11px] px-2"
          @click="openDisclaimerModal"
        >
          Privacy notice
        </UButton>
      </div>
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