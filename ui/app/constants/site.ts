export const SITE = {
  name: 'Brewed',
  fullName: 'Brewed Coffee House',
  tagline: 'Point of sale, reimagined for the counter',
  description:
    'A warm, fast point-of-sale for coffee shops. Browse the menu, split a bill across customers, and track every order from pending to picked up.',
  /** Outbound analytics/referral params on Unsplash links. */
  utm: { utm_source: 'brewed-coffee-house', utm_medium: 'referral' },
} as const

export const NAV_LINKS = [
  { label: 'Menu', href: '#menu' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Orders', href: '#lifecycle' },
] as const

export const ROUTES = {
  landing: '/',
  pos: '/pos',
  orders: '/orders',
} as const
