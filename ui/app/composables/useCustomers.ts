import { computed, ref } from 'vue'
import type { Customer, CartItem } from '~/types/menu'
import type { CustomerReceipt } from '~/types/order'
import { splitTotalEqually } from '~/utils'

/**
 * Customers on the current order, and the equal-split receipts derived from
 * them.
 *
 * This was previously local state inside pages/index.vue, which meant
 * CartPanel could only receive the raw list and had to recompute the split
 * itself. Owning it here keeps the cent-rounding rule in exactly one place.
 *
 * Not persisted: a customer only exists for as long as the order is being built.
 */
export function useCustomers() {
  const customers = ref<Customer[]>([])

  const count = computed(() => customers.value.length)

  function isDuplicateName(name: string, exceptId?: string | null) {
    const needle = name.trim().toLowerCase()
    return customers.value.some(c => c.name.toLowerCase() === needle && c.id !== exceptId)
  }

  /**
   * Adds a customer, or renames the one currently being edited.
   * Returns false when the name is blank or already taken.
   */
  function save(name: string, editingId: string | null = null): boolean {
    const trimmed = name.trim()
    if (!trimmed) return false
    if (isDuplicateName(trimmed, editingId)) return false

    if (editingId) {
      const existing = customers.value.find(c => c.id === editingId)
      if (existing) existing.name = trimmed
    } else {
      customers.value.push({ id: crypto.randomUUID(), name: trimmed, items: [] })
    }
    return true
  }

  function remove(id: string) {
    customers.value = customers.value.filter(c => c.id !== id)
  }

  function clear() {
    customers.value = []
  }

  /**
   * One receipt per customer, each carrying a copy of the whole cart (the split
   * is on the money, not the items) and an equal share of the total.
   */
  function buildReceipts(cartItems: CartItem[], total: number): CustomerReceipt[] {
    if (!customers.value.length) return []
    const shares = splitTotalEqually(total, customers.value.length)
    return customers.value.map((c, index) => ({
      id: c.id,
      name: c.name,
      items: cartItems.map(i => ({ ...i })),
      total: shares[index] ?? 0,
    }))
  }

  const names = computed(() => customers.value.map(c => c.name).join(', '))

  return { customers, count, names, save, remove, clear, buildReceipts, isDuplicateName }
}
