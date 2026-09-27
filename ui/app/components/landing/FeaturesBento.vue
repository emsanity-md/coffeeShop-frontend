<script setup lang="ts">
/**
 * Feature grid — a bento, not a uniform card wall.
 *
 * On lg the grid is four columns of ~15rem. The two photo features claim a 2x2
 * block each and put the copy *over* the photo, so the extra area does work
 * instead of just padding out a taller card. The remaining four are 1x1 tiles
 * with a plain icon chip, which is what gives the section its hierarchy.
 *
 * Heroes lead the array deliberately: grid auto-placement puts the first 2x2
 * block in the left column and flows the 1x1 tiles into the two free columns,
 * which tiles the whole 4x2 area with no holes and no explicit row/col starts.
 */
import {
  CloudOff, Moon, Printer, Receipt, Search, Users,
} from '@lucide/vue'
import { Card } from '~/components/ui/card'
import { photo } from '~/data/photos'
import type { Component } from 'vue'

interface Feature {
  icon: Component
  title: string
  body: string
  /** `hero` takes a 2x2 block on lg and a full row on sm. */
  hero?: boolean
  photo?: string
}

const features: Feature[] = [
  {
    icon: Search,
    title: 'Browse & search',
    body: 'Filter by category or search across every name and description. Results regroup themselves as you narrow down.',
    hero: true,
    photo: 'ambience-pourover',
  },
  {
    icon: Printer,
    title: 'Order lifecycle',
    body: 'Pending, preparing, ready, completed or cancelled — with revenue that excludes the voided ones.',
    hero: true,
    photo: 'ambience-barista',
  },
  {
    icon: Users,
    title: 'Split the bill',
    body: 'Add customers, then split the total evenly — down to the cent, with no lost or invented peso.',
  },
  {
    icon: Receipt,
    title: 'Receipts that print',
    body: 'Per-customer receipts, formatted for a thermal printer.',
  },
  {
    icon: CloudOff,
    title: 'Works offline',
    body: 'Cart and orders live in localStorage. No network round-trip, no spinner while you take the next order.',
  },
  {
    icon: Moon,
    title: 'Light & dark',
    body: 'A warm espresso dark and a cream light mode, both checked for contrast.',
  },
]

/**
 * Photos resolved here rather than in the template: `photo()` takes a
 * possibly-undefined key, so `PHOTOS[f.photo]` in markup would not narrow.
 * `pic` is set on the hero tiles only; a hero with a bad key degrades to the
 * compact tile rather than rendering a broken image.
 */
const tiles = features.map(f => ({ ...f, pic: photo(f.photo) }))
</script>

<template>
  <section id="features" class="scroll-mt-20 border-t border-border">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <RevealOnScroll class="max-w-2xl">
        <p class="text-label text-primary">What it does</p>
        <h2 class="mt-2 text-display">Everything the counter needs</h2>
        <p class="mt-3 text-body text-pretty text-muted-foreground sm:text-section sm:leading-relaxed">
          Six things, done properly — not a suite of fifteen done loosely.
        </p>
      </RevealOnScroll>

      <StaggerList
        class="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:auto-rows-[minmax(13rem,auto)] lg:grid-cols-4"
      >
        <StaggerItem
          v-for="f in tiles"
          :key="f.title"
          :class="f.hero ? 'sm:col-span-2 lg:row-span-2' : ''"
        >
          <!-- Hero tile: photo is the background, copy sits on a scrim. -->
          <Card v-if="f.hero && f.pic" class="lift-card lift-card-hover group relative h-full overflow-hidden p-0">
            <NuxtImg
              :src="f.pic!.src"
              :alt="f.pic!.alt"
              :width="f.pic!.width"
              :height="f.pic!.height"
              sizes="xs:100vw sm:100vw lg:640px"
              class="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              loading="lazy"
            />
            <!-- Scrim uses --card rather than black/white, so the same ramp
                 stays legible in both themes. Opaque at the baseline where the
                 copy sits, clearing to let the photo read at the top. -->
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-0"
              style="background: linear-gradient(to top, color-mix(in srgb, var(--card) 97%, transparent) 6%, color-mix(in srgb, var(--card) 82%, transparent) 42%, color-mix(in srgb, var(--card) 30%, transparent) 100%)"
            />
            <div class="relative flex h-full flex-col justify-end p-6">
              <span class="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary backdrop-blur-sm">
                <component :is="f.icon" class="size-5" />
              </span>
              <h3 class="mt-4 text-title">{{ f.title }}</h3>
              <p class="mt-2 max-w-md text-body text-pretty text-muted-foreground">
                {{ f.body }}
              </p>
            </div>
          </Card>

          <!-- Compact tile: icon chip, title, two lines of copy. -->
          <Card v-else class="lift-card lift-card-hover group h-full overflow-hidden p-0">
            <div class="flex h-full flex-col p-6">
              <span class="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                <component :is="f.icon" class="size-5" />
              </span>
              <h3 class="mt-4 text-section">{{ f.title }}</h3>
              <p class="mt-2 text-body text-pretty text-muted-foreground">{{ f.body }}</p>
            </div>
          </Card>
        </StaggerItem>
      </StaggerList>
    </div>
  </section>
</template>
