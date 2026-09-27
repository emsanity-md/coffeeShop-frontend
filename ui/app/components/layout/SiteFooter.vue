<script setup lang="ts">
/**
 * Landing footer. Also the home of the image credits — `CREDITS` comes straight
 * out of the generated manifest, so attribution can't drift from the assets
 * actually in the bundle.
 */
import { computed } from 'vue'
import { Coffee } from '@lucide/vue'
import { NAV_LINKS, ROUTES, SITE } from '~/constants/site'
import { CREDITS } from '~/data/photos'
import { cn } from '~/utils'

/** Grouped by photographer so one prolific shooter isn't listed nine times. */
const credits = computed(() => {
  const byAuthor = new Map<string, { author: string, authorUrl?: string, pages: string[], sources: Set<string> }>()
  for (const p of CREDITS) {
    const key = p.author || p.source
    const entry = byAuthor.get(key) ?? { author: p.author, authorUrl: p.authorUrl, pages: [], sources: new Set<string>() }
    if (p.pageUrl && !entry.pages.includes(p.pageUrl)) entry.pages.push(p.pageUrl)
    entry.sources.add(p.source)
    byAuthor.set(key, entry)
  }
  return [...byAuthor.values()].sort((a, b) => a.author.localeCompare(b.author))
})

function withUtm(href: string) {
  const url = new URL(href)
  for (const [k, v] of Object.entries(SITE.utm)) url.searchParams.set(k, v)
  return url.toString()
}
</script>

<template>
  <footer class="border-t border-border bg-muted/30">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <SiteBrand size="md" />
          <p class="mt-4 max-w-sm text-body text-muted-foreground">
            {{ SITE.description }}
          </p>
          <p class="mt-4 flex items-start gap-2 text-meta text-muted-foreground">
            <Coffee class="mt-0.5 size-3.5 shrink-0" />
            <span>
              A prototype. Cart, customers and orders are stored only in your
              browser — nothing is sent to a server.
            </span>
          </p>
        </div>

        <nav aria-label="Site">
          <h2 class="text-label text-muted-foreground">Explore</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="link in NAV_LINKS" :key="link.href">
              <a :href="link.href" class="text-body text-muted-foreground transition-colors hover:text-foreground">{{ link.label }}</a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Demo">
          <h2 class="text-label text-muted-foreground">Demo</h2>
          <ul class="mt-3 space-y-2">
            <li>
              <NuxtLink :to="ROUTES.pos" class="text-body text-muted-foreground transition-colors hover:text-foreground">Point of sale</NuxtLink>
            </li>
            <li>
              <NuxtLink :to="ROUTES.orders" class="text-body text-muted-foreground transition-colors hover:text-foreground">Order history</NuxtLink>
            </li>
            <li>
              <a href="#" class="text-body text-muted-foreground transition-colors hover:text-foreground">Privacy notice</a>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Image credits. Renders nothing when every asset is in-repo generated. -->
      <div v-if="credits.length" class="mt-12 border-t border-border pt-6">
        <h2 class="text-label text-muted-foreground">Photography</h2>
        <p class="mt-2 max-w-2xl text-meta text-muted-foreground">
          Every photo is
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="underline underline-offset-2 hover:text-foreground"
          >free-licence stock</a>
          released into the public domain (CC0) and served from this app — not
          hotlinked. Thanks to the photographers:
        </p>
        <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          <li v-for="c in credits" :key="c.author" class="text-meta text-muted-foreground">
            <a
              v-if="c.authorUrl"
              :href="withUtm(c.authorUrl)"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="underline underline-offset-2 hover:text-foreground"
            >{{ c.author }}</a>
            <span v-else>{{ c.author }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-meta text-muted-foreground">
          MIT licensed. Built as a UI/UX prototype.
        </p>
        <p class="text-meta text-muted-foreground">
          Nuxt · shadcn-vue · motion-v · Geist
        </p>
      </div>
    </div>
  </footer>
</template>
