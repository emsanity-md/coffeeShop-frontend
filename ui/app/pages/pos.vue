<script setup lang="ts">
/**
 * Point of sale.
 *
 * Layout: on `lg`+ this is a three-pane flex row locked to the viewport height,
 * each pane scrolling independently. Below that the cart and the category rail
 * move into sheets, and the menu grid takes the full width.
 */
import { computed, onMounted, ref } from 'vue'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '~/components/ui/sheet'
import type { CartItem, Category, MenuItem } from '~/types/menu'
import type { CustomerReceipt, OrderStatus } from '~/types/order'
import menuData from '~/data/menu.json'
import categoriesData from '~/data/categories.json'
import { SITE } from '~/constants/site'

definePageMeta({ layout: 'pos' })

const NOTICE_KEY = 'coffee_shop_disclaimer_dismissed'

const menu = menuData as MenuItem[]
const categories = categoriesData as Category[]

const search = ref('')
const activeCategory = ref('all')
const { cartItems, cartCount, total, addToCart, changeQty, removeFromCart, clearCart: clearCartItems } = useCart(menu)
const { customers, count: customerCount, save: saveCustomer, remove: removeCustomer, clear: clearCustomers, buildReceipts } = useCustomers()
const { addOrder } = useOrders()

// --- Local UI state --------------------------------------------------------
const showCategorySheet = ref(false)
const showCartSheet = ref(false)
const showCustomers = ref(false)
const showNotice = ref(false)

const receipt = ref<{
  name: string
  items: CartItem[]
  total: number
  isSplit: boolean
  splitTotal: number
  date?: string
  orderId?: string
  status?: OrderStatus
} | null>(null)

const receipts = computed(() => buildReceipts(cartItems.value, total.value))
const canPlaceOrder = computed(() => cartItems.value.length > 0 && customerCount.value > 0)

/** Labels come from categories.json — the old page kept a second copy. */
const catLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(categories.map(c => [c.key, c.label])))

const filteredMenu = computed(() => {
  let items = menu
  if (activeCategory.value !== 'all') {
    items = items.filter(i => i.cat === activeCategory.value)
  }
  const needle = search.value.trim().toLowerCase()
  if (needle) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(needle) || i.desc.toLowerCase().includes(needle))
  }
  return items
})

/** Grouped only when browsing everything, so a filtered view stays one list. */
const groupedMenu = computed(() => {
  if (activeCategory.value !== 'all') return null
  const groups: Record<string, MenuItem[]> = {}
  for (const item of filteredMenu.value) {
    ;(groups[item.cat] ??= []).push(item)
  }
  return groups
})

// --- Actions ---------------------------------------------------------------

function clearCart() {
  clearCartItems()
  clearCustomers()
  receipt.value = null
}

function placeOrder() {
  if (!canPlaceOrder.value) return
  const built = buildReceipts(cartItems.value, total.value)
  if (!built.length) return

  const isSplit = customerCount.value > 1
  const order = addOrder(built, total.value, isSplit)

  const first = built[0]
  if (first) {
    receipt.value = {
      name: first.name,
      items: first.items,
      total: first.total,
      isSplit,
      splitTotal: order.total,
      date: order.date,
      orderId: order.id,
      status: order.status,
    }
  }

  clearCartItems()
  clearCustomers()
  showCartSheet.value = false
}

function viewReceipt(r: CustomerReceipt) {
  receipt.value = {
    name: r.name,
    items: r.items,
    total: r.total,
    isSplit: customerCount.value > 1,
    splitTotal: total.value,
  }
}

function clearFilters() {
  search.value = ''
  activeCategory.value = 'all'
}

function onSaveCustomer(name: string, editingId: string | null) {
  saveCustomer(name, editingId)
}

function dismissNotice(forever: boolean) {
  showNotice.value = false
  if (!forever) return
  try { localStorage.setItem(NOTICE_KEY, '1') } catch { /* storage unavailable */ }
}

onMounted(() => {
  try {
    if (!localStorage.getItem(NOTICE_KEY)) showNotice.value = true
  } catch {
    showNotice.value = true
  }
})

