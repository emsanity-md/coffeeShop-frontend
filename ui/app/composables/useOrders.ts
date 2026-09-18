import { ref, computed } from 'vue'
import type { CartItem } from '~/types/menu'

export interface CustomerReceipt {
  id: string
  name: string
  items: CartItem[]
  total: number
}

export interface Order {
  id: string
  customers: CustomerReceipt[]
  total: number
  date: string
  splitEqually: boolean
}

const STORAGE_KEY = 'coffee_shop_orders'

function loadOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export function useOrders() {
  const orders = ref<Order[]>(loadOrders())

  function addOrder(customers: CustomerReceipt[], total: number, splitEqually: boolean) {
    const order: Order = {
      id: crypto.randomUUID(),
      customers: customers.map(c => ({ ...c, items: c.items.map(i => ({ ...i })) })),
      total,
      date: new Date().toISOString(),
      splitEqually,
    }
    orders.value.unshift(order)
    saveOrders(orders.value)
  }

  function deleteOrder(id: string) {
    orders.value = orders.value.filter(o => o.id !== id)
    saveOrders(orders.value)
  }

  function clearOrders() {
    orders.value = []
    saveOrders(orders.value)
  }

  const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )

  return { orders: sortedOrders, addOrder, deleteOrder, clearOrders }
}