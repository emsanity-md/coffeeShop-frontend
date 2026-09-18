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