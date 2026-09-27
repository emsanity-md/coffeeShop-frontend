<script setup lang="ts">
/**
 * Feature grid. Asymmetric bento rather than a uniform 3x2 — the wide first
 * tile earns its space, the rest stay compact.
 */
import {
  CloudOff, Moon, Printer, Receipt, Search, Users,
} from '@lucide/vue'
import { Card } from '~/components/ui/card'
import { PHOTOS } from '~/data/photos'
import type { Component } from 'vue'

interface Feature {
  icon: Component
  title: string
  body: string
  /** `wide` spans two columns on lg. */
  span?: boolean
  photo?: string
}

const features: Feature[] = [
  {
    icon: Search,
    title: 'Browse & search',
    body: 'Filter by category or search across every name and description. Results regroup themselves as you narrow down.',
    span: true,
    photo: 'ambience-pourover',
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
    icon: Printer,
    title: 'Order lifecycle',
    body: 'Pending, preparing, ready, completed or cancelled — with revenue that excludes the voided ones.',
    span: true,
    photo: 'ambience-barista',
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

      <StaggerList class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StaggerItem
          v-for="f in features"
          :key="f.title"
          :class="f.span ? 'lg:col-span-2' : ''"
        >
          <Card class="lift-card lift-card-hover group h-full overflow-hidden">
            <div class="flex h-full flex-col">
              <div
                v-if="f.photo && PHOTOS[f.photo]"
                class="relative aspect-[16/9] overflow-hidden"
              >
                <NuxtImg
                  :src="PHOTOS[f.photo]!.src"
                  :alt="PHOTOS[f.photo]!.alt"
                  :width="PHOTOS[f.photo]!.width"
                  :height="PHOTOS[f.photo]!.height"
                  sizes="xs:100vw sm:50vw lg:640px"
                  class="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div
                  class="pointer-events-none absolute inset-0"
                  style="background: linear-gradient(to top, color-mix(in srgb, var(--card) 92%, transparent), transparent 60%)"
                />
              </div>

              <div class="flex flex-1 flex-col p-5 pt-4">
                <span class="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                  <component :is="f.icon" class="size-4.5" />
                </span>
                <h3 class="mt-3.5 text-section">{{ f.title }}</h3>
                <p class="mt-1.5 text-body text-pretty text-muted-foreground">{{ f.body }}</p>
              </div>
            </div>
          </Card>
        </StaggerItem>
      </StaggerList>
    </div>
  </section>
</template>
