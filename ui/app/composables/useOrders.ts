import { computed, watch } from 'vue'
import type { CartItem } from '~/types/menu'
import type { Order, OrderStatus, CustomerReceipt } from '~/types/order'
import { ORDER_STATUSES } from '~/constants/order-status'

export type { Order, OrderStatus, CustomerReceipt } from '~/types/order'
export { ORDER_STATUSES, STATUS_META, STATUS_FLOW, TERMINAL_STATUSES } from '~/constants/order-status'

const VALID_STATUSES = new Set<string>(ORDER_STATUSES)

function normalizeOrder(o: Omit<Order, 'status'> & Partial<Pick<Order, 'status'>>): Order {
  return {
    id: o.id,
    customers: o.customers ?? [],
    total: o.total ?? 0,
    date: o.date,
    splitEqually: o.splitEqually ?? false,
    status: o.status && VALID_STATUSES.has(o.status) ? o.status : 'pending',
  }
}

const STORAGE_KEY = 'coffee_shop_orders'

function loadOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeOrder)
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Quota exceeded or storage disabled (private mode) — the in-memory
    // session still works, it just won't survive a reload.
  }
}

export function useOrders() {
  const orders = useState<Order[]>(STORAGE_KEY, () => [])

  if (import.meta.client && orders.value.length === 0) {
    const stored = loadOrders()
    if (stored.length > 0) {
      orders.value = stored
    }
  }

  watch(orders, newOrders => {
    saveOrders(newOrders)
  }, { deep: true })

  function addOrder(customers: CustomerReceipt[], total: number, splitEqually: boolean) {
    const order: Order = {
      id: crypto.randomUUID(),
      customers: customers.map(c => ({ ...c, items: c.items.map(i => ({ ...i })) })),
      total,
      date: new Date().toISOString(),
      splitEqually,
      status: 'pending',
    }
    orders.value.unshift(order)
    saveOrders(orders.value)
    return order
  }

  function updateOrderStatus(id: string, status: OrderStatus) {
    if (!VALID_STATUSES.has(status)) return
    const order = orders.value.find(o => o.id === id)
    if (!order) return
    order.status = status
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

  /** Cancelled orders are excluded — they are not revenue. */
  const sortedOrders = computed(() =>
    [...orders.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))

  return { orders: sortedOrders, addOrder, updateOrderStatus, deleteOrder, clearOrders }
}
