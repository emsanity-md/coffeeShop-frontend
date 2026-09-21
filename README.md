# CoffeeShop Frontend — Prototype

> [!WARNING]
> **Prototype Status:** This project is currently a **prototype / proof-of-concept**. It is **NOT production-ready** out of the box. Data is stored in `localStorage`, there is no backend, no authentication, no tests, and no CI/CD. See [Production Readiness](#-production-readiness-roadmap) for what is required before production use.
>
> Do **not** deploy this prototype with real customer/payment data.

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.5-00DC82?logo=nuxt)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.11-black)](https://ui.nuxt.com)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Status](https://img.shields.io/badge/status-prototype-orange)](#-prototype-disclaimer)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)

A responsive Point-of-Sale (POS) / ordering UI for a coffee shop. Browse menu, search/filter, manage a cart, split orders across multiple customers, and track order lifecycle.

Built with **Nuxt 4 + Vue 3 + Nuxt UI + Tailwind CSS 4**.

---

## Table of Contents

- [Prototype Disclaimer](#-prototype-disclaimer)
- [Demo & Features](#-features-current-prototype)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Architecture Notes (Prototype)](#-architecture-notes-prototype)
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
| **Persistence** | `localStorage` (`coffee_shop_cart`, `coffee_shop_orders`) — per-browser, volatile | Backend API + database (Postgres/MySQL) |
| **Auth** | None | Auth (Nuxt Auth / Auth.js, JWT, RBAC for staff/admin) |
| **Payments** | No payment flow, mock totals in PHP (₱) | Payment gateway (Stripe/PayMongo/GCash) + server-side price verification |
| **Data Source** | Static JSON (`app/data/menu.json`, `categories.json`) | CMS / Admin API |
| **Validation** | Client-side only | Client + server validation (Zod) |
| **Testing** | None | Unit + component + e2e |
| **Observability** | None | Logging, error tracking, analytics |
| **Deployment** | `nuxt dev` / `nuxt build` locally | Hardened build, CI/CD, env management |

**Do not use for real transactions** until the checklist in [Production Readiness Roadmap](#-production-readiness-roadmap) is completed.

---

## ✨ Features (Current Prototype)

- **Menu browsing** — category sidebar + responsive drawer, grouped grid, search by name/description
- **Cart** — add, change qty, remove, clear; desktop panel + mobile drawer; persisted to `localStorage`
- **Multi-customer** — add/edit/remove customers, assign/split, per-customer receipts
- **Orders page** (`/orders`) — history, revenue total, status filters (`pending` → `preparing` → `ready` → `completed` / `cancelled`), status transitions, delete / clear-all with confirmation, receipt modal
- **Responsive** — desktop sidebar + mobile `UDrawer` patterns; `100dvh` layout
- **Theming** — custom CSS variables (`--bg-app`, `--text-*`, `--border-color`) + dark/light via `ThemeToggle`

---

## 🧱 Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Nuxt 4.5.2](https://nuxt.com) (file-based routing, auto-imports, `useState`) |
| UI | [Vue 3.5](https://vuejs.org), [Nuxt UI 4.11](https://ui.nuxt.com), [Tailwind CSS 4.3](https://tailwindcss.com) |
| Language | TypeScript (strict via Nuxt tsconfigs) |
| State | `useState` + `localStorage` sync (`useCart`, `useOrders` composables) |
| Icons | Nuxt UI / Heroicons (`i-heroicons-*`) |
| Build | Vite (via Nuxt), Nitro |

> Node: Nuxt 4 requires **Node 20+** (22 LTS recommended).

---

## 📁 Project Structure

```
coffeeShop-frontend/
├── README.md                 # ← you are here (prototype + production plan)
└── ui/                       # Nuxt application
    ├── app/
    │   ├── app.vue
    │   ├── assets/css/main.css
    │   ├── components/
    │   │   ├── cart/         # CartPanel, CartItem, CartFooter
    │   │   ├── menu/         # MenuSidebar, MenuGrid, MenuCard, MenuSearchBar
    │   │   ├── orders/OrderCard.vue
    │   │   ├── ui/ThemeToggle.vue
    │   │   └── ReceiptModal.vue
    │   ├── composables/
    │   │   ├── useCart.ts    # cart state + localStorage
    │   │   └── useOrders.ts  # orders state + status machine
    │   ├── data/
    │   │   ├── menu.json     # static menu (12 items)
    │   │   └── categories.json
    │   ├── pages/
    │   │   ├── index.vue     # POS main view
    │   │   └── orders.vue    # orders dashboard
    │   └── types/menu.ts
    ├── public/images/
    ├── nuxt.config.ts
    ├── package.json
    └── tsconfig.json
```

Key config — `ui/nuxt.config.ts:2`:
```ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
  components: [{ path: '~/components', pathPrefix: false }],
  ui: { theme: { colors: ['primary','secondary','neutral','success','warning','error'] } }
})
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 20` (verify: `node -v`)
- `npm` / `pnpm` / `yarn` / `bun`

### Install & Run

```bash
cd ui
npm install        # or pnpm install / yarn / bun install

# dev server — http://localhost:3000
npm run dev

# production build + preview
npm run build
npm run preview   # or npm run generate for static

# Nuxt prepare (postinstall hook)
npx nuxt prepare
```

No env vars required for the prototype (see [Environment Variables](#-environment-variables) for production).

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `nuxt dev` | Start dev server with HMR |
| `build` | `nuxt build` | Production build (Nitro) |
| `generate` | `nuxt generate` | Pre-render static site |
| `preview` | `nuxt preview` | Preview production build locally |
| `postinstall` | `nuxt prepare` | Generate `.nuxt` types |

Defined in `ui/package.json:5`.

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
  public: { apiBase: process.env.NUXT_PUBLIC_API_BASE }
}
```

And document in `ui/.env.example` (commit the example, gitignore the real `.env` — already covered in `ui/.gitignore:22`).

---

## 🏗 Architecture Notes (Prototype)

- **State:** `useState()` singletons keyed by storage key (`coffee_shop_cart`, `coffee_shop_orders`). `watch(..., { deep: true })` syncs to `localStorage` on client only (`import.meta.client` guard). No SSR hydration for cart/orders.
- **Order lifecycle:** `OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'` with `STATUS_META` for color/icon. Status mutates in-place (`ui/app/composables/useOrders.ts:92`).
- **Data:** static JSON imported at build time (`ui/app/pages/index.vue:4`). No fetch, no pagination.
- **No backend:** price is trusted from client (`useCart.ts:70` computes total from menu). Must be re-validated server-side for production.
- **IDs:** `crypto.randomUUID()` for customers/orders — requires secure context (HTTPS).

---

## ✅ Production Readiness Roadmap

Use this as the **Definition of Done** before tagging `v1.0.0` and deploying to production.

### 1. Backend & Data

- [ ] Replace `localStorage` with real persistence. Options:
  - **Option A (Recommended):** Nuxt `server/api/*` + DB (Postgres via Drizzle/Prisma) + Nitro.
  - **Option B:** Separate backend (NestJS/Express/Go) — frontend calls via `NUXT_PUBLIC_API_BASE`.
- [ ] Migrate `menu.json` / `categories.json` to DB + admin CRUD. Add `server/api/menu.get.ts`, `orders.post.ts`, etc.
- [ ] Server-side price authority — never trust client total; recalculate on server.
- [ ] Pagination, filtering, and search on server for large menus/orders.
- [ ] Database migrations, seeds, backups.

### 2. API & Validation

- [ ] Define OpenAPI / `zod` schemas for `MenuItem`, `CartItem`, `CustomerReceipt`, `Order`. Share types via `~/types`.
- [ ] Add `zod` validation on every `server/api` handler + client forms (`@vee-validate/zod` or similar).
- [ ] Standardize error format (`{ error, code, details }`) and HTTP status usage.

### 3. Authentication & Authorization

- [ ] Add auth (`@sidebase/nuxt-auth` / Auth.js, or Supabase/Auth0). Roles: `customer`, `barista`, `admin`.
- [ ] Protect `/orders` and order mutations; scope orders to user/session.
- [ ] CSRF, secure cookies, `httpOnly` JWT, refresh flow.

### 4. Payments (if selling)

- [ ] Integrate payment provider (Stripe/PayMongo/GCash). Never handle raw card data.
- [ ] Webhook handler for payment confirmation → order status `completed`.
- [ ] Idempotency keys for order creation.

### 5. Configuration & Environments

- [ ] Add `runtimeConfig` + `.env.example` (see above). Document every var.
- [ ] Separate configs for `development` / `staging` / `production`.
- [ ] Disable `devtools` in production: `devtools: { enabled: process.env.NODE_ENV !== 'production' }`.

### 6. Code Quality

- [ ] **Lint/Format:** `eslint` (`@nuxt/eslint` + `eslint-config-prettier`) + `prettier` + `lint-staged` + `husky` pre-commit.
- [ ] **Typecheck:** `vue-tsc --noEmit` in CI.
- [ ] **Conventions:** `pnpm` lockfile, `engines` field, `.nvmrc` / `.node-version`.

### 7. Testing

- [ ] **Unit:** `vitest` for `useCart`, `useOrders`, price math, status transitions.
- [ ] **Component:** `@vue/test-utils` / `@nuxt/test-utils` for `MenuCard`, `CartPanel`, `OrderCard`, `ReceiptModal`.
- [ ] **E2E:** `playwright` — critical paths: add to cart → split → place order → filter orders → change status.
- [ ] Coverage threshold (e.g., 80%) enforced in CI.

### 8. CI/CD

- [ ] GitHub Actions workflow:
  ```yaml
  # .github/workflows/ci.yml — lint → typecheck → test → build
  on: [push, pull_request]
  jobs:
    ci: { runs-on: ubuntu-latest, steps: [checkout, setup-node, pnpm install, lint, typecheck, test, build] }
  ```
- [ ] Branch protection (`main` requires passing CI).
- [ ] Preview deployments (Vercel/Netlify/Cloudflare) + production deploys on tag.

### 9. Security

- [ ] Security headers via `routeRules` / Nitro: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`, `X-Content-Type-Options`.
- [ ] Sanitize all user inputs (customer names) — escape on render, validate length/charset.
- [ ] Dependency audit (`npm audit` / `pnpm audit`, Dependabot/Renovate).
- [ ] Rate limiting on order creation.
- [ ] No secrets in repo — scan with `gitleaks`.

### 10. Observability & Ops

- [ ] Error tracking: Sentry (`@sentry/nuxt`) or equivalent.
- [ ] Logging: structured logs (pino) + correlation IDs; never log PII.
- [ ] Analytics: privacy-respecting (Plausible/PostHog) if needed.
- [ ] Health check endpoint (`server/api/health.get.ts`).

### 11. Performance & UX

- [ ] Image optimization: `<NuxtImg>` (`@nuxt/image`), WebP, lazy-load, explicit `width`/`height`.
- [ ] Code splitting & route lazy-loading (Nuxt does this — verify bundle via `nuxi analyze`).
- [ ] `routeRules` caching: `swr` for menu, `no-store` for orders.
- [ ] A11y audit (axe, Lighthouse), keyboard nav for drawers/modals, `aria-*` on status filters (`ui/app/pages/orders.vue:127`).
- [ ] i18n if multi-region (`@nuxtjs/i18n`), currency formatting via `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.
- [ ] SEO: `useHead` / `useSeoMeta`, OG tags, `robots.txt`, `sitemap`.

### 12. Deployment Hardening

- [ ] **Dockerfile** (multi-stage) or platform adapter (`@nuxthub/vercel`, Node preset).
- [ ] Non-root container user, `NODE_ENV=production`.
- [ ] CDN + edge caching for static assets; `public/` hashed.
- [ ] Backup/restore runbook, rollback plan, on-call.

#### Suggested `routeRules` example

```ts
// nuxt.config.ts
routeRules: {
  '/':        { swr: 60 },
  '/orders': { ssr: false }, // or auth-guarded ssr
  '/api/**': { cors: true },
}
nitro: { preset: 'node-server' } // or 'vercel', 'cloudflare-pages'
```

#### Suggested `Dockerfile` skeleton

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY ui/package*.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

---

## 📦 Deployment

### Current (prototype)

```bash
cd ui
npm run build        # → .output/
npm run preview      # preview at http://localhost:3000
# or
npm run generate     # → .output/public for static hosts
```

Deploy `.output/` to any Node host, or `.output/public` to static hosts if using `generate`.

### Production (after roadmap)

1. Set env vars on host (Vercel / Fly.io / Render / Docker / Cloudflare).
2. Ensure `DATABASE_URL`, `AUTH_SECRET`, etc. are set.
3. Run DB migrations.
4. `npm run build` in CI, deploy artifact.
5. Smoke-test `/api/health`, then promote.

Official docs: [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment).

---

## 🛡 Quality, Security & Operations

| Concern | Prototype | Production Target |
|---|---|---|
| **Lint** | None | `eslint` + `prettier` + pre-commit hook |
| **Types** | Nuxt auto (`tsconfig.json:5` refs) | `vue-tsc --noEmit` in CI, `strict: true` |
| **Tests** | None | `vitest` + `playwright`, 80%+ coverage |
| **CI** | None | GitHub Actions (lint/typecheck/test/build) |
| **Errors** | `console` | Sentry + structured logs |
| **Headers** | Default | CSP/HSTS/XFO via Nitro |
| **Secrets** | N/A | Env + vault, never committed |

---

## ⚠️ Known Limitations / Gaps

- Orders/cart lost on clear-site-data, private browsing, or different device (localStorage-only).
- No conflict resolution if two tabs mutate `localStorage` (no `storage` event sync).
- No input sanitization beyond `trim()` / duplicate check (`ui/app/pages/index.vue:40`).
- `crypto.randomUUID()` fails in insecure contexts (HTTP).
- No pagination — all orders rendered; will degrade with 100s of orders.
- No offline support, no optimistic updates, no retry.
- Images in `menu.json` use mixed casing/spaces (`Capuccino.png`, `flat white.png`) — normalize filenames for case-sensitive hosts.

---

## 🤝 Contributing

1. Branch from `main`: `git checkout -b feat/your-feature`
2. `cd ui && npm install && npm run dev`
3. Follow conventional commits (`feat:`, `fix:`, `chore:`).
4. Open PR — CI must pass (once added). Include screenshots for UI changes.

---

## 📄 License

MIT — see `LICENSE` (add one if missing). Prototype provided as-is without warranty.

---

> **Maintainer note:** When this checklist is complete, remove the prototype warning at the top, replace it with a production badge, and tag `v1.0.0`. Until then, every deployment should be labeled **prototype / staging only**.
