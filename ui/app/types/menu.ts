export interface MenuItem {
  id: number
  name: string
  desc: string
  price: number
  cat: string
  icon: string
  /** Key into `PHOTOS` (app/data/photos.ts) — not a URL. See PhotoKey. */
  image?: string
}

export interface CartItem extends MenuItem {
  qty: number
}

export interface Customer {
  id: string
  name: string
  /** Reserved for per-customer item assignment; equal-split builds receipts
   *  from the whole cart instead. Kept so the type matches stored data. */
  items: number[]
}

export interface Category {
  key: string
  label: string
}
