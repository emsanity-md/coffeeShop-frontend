export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface CustomerReceipt {
  id: string
  name: string
  items: import('./menu').CartItem[]
  total: number
}

export interface Order {
  id: string
  customers: CustomerReceipt[]
  total: number
  /** ISO 8601 */
  date: string
  splitEqually: boolean
  status: OrderStatus
}