useSeoMeta({ title: `POS · ${SITE.fullName}`, description: 'Build a coffee order, split the bill, and check out.' })
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <PosHeader
      v-model:search="search"
      :cart-count="cartCount"
      :customer-count="customerCount"
      @open-categories="showCategorySheet = true"
      @open-cart="showCartSheet = true"
      @open-customers="showCustomers = true"
    />

    <div class="flex min-h-0 flex-1">
      <!-- Category rail, lg+ only -->
      <div class="hidden shrink-0 lg:block">
        <MenuSidebar
          :categories="categories"
          :active-category="activeCategory"
          @update:active-category="activeCategory = $event"
          @open-notice="showNotice = true"
        />
      </div>

      <!-- Menu canvas -->
      <main class="flex min-w-0 flex-1 flex-col">
        <!-- Category pills below lg, where the rail is a sheet. -->
        <div class="shrink-0 overflow-x-auto border-b border-border px-3 py-2 no-scrollbar lg:hidden">
          <PillNav
            v-model="activeCategory"
            :options="categories.map(c => ({ value: c.key, label: c.label }))"
            aria-label="Filter by category"
          />
        </div>

        <MenuGrid
          :items="filteredMenu"
          :grouped-items="groupedMenu"
          :cat-labels="catLabels"
          :search="search"
          @add="addToCart"
          @clear-filters="clearFilters"
        />

        <div class="flex shrink-0 items-center justify-center gap-2 border-t border-border bg-card/60 px-3 py-1.5">
          <p class="truncate text-label text-muted-foreground">
            Prototype — nothing leaves your browser.
          </p>
          <button
            type="button"
            class="shrink-0 text-label text-muted-foreground underline underline-offset-2 hover:text-foreground"
            @click="showNotice = true"
          >Privacy notice</button>
        </div>
      </main>

      <!-- Cart, lg+ only -->
      <div class="hidden shrink-0 lg:block">
        <CartPanel
          :cart-items="cartItems"
          :cart-count="cartCount"
          :total="total"
          :customers="customers"
          :receipts="receipts"
          :can-place-order="canPlaceOrder"
          @change-qty="changeQty"
          @remove="removeFromCart"
          @clear-cart="clearCart"
          @place-order="placeOrder"
          @view-receipt="viewReceipt"
        />
      </div>
    </div>

    <!-- Mobile category sheet -->
    <Sheet v-model:open="showCategorySheet">
      <SheetContent side="left" class="w-[85%] max-w-[19rem] p-0">
        <SheetHeader class="sr-only">
          <SheetTitle>Categories</SheetTitle>
          <SheetDescription>Browse menu categories</SheetDescription>
        </SheetHeader>
        <MenuSidebar
          :categories="categories"
          :active-category="activeCategory"
          show-close
          @update:active-category="activeCategory = $event; showCategorySheet = false"
          @close="showCategorySheet = false"
          @open-notice="showCategorySheet = false; showNotice = true"
        />
      </SheetContent>
    </Sheet>

    <!-- Mobile cart sheet -->
    <Sheet v-model:open="showCartSheet">
      <SheetContent side="right" class="w-[92%] max-w-[24rem] p-0">
        <SheetHeader class="sr-only">
          <SheetTitle>Your order</SheetTitle>
          <SheetDescription>Review the cart and place the order</SheetDescription>
        </SheetHeader>
        <CartPanel
          in-sheet
          :cart-items="cartItems"
          :cart-count="cartCount"
          :total="total"
          :customers="customers"
          :receipts="receipts"
          :can-place-order="canPlaceOrder"
          @change-qty="changeQty"
          @remove="removeFromCart"
          @clear-cart="clearCart"
          @place-order="placeOrder"
          @view-receipt="viewReceipt"
          @close-sheet="showCartSheet = false"
        />
      </SheetContent>
    </Sheet>

    <CustomersDialog
      v-model:open="showCustomers"
      :customers="customers"
      @save="onSaveCustomer"
      @remove="removeCustomer"
    />

    <PrototypeNoticeDialog v-model:open="showNotice" @dismiss="dismissNotice" />

    <ReceiptDialog
      v-if="receipt"
      :open="!!receipt"
      :customer-name="receipt.name"
      :items="receipt.items"
      :total="receipt.total"
      :is-split="receipt.isSplit"
      :split-total="receipt.splitTotal"
      :date="receipt.date"
      :order-id="receipt.orderId"
      :status="receipt.status"
      @close="receipt = null"
    />
  </div>
</template>
