import { ref, computed } from 'vue'
import type { MenuItem } from '~/types/menu'

export function useCart(menu: MenuItem[]) {
  const cart = ref<Record<number, number>>({})

  function addToCart(id: number) {
    cart.value[id] = (cart.value[id] || 0) + 1
  }

  function changeQty(id: number, delta: number) {
    const next = (cart.value[id] || 0) + delta
    if (next <= 0) {
      const { [id]: _, ...rest } = cart.value
      cart.value = rest
    } else {
      cart.value[id] = next
    }
  }

  const cartItems = computed(() =>
    Object.entries(cart.value).map(([id, qty]) => ({
      ...menu.find(m => m.id === Number(id))!,
      qty
    }))
  )

  const cartCount = computed(() =>
    Object.values(cart.value).reduce((s, q) => s + q, 0)
  )

  const subtotal = computed(() =>
    cartItems.value.reduce((s, i) => s + i.price * i.qty, 0)
  )

  const tax = computed(() => subtotal.value * 0.12)
  const total = computed(() => subtotal.value + tax.value)

  return { cart, cartItems, cartCount, subtotal, tax, total, addToCart, changeQty }
}