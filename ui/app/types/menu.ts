export interface MenuItem {
  id: number
  name: string
  desc: string
  price: number
  cat: string
  icon: string
  image?: string
}

export interface CartItem extends MenuItem {
  qty: number
}

export interface Customer {
  id: string
  name: string
  items: number[]  // menu item IDs assigned to this customer
}

export interface SplitOrder {
  customers: Customer[]
  splitEqually: boolean
}