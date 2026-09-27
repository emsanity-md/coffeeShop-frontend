# Brewed Coffee House

> [!WARNING]
> **Prototype Status:** This project is a **prototype / proof-of-concept**. It is **NOT production-ready** out of the box. Data is stored in `localStorage`, there is no backend, no authentication, no tests, and no CI/CD. See [Production Readiness](#-production-readiness-roadmap) for what is required before production use.
>
> Do **not** deploy this prototype with real customer or payment data.

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.5-00DC82?logo=nuxt)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)](https://vuejs.org)
[![shadcn-vue](https://img.shields.io/badge/shadcn--vue-2.8-111827)](https://www.shadcn-vue.com)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![motion-v](https://img.shields.io/badge/motion--v-2.4-0055FF)](https://motion.dev)
[![Geist](https://img.shields.io/badge/Geist-000000)](https://vercel.com/font)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Status](https://img.shields.io/badge/status-prototype-orange)](#-prototype-disclaimer)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)

A responsive Point-of-Sale (POS) / ordering UI for a coffee shop, with a marketing
landing page. Browse the menu, search and filter, manage a cart, split orders
across multiple customers, and track the order lifecycle.

Built with **Nuxt 4 + Vue 3 + shadcn-vue + motion-v + Tailwind CSS 4 + Geist**.

---

## Table of Contents

- [Prototype Disclaimer](#-prototype-disclaimer)
- [Routes](#-routes)
- [Demo & Features](#-features-current-prototype)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Images & Credits](#-images--credits)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Architecture Notes](#-architecture-notes-prototype)
- [Production Readiness Roadmap](#-production-readiness-roadmap)
- [Deployment](#-deployment)
- [Quality, Security & Operations](#-quality-security--operations)
- [Known Limitations](#-known-limitations--gaps)
- [Contributing](#-contributing)
- [License](#-license)

---

## ⚠️ Prototype Disclaimer

This repository is a **frontend-only prototype** intended for UI/UX validation and stakeholder demo:

| Aspect | Prototype Reality | Production Requirement |
|---|---|---|
| **Persistence** | `localStorage` (`coffee_shop_cart`, `coffee_shop_orders`, `coffee_shop_disclaimer_dismissed`) | Backend API + database (Postgres/MySQL) |
| **Auth** | None | Auth (Nuxt Auth / Auth.js, JWT, RBAC for staff/admin) |
| **Payments** | No payment flow, mock totals in PHP (₱) | Payment gateway (Stripe/PayMongo/GCash) + server-side price verification |
| **Data Source** | Static JSON (`app/data/menu.json`, `categories.json`) | CMS / Admin API |
| **Validation** | Client-side only | Client + server validation (Zod) |
| **Testing** | None | Unit + component + e2e |
| **Observability** | None | Logging, error tracking, analytics |
| **Deployment** | `nuxt dev` / `nuxt build` locally | Hardened build, CI/CD, env management |

**Do not use for real transactions** until the checklist in [Production Readiness Roadmap](#-production-readiness-roadmap) is completed.

---

## 🧭 Routes

| Route | Page | Layout | Purpose |
|---|---|---|---|
| `/` | `pages/index.vue` | `landing` | Marketing landing page: hero, features, live menu preview, lifecycle explainer |
| `/pos` | `pages/pos.vue` | `pos` | The point of sale. Three-pane, viewport-locked |
| `/orders` | `pages/orders.vue` | `pos` | Order history, status filters, revenue KPIs |

Layouts are chosen per page with `definePageMeta({ layout: '...' })`. There is deliberately
no `default.vue` — an unset layout renders bare, which is a bug we hit and don't want back.

---

## ✨ Features

**Landing (`/`)**
- Hero with photo cluster, a floating order-card preview, and checkable product facts
- Bento feature grid, **rendered from the same `menu.json` the POS uses** so it can't go stale
- Order-lifecycle explainer driven by the real status machine
- Image credits with referral links

**Point of sale (`/pos`)**
- Category rail (desktop) / `PillNav` + sheet (mobile), plus search across name and description
- Grouped grid that collapses to one list when a category or search is active
- Cart: add, change quantity, remove, clear; persisted to `localStorage`
- Multi-customer: add / edit / remove, duplicate-name guard, **cent-accurate equal split**
- Per-customer receipts, thermal-printer print path
- Prototype privacy notice on first entry, dismissible permanently

**Orders (`/orders`)**
- Revenue / count / in-progress KPIs with count-up animation
- Status filter pills, per-status counts
- Status transitions: `pending → preparing → ready → completed`, plus cancel and reopen
- Per-customer receipt viewer, delete and clear-all with confirmation

**Cross-cutting**
- Dark & light themes, both contrast-checked, no flash on load
- Responsive from 320px up; `100dvh` tool layout so the cart can't be scrolled away
- Full keyboard support; `prefers-reduced-motion` respected globally
- Self-hosted, optimized imagery

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Nuxt 4.5](https://nuxt.com) — file-based routing, auto-imports, `useState` |
| UI runtime | [Vue 3.5](https://vuejs.org), SSR via Nitro |
| Components | [shadcn-vue 2.8](https://www.shadcn-vue.com) on [reka-ui 2.10](https://reka-ui.com) (Radix's official Vue successor) |
| Animation | [motion-v 2.4](https://motion.dev) — Framer Motion's Vue port |
| Styling | [Tailwind CSS 4.3](https://tailwindcss.com) via `@tailwindcss/vite` |
| Typography | [Geist](https://vercel.com/font) + Geist Mono, self-hosted via `@fontsource-variable` |
| Icons | [Lucide](https://lucide.dev) (`@lucide/vue`); shadcn internals use `@radix-icons/vue` |
| Images | [`@nuxt/image`](https://image.nuxt.com) (ipx → AVIF/WebP) over committed WebP masters |
| Language | TypeScript 5.9 (strict via Nuxt tsconfigs) |
| State | `useState` + `localStorage` sync (`useCart`, `useOrders`, `useCustomers`) |
| Toasts | `vue-sonner` |
| Build | Vite, Nitro |

> **A note on the library choice.** The original brief asked for **shadcn/ui** and **React Bits**.
> Both are React-only, and this app is Vue. They were replaced with their official Vue
> equivalents — **shadcn-vue** (same component API, same `components.json`, same theming model)
> and **motion-v** (the Framer Motion port), with the React Bits effects reimplemented as Vue
> components in `app/components/motion/`. Visual output and ergonomics are equivalent; the
> packages are not literally the React ones.

> Node: Nuxt 4 requires **Node 22.19+** (see `engines` in `package.json`).

---

## 🎨 Design System

### Colour

A warm coffeehouse identity mapped onto shadcn's token model so the primitives work unmodified.
Light = warm cream, dark = espresso, accent = amber.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--background` | `#0f0d0b` | `#f5f0eb` | Page |
| `--card` | `#1a1612` | `#ffffff` | Cards, panels, header |
| `--card-foreground` | `#e8ddd0` | `#1a1210` | Card text |
| `--muted-foreground` | `#a89880` | `#6b5e54` | Secondary text (5.5–6.9:1) |
| `--primary` | `#c9a96e` | `#88602f` | **Brand accent** |
| `--muted` | `#211b15` | `#f0e9e1` | Subtle fills |
| `--border` | `#2e2820` | `#e2d9d0` | Lines |
| `--destructive` | `#e5484d` | `#c5302f` | Destructive / cancelled |
| `--radius` | `0.625rem` | `0.625rem` | Corner radius |

Order lifecycle has its own ramp: `--status-pending`, `--status-preparing`, `--status-ready`,
`--status-completed`, `--status-cancelled`, consumed by `constants/order-status.ts`.

> **Naming trap:** shadcn reserves `--accent` for a subtle *hover fill*. The amber the old
> stylesheet called `--accent` is now `--primary`. Never reach for `--accent` expecting the brand colour.

**Two accessibility fixes went in during the redesign:**
1. The old `--text-faint` (`#5a4e44` on `#0f0d0b`) sat at **~2.4:1** and was used on a lot of
   11px text. It's folded into `--muted-foreground` (5.5–6.9:1) and no longer exists.
2. Light-mode `--primary` was darkened from `#9a6f3a` to `#88602f`. The original landed at
   **4.47:1** on white — just under the 4.5:1 AA threshold. The hue is unchanged.

### Typography

Geist Sans for UI, **Geist Mono for every currency figure, quantity and order ID**. Three weights
maximum (400/500/600), no letter-spacing on body copy, `tabular-nums` on all numerics.

| Role | Class | Size / line | Weight | Family |
|---|---|---|---|---|
| Brand wordmark | `text-card` / `text-title` | 14/20 · 20/28 | 600 | Sans, −0.01em |
| Page title | `text-title` → `text-display` | 20/28 → 24/32 | 600 | Sans, −0.02em |
| Section heading | `text-section` | 15/22 | 600 | Sans |
| Card title / item name | `text-card` | 14/20 | 500 | Sans |
| Body | `text-body` | 13/18 | 400 | Sans |
| Meta / caption | `text-meta` | 12/16 | 400 | Sans |
| Micro label | `text-label` | 11/14 | 500 | Sans, `0.06em` uppercase |
| Price / qty / total | `font-mono` + `tnum` | inherits | 500–600 | **Mono** |

These are declared once in `app/assets/css/theme.css` under `@theme inline`, so the scale can't
drift between screens.

### Motion

`app/assets/css/motion.css` holds the canonical values; `app/composables/useMotionPreset.ts`
mirrors them for JS so CSS and motion-v animations stay in lockstep.

| Token | Value | Use |
|---|---|---|
| `--ease-warm` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default UI ease |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Taps, pops |
| `--dur-fast` | `150ms` | Hover, press |
| `--dur-med` | `280ms` | Entrances, transitions |
| `--dur-slow` / `--dur-slower` | `480ms` / `700ms` | Page and hero reveals |

`app/components/motion/` re-implements the React Bits patterns that earn their place here:

| Component | Pattern | Used in |
|---|---|---|
| `StaggerList` / `StaggerItem` | Animated List | menu grid, order grid, KPIs, landing |
| `NumberTicker` | Counter | cart count, revenue, KPIs |
| `LetterPullup` | Letter Pullup | receipt total |
| `BlurText` | Blur Text | landing hero, page titles |
| `SpotlightCard` | Spotlight | menu cards |
| `PillNav` | Pill Nav | category + status filters |
| `ShimmerBlock` | Shimmer | image skeletons |
| `ShinyText` | Shiny Text | brand wordmark (marketing only) |
| `StatusStepper` | Stepper | order lifecycle, POS + landing |
| `RevealOnScroll` | Scroll reveal | every landing section |

Deliberately **excluded**: particles, glitch, magnetic buttons, marquee, scroll-velocity. A POS
is used all day and those are distracting. A global `prefers-reduced-motion` guard in
`motion.css` stops everything decorative, and `useReducedMotion()` handles the JS side.

---

## 🖼 Images & Credits

All menu and landing imagery is **committed to the repository** and served through
`@nuxt/image` (AVIF/WebP, responsive `sizes`). Nothing is hotlinked, so the POS renders
identically offline and never waits on a third-party CDN.

**18 images, ~1.2 MB total** — replacing the previous 4 MB of unoptimised PNG for just 5 photos.
The old set also had a `flat white.png` (whitespace) and `Capuccino.png` (case) that would break
on a case-sensitive host; all filenames are now kebab-case.

### Sourcing ladder

Each image walks down these tiers independently — one failure doesn't block the batch.

| Tier | Source | Licence | Key |
|---|---|---|---|
| 1 | Unsplash | Unsplash License (attribution required via API) | — |
| 2 | Pexels / Pixabay | Commercial OK, no attribution | — |
| 3 | Openverse / Wikimedia / StockCake | CC0 / PD / CC-BY | — |
| 4 | **Generated SVG tile** | ours | Always works, no network |

> Unsplash and Pexels block unauthenticated programmatic access, so automated harvesting from
> them isn't possible here. The current set was reached at **tier 3** via the **Openverse API**,
> which returns real URLs plus author and licence metadata. Everything resolved to **CC0**
> StockSnap and rawpixel photography.

Per image, the pipeline accepts a candidate only if it returns HTTP 200, a real `image/*`
content type, a sane byte size, the right aspect ratio, **and the subject actually matches the
item**. That last one is a human judgement call — the first pass over Openverse returned a
photo of a *printer instruction card* for "espresso" and a *Starbucks cup* for "cappuccino",
both discarded.

> **Rule: never ship a photo that might be the wrong drink.** A mislabelled flat white is a
> correctness bug, not a polish gap.

### Adding or swapping a photo

```bash
# 1. edit app/data/photo-sources.json — url, licence, author, page
# 2. rebuild the assets and regenerate the manifest
npm run photos:fetch
# 3. verify the manifest, the files and the attribution agree
npm run photos:check
```

`app/data/photos.ts` is **generated** — edit `photo-sources.json`, not the output.
The landing footer credits are rendered from the same manifest, so attribution cannot drift
from the assets actually in the bundle. Third-party entries are credited with `utm` referral
links; `generated` entries correctly render no credit line.

---

## 📁 Project Structure

```
ui/
├── app/
│   ├── app.vue                     # TooltipProvider, theme no-flash script, Toaster
│   ├── assets/css/
│   │   ├── main.css                # imports + base layer + component utilities
│   │   ├── theme.css               # colour tokens, type scale, radius, elevation
│   │   └── motion.css              # motion tokens, keyframes, reduced-motion guard
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn-vue primitives — CLI-MANAGED, don't hand-edit
│   │   │   └── <name>/{Component.vue,index.ts}   (25 groups)
│   │   ├── motion/                 # React Bits patterns via motion-v
│   │   ├── layout/                 # SiteNav, SiteFooter, SiteBrand, PosHeader, ThemeToggle
│   │   ├── landing/                # Hero, FeaturesBento, MenuShowcase, HowItWorks, …
│   │   ├── menu/                   # MenuCard, MenuGrid, MenuSidebar
│   │   ├── cart/                   # CartPanel, CartItem, CartFooter
│   │   ├── orders/                 # OrderCard, OrderKpis
│   │   ├── CustomersDialog.vue     # shared dialogs
│   │   ├── ReceiptDialog.vue
│   │   └── PrototypeNoticeDialog.vue
│   │
│   ├── composables/                # reactive state
│   │   ├── useCart.ts  useOrders.ts  useCustomers.ts
│   │   ├── useTheme.ts  useMotionPreset.ts
│   ├── constants/                  # static lookup tables
│   │   ├── order-status.ts         # STATUS_META, STATUS_FLOW
│   │   └── site.ts                 # brand, nav links, routes
│   ├── data/                       # content
│   │   ├── menu.json  categories.json
│   │   ├── photos.ts               # GENERATED manifest
│   │   └── photo-sources.json      # curated source of truth
│   ├── layouts/                    # landing.vue, pos.vue
│   ├── lib/                        # pure helpers (NOT auto-imported)
│   │   ├── cva.ts  currency.ts  date.ts
│   │   └── initials.ts  split.ts  receipt.ts
│   ├── pages/                      # index.vue (landing), pos.vue, orders.vue
│   ├── types/                      # menu.ts, order.ts, photo.ts
│   └── utils/index.ts              # auto-import surface; re-exports lib/
│
├── scripts/
│   ├── fetch-photos.mjs            # photo-sources.json → public/images + photos.ts
│   └── check-photos.mjs            # validates manifest, files, attribution, menu links
├── public/images/{menu,ambience}/
├── components.json                 # shadcn-vue config
└── nuxt.config.ts
```

### Conventions worth knowing

| Rule | Why |
|---|---|
| `components/ui/` is **shadcn-vue only**, never hand-edited | the CLI overwrites it; local edits break on the next `add` |
| Feature folders named after the **user-facing surface** | you can guess the folder from the screen |
| `constants/` ≠ `composables/` ≠ `lib/` | static tables vs reactive state vs pure functions |
| `types/` owns domain types | no more `Order` living inside a composable |
| Implementations in `lib/`, barrel in `utils/` | `utils/` is auto-scanned; `lib/` isn't, so each name registers once and `@/utils` still resolves for shadcn |
| No barrel files in `components/` | Nuxt auto-imports; barrels only add indirection |

### Key config

```ts
// ui/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['shadcn-nuxt', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  components: [
    // shadcn registers its own with an empty prefix; exclude it here so the
    // two scanners don't fight over a name.
    { path: '~/components', pathPrefix: false, ignore: ['**/ui/**'] },
  ],
  shadcn: { prefix: '', componentDir: '@/components/ui' },
  vite: { plugins: [tailwindcss()] },
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
})
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 22.19` (verify: `node -v`)
- `npm` / `pnpm` / `yarn` / `bun`

### Install & Run

```bash
cd ui
npm install        # or pnpm install / yarn / bun install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build (Nitro)
npm run preview    # preview the production build
npm run generate   # pre-render static
```

No environment variables are required for the prototype.

### Adding a shadcn component

```bash
npx shadcn-vue@latest add <component> --yes
```

It writes into `app/components/ui/` and registers automatically via the `shadcn-nuxt` module.
Don't edit anything in that folder by hand.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `nuxt dev` | Start dev server with HMR |
| `build` | `nuxt build` | Production build (Nitro) |
| `generate` | `nuxt generate` | Pre-render static site |
| `preview` | `nuxt preview` | Preview production build locally |
| `typecheck` | `nuxt typecheck` | `vue-tsc --noEmit` over the whole app |
| `photos:fetch` | `node scripts/fetch-photos.mjs` | Download, crop, encode and regenerate `photos.ts` |
| `photos:check` | `node scripts/check-photos.mjs` | Validate manifest ↔ disk ↔ attribution ↔ menu |
| `postinstall` | `nuxt prepare` | Generate `.nuxt` types |

---

## 🔧 Environment Variables

**Prototype:** none required — all data is local.

**Production:** create `ui/.env` (never commit). Example:

```bash
# .env.example — copy to .env and fill in
NUXT_PUBLIC_API_BASE=https://api.coffeeshop.example.com
NUXT_PUBLIC_APP_NAME=CoffeeShop
NUXT_PUBLIC_CURRENCY=PHP

# server-only (nitro)
DATABASE_URL=postgresql://user:pass@host:5432/coffeeshop
NUXT_API_SECRET=change-me
AUTH_SECRET=change-me
STRIPE_SECRET_KEY=sk_live_...
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
SENTRY_DSN=https://...@sentry.io/...
```

In `nuxt.config.ts` expose via `runtimeConfig`:

```ts
runtimeConfig: {
  apiSecret: process.env.NUXT_API_SECRET,
  public: { apiBase: process.env.NUXT_PUBLIC_API_BASE },
}
```

And document it in `ui/.env.example` (commit the example, gitignore the real `.env`).

---

## 🏗 Architecture Notes (Prototype)

- **State:** `useState()` singletons keyed by storage key. A `watch(..., { deep: true })` syncs to
  `localStorage` on the client only. Cart and orders are deliberately **not** SSR-hydrated —
  there is no backend to hydrate from. All storage writes are wrapped in `try/catch`: in private
  browsing or with storage disabled the session still works, it just won't persist.
- **Order lifecycle:** `OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'`
  with `STATUS_META` in `constants/order-status.ts`. Statuses mutate in place.
- **Revenue** excludes cancelled orders, on the orders page and the KPI tile alike.
- **Equal split** is cent-accurate: `lib/split.ts` works in integer cents, hands out the base
  share, then distributes the leftover cent to the first *n* people. `100.00 / 3 → 33.34, 33.33, 33.33`.
- **Split receipts hold the whole cart.** When a bill is split equally, every customer receipt
  contains a copy of every item, so `OrderCard` shows the first customer's items rather than
  summing (which would multiply quantities). It only merges when receipts genuinely differ.
- **Data:** static JSON imported at build time. No fetch, no pagination.
- **No backend:** price is trusted from the client and must be re-validated server-side for production.
- **IDs:** `crypto.randomUUID()` for customers/orders — requires a secure context (HTTPS).
- **Theme:** no flash on load. A tiny inline script in `app.vue` applies the stored class before
  first paint; `useTheme` then adopts it so SSR markup and client state agree.

---

## ✅ Production Readiness Roadmap

Use this as the **Definition of Done** before tagging `v1.0.0` and deploying.

### 1. Backend & Data
- [ ] Replace `localStorage` with real persistence (Nuxt `server/api/*` + DB via Drizzle/Prisma, or a separate backend)
- [ ] Move `menu.json` / `categories.json` to DB + admin CRUD
- [ ] Server-side price authority — never trust the client total
- [ ] Pagination, filtering and search on the server
- [ ] Migrations, seeds, backups

### 2. API & Validation
- [ ] OpenAPI / `zod` schemas for `MenuItem`, `CartItem`, `CustomerReceipt`, `Order`
- [ ] Validate every `server/api` handler and every client form
- [ ] Standardise error format (`{ error, code, details }`)

### 3. Authentication & Authorization
- [ ] Auth with roles: `customer`, `barista`, `admin`
- [ ] Protect `/orders` and all mutations; scope orders to a session
- [ ] CSRF, secure cookies, `httpOnly` JWT, refresh flow

### 4. Payments
- [ ] Payment provider (Stripe/PayMongo/GCash). Never handle raw card data
- [ ] Webhook for payment confirmation → `completed`
- [ ] Idempotency keys on order creation

### 5. Configuration & Environments
- [ ] `runtimeConfig` + `.env.example`, every var documented
- [ ] Separate configs for development / staging / production
- [ ] Devtools already disabled in production via `NODE_ENV`

### 6. Code Quality
- [ ] **Lint/Format:** `@nuxt/eslint` + `prettier` + `lint-staged` + `husky`
- [ ] **Typecheck:** `npm run typecheck` in CI (already available)
- [ ] Conventions: lockfile, `engines` (already set), `.nvmrc`

### 7. Testing
- [ ] **Unit:** `vitest` for `useCart`, `useCustomers`, `splitTotalEqually`, `formatPeso`, status transitions
- [ ] **Component:** `@vue/test-utils` / `@nuxt/test-utils` for `MenuCard`, `CartPanel`, `OrderCard`
- [ ] **E2E:** `playwright` — add to cart → split → place order → filter → change status
- [ ] 80% coverage enforced in CI

### 8. CI/CD
- [ ] GitHub Actions: lint → typecheck → test → build
- [ ] Branch protection on `main`
- [ ] Preview deployments + production deploys on tag

### 9. Security
- [ ] CSP / HSTS / X-Frame-Options / X-Content-Type-Options via `routeRules` or Nitro
- [ ] Sanitise customer names — validate length and charset
- [ ] Dependency audit, Dependabot/Renovate
- [ ] Rate limit order creation; scan for secrets (gitleaks)

### 10. Observability
- [ ] Sentry (`@sentry/nuxt`) or equivalent
- [ ] Structured logs, correlation IDs, never log PII
- [ ] `server/api/health.get.ts`

### 11. Performance & UX
- [x] Image optimization — `@nuxt/image`, AVIF/WebP, responsive `sizes`, explicit dimensions
- [x] Code splitting & route-level lazy loading
- [ ] `routeRules` caching: `swr` for menu, `no-store` for orders
- [ ] A11y audit (axe, Lighthouse); verify keyboard nav through sheets and dialogs
- [ ] i18n if multi-region
- [ ] `robots.txt` and sitemap (the file currently declines all crawlers)

### 12. Deployment Hardening
- [ ] Multi-stage `Dockerfile` or a platform adapter
- [ ] Non-root container user, `NODE_ENV=production`
- [ ] CDN + edge caching for static assets
- [ ] Backup/restore runbook, rollback plan

---

## 📦 Deployment

```bash
cd ui
npm run build      # → .output/
npm run preview    # preview at http://localhost:3000
npm run generate   # → .output/public for static hosts
```

Deploy `.output/` to any Node host, or `.output/public` to static hosts using `generate`.

> Static generation works, but every route is effectively a shell: the cart and order history
> live in the visitor's browser, so there is nothing server-side to cache.

---

## 🛡 Quality, Security & Operations

| Concern | Current | Target |
|---|---|---|
| **Lint** | None | `eslint` + `prettier` + pre-commit hook |
| **Types** | `npm run typecheck` passes clean | Enforced in CI |
| **Tests** | None | `vitest` + `playwright`, 80%+ coverage |
| **CI** | None | GitHub Actions (lint/typecheck/test/build) |
| **Images** | `npm run photos:check` validates the manifest | Enforced in CI |
| **Errors** | `console` | Sentry + structured logs |
| **Headers** | Default | CSP/HSTS/XFO via Nitro |
| **Secrets** | N/A | Env + vault, never committed |
| **Reduced motion** | Honoured globally | Keep |

---

## ⚠️ Known Limitations / Gaps

- Orders and cart are lost on clear-site-data, private browsing, or a different device.
- No conflict resolution if two tabs mutate `localStorage` (no `storage` event sync).
- No input sanitisation beyond `trim()` and a duplicate-name check.
- `crypto.randomUUID()` fails in insecure contexts (plain HTTP).
- No pagination — all orders render; this will degrade with hundreds of orders.
- No offline support, no optimistic updates, no retry.
- Receipt printing opens a popup; browsers may block it without a user gesture.
- `public/robots.txt` currently declines **all** crawlers, since this is a staging prototype. Switch it to an allow-list when a real origin exists.
- Photography is CC0 stock, not bespoke art direction. Swapping in a real shoot means
  replacing files in `public/images/` and re-running `npm run photos:fetch`.

---

## 🤝 Contributing

1. Branch from `main`: `git checkout -b feat/your-feature`
2. `cd ui && npm install && npm run dev`
3. Before opening a PR: `npm run typecheck && npm run photos:check`
4. Follow conventional commits (`feat:`, `fix:`, `chore:`)
5. Open a PR with screenshots for UI changes

**Adding a photo:** edit `app/data/photo-sources.json`, run `npm run photos:fetch`, then
`npm run photos:check`. Never edit `app/data/photos.ts` directly — it's generated. Always record
the author and licence; `photos:check` fails the build without them.

**Adding a shadcn component:** `npx shadcn-vue@latest add <name> --yes`. Don't hand-edit
`app/components/ui/` — the CLI owns it.

---

## 📄 License

MIT — see `LICENSE` (add one if missing). Prototype provided as-is without warranty.

---

> **Maintainer note:** When the roadmap is complete, remove the prototype warning at the top,
> replace it with a production badge, and tag `v1.0.0`. Until then, every deployment should be
> labeled **prototype / staging only**.
