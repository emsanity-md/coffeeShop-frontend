import { computed, watch } from 'vue'
import type { MenuItem } from '~/types/menu'

const CART_STORAGE_KEY = 'coffee_shop_cart'

function loadCart(): Record<number, number> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveCart(cart: Record<number, number>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function useCart(menu: MenuItem[]) {
  const cart = useState<Record<number, number>>(CART_STORAGE_KEY, () => ({}))

  if (import.meta.client) {
    const stored = loadCart()
    if (Object.keys(stored).length > 0 && Object.keys(cart.value).length === 0) {
      cart.value = stored
    }
  }

  watch(cart, (newCart) => {
    saveCart(newCart)
  }, { deep: true })

  function addToCart(id: number) {
    cart.value[id] = (cart.value[id] || 0) + 1
  }

  function changeQty(id: number, delta: number) {
    const next = (cart.value[id] || 0) + delta
    if (next <= 0) {
      removeFromCart(id)
    } else {
      cart.value[id] = next
    }
  }

  function removeFromCart(id: number) {
    const { [id]: _, ...rest } = cart.value
    cart.value = rest
  }

  function clearCart() {
    cart.value = {}
  }

  const cartItems = computed(() =>
    Object.entries(cart.value).map(([id, qty]) => {
      const menuItem = menu.find(m => m.id === Number(id))
      if (!menuItem) return null
      return { ...menuItem, qty }
    }).filter(Boolean) as (MenuItem & { qty: number })[]
  )

  const cartCount = computed(() =>
    Object.values(cart.value).reduce((s, q) => s + q, 0)
  )

  const total = computed(() => {
    return cartItems.value.reduce((s, i) => s + i.price * i.qty, 0)
  })

  return { cart, cartItems, cartCount, total, addToCart, changeQty, removeFromCart, clearCart }
}