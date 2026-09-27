<script setup lang="ts">
/**
 * Landing hero. The photo cluster on the right is real committed imagery, and
 * the floating order card previews the actual product rather than a screenshot
 * of it.
 */
import { ArrowRight, ReceiptText, ShieldCheck, Sparkles } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { ROUTES, SITE } from '~/constants/site'
import { PHOTOS } from '~/data/photos'
import menuData from '~/data/menu.json'
import { formatPeso } from '~/utils'
import { motion, useReducedMotion } from 'motion-v'
import { MOTION } from '~/composables/useMotionPreset'

const reduced = useReducedMotion()

const featured = menuData.slice(0, 3)
const hero = PHOTOS['ambience-counter']!
const beans = PHOTOS['ambience-beans']!
const pour = PHOTOS['ambience-pour']!

// Honest, checkable figures only — no invented social proof.
const facts = [
  { value: String(menuData.length), label: 'menu items' },
  { value: '5', label: 'order states' },
  { value: '100%', label: 'runs in-browser' },
]
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- Warm wash so the hero doesn't read as a flat cream block. -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] opacity-60"
      style="background: radial-gradient(60% 60% at 50% 40%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%)"
    />

    <div class="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-8 lg:pb-24">
      <div>
        <motion.p
          :initial="reduced ? { opacity: 0 } : { opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: MOTION.duration.med, ease: MOTION.ease.warm }"
          class="text-label inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-muted-foreground backdrop-blur-sm"
        >
          <Sparkles class="size-3 text-primary" />
          {{ SITE.tagline }}
        </motion.p>

        <BlurText
          as="h1"
          class="mt-5 text-display text-balance sm:text-[2.75rem] sm:leading-[3.25rem]"
        >
          The counter,
          <span class="text-primary">without the chaos.</span>
        </BlurText>

        <motion.p
          :initial="reduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: MOTION.duration.slow, ease: MOTION.ease.warm, delay: 0.15 }"
          class="mt-5 max-w-lg text-body text-pretty text-muted-foreground sm:text-section sm:leading-relaxed"
        >
          {{ SITE.description }}
        </motion.p>

        <motion.div
          :initial="reduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: MOTION.duration.slow, ease: MOTION.ease.warm, delay: 0.25 }"
          class="mt-8 flex flex-col gap-2.5 sm:flex-row"
        >
          <Button as-child size="lg">
            <NuxtLink :to="ROUTES.pos">
              Open the POS
              <ArrowRight class="size-4" />
            </NuxtLink>
          </Button>
          <Button as-child size="lg" variant="outline">
            <NuxtLink :to="ROUTES.orders">
              <ReceiptText class="size-4" />
              See the orders screen
            </NuxtLink>
          </Button>
        </motion.div>

        <!-- Product facts, all verifiable from the codebase. -->
        <motion.dl
          :initial="reduced ? { opacity: 0 } : { opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: MOTION.duration.slow, ease: MOTION.ease.warm, delay: 0.35 }"
          class="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-6"
        >
          <div v-for="fact in facts" :key="fact.label">
            <dt class="sr-only">{{ fact.label }}</dt>
            <dd>
              <span class="block font-mono text-title font-semibold text-foreground">{{ fact.value }}</span>
              <span class="text-meta text-muted-foreground">{{ fact.label }}</span>
            </dd>
          </div>
        </motion.dl>
      </div>

      <!-- Photo cluster + floating order-card preview -->
      <motion.div
        :initial="reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :transition="{ duration: MOTION.duration.slower, ease: MOTION.ease.warm, delay: 0.1 }"
        class="relative mx-auto w-full max-w-md lg:max-w-none"
      >
        <div class="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
          <NuxtImg
            :src="hero.src"
            :alt="hero.alt"
            :width="hero.width"
            :height="hero.height"
            sizes="xs:100vw sm:50vw lg:480px"
            class="size-full object-cover"
            preload
            fetchpriority="high"
          />
          <div
            class="pointer-events-none absolute inset-0"
            style="background: linear-gradient(to top, color-mix(in srgb, var(--background) 70%, transparent), transparent 55%)"
          />

          <!-- Live-ish order card, floated over the photo. -->
          <motion.div
            v-if="!reduced"
            :animate="{ y: [0, -9, 0] }"
            :transition="{ duration: 7, ease: 'easeInOut', repeat: Infinity }"
            class="absolute inset-x-4 bottom-4 rounded-xl border border-border bg-card/92 p-4 shadow-pop backdrop-blur-md sm:inset-x-5 sm:bottom-5"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="text-label text-muted-foreground">Order #A3F91C2E</span>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-status-ready/12 px-2 py-0.5 text-label" style="color: var(--status-ready)">
                <span class="size-1.5 rounded-full" style="background: var(--status-ready)" />
                Ready
              </span>
            </div>
            <ul class="mt-3 space-y-1.5">
              <li
                v-for="item in featured"
                :key="item.id"
                class="flex items-baseline justify-between gap-3 text-meta"
              >
                <span class="truncate text-muted-foreground">{{ item.name }}</span>
                <span class="tnum shrink-0 font-medium">{{ formatPeso(item.price) }}</span>
              </li>
            </ul>
            <div class="mt-3 flex items-baseline justify-between border-t border-border pt-2.5">
              <span class="text-meta text-muted-foreground">Total</span>
              <span class="tnum font-mono text-card font-semibold">
                {{ formatPeso(featured.reduce((s, i) => s + i.price, 0)) }}
              </span>
            </div>
          </motion.div>
        </div>

        <!-- Two smaller frames, offset behind the main one. -->
        <div
          class="pointer-events-none absolute -left-4 -top-4 hidden size-28 overflow-hidden rounded-xl border border-border shadow-lift sm:block lg:-left-10"
        >
          <NuxtImg
            :src="beans.src"
            :alt="beans.alt"
            :width="beans.width"
            :height="beans.height"
            sizes="xs:112px"
            class="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div
          class="pointer-events-none absolute -right-4 -bottom-4 hidden size-24 overflow-hidden rounded-xl border border-border shadow-lift sm:block lg:-right-8"
        >
          <NuxtImg
            :src="pour.src"
            :alt="pour.alt"
            :width="pour.width"
            :height="pour.height"
            sizes="xs:96px"
            class="size-full object-cover"
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>

    <div class="border-t border-border bg-muted/30">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-meta text-muted-foreground sm:px-6">
        <span class="inline-flex items-center gap-1.5">
          <ShieldCheck class="size-3.5" />
          Nothing leaves your browser
        </span>
        <span aria-hidden="true">·</span>
        <span>No account, no tracking, no cookies</span>
      </div>
    </div>
  </section>
</template>
