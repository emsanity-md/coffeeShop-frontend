<script setup lang="ts">
import type { MenuItem } from '~/types/menu'
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
const { cartItems, cartCount, subtotal, tax, total, addToCart, changeQty } = useCart(menu)

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
    groups[item.cat].push(item)
  })
  return groups
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
    <MenuSidebar
      :categories="categories"
      :active-category="activeCategory"
      @update:active-category="activeCategory = $event"
    />
    <main class="flex-1 flex flex-col overflow-hidden">
      <MenuSearchBar v-model="search" />
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
      :subtotal="subtotal"
      :tax="tax"
      :total="total"
      @change-qty="changeQty"
    />
  </div>
</template>