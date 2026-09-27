<script setup lang="ts">
/**
 * Menu preview, rendered straight from menu.json + photos.ts.
 *
 * Because it reads the same data the POS does, adding an item to the menu
 * updates this section for free — it can't go stale the way a hand-written
 * showcase would.
 */
import { ArrowRight } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ROUTES } from '~/constants/site'
import { PHOTOS } from '~/data/photos'
import menuData from '~/data/menu.json'
import { formatPeso } from '~/utils'

const featured = menuData.slice(0, 6)
</script>

<template>
  <section id="menu" class="scroll-mt-20 border-t border-border bg-muted/30">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <RevealOnScroll class="flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-2xl">
          <p class="text-label text-primary">On the board</p>
          <h2 class="mt-2 text-display">Twelve drinks, one tap each</h2>
          <p class="mt-3 text-body text-pretty text-muted-foreground">
            A real sample of the menu — this section reads the same
            <code class="rounded bg-muted px-1 py-0.5 font-mono text-meta">menu.json</code>
            the point of sale uses.
          </p>
        </div>
        <Button as-child variant="outline">
          <NuxtLink :to="ROUTES.pos">
            Open the menu
            <ArrowRight class="size-4" />
          </NuxtLink>
        </Button>
      </RevealOnScroll>

      <StaggerList class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StaggerItem v-for="item in featured" :key="item.id">
          <SpotlightCard class="spotlight spotlight-hover h-full rounded-xl">
            <article class="lift-card lift-card-hover flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
              <div class="relative aspect-[4/3] overflow-hidden bg-muted">
                <NuxtImg
                  v-if="item.image && PHOTOS[item.image]"
                  :src="PHOTOS[item.image]!.src"
                  :alt="PHOTOS[item.image]!.alt"
                  :width="PHOTOS[item.image]!.width"
                  :height="PHOTOS[item.image]!.height"
                  sizes="xs:50vw sm:45vw lg:380px"
                  class="size-full object-cover"
                  loading="lazy"
                />
                <div v-else class="flex size-full items-center justify-center text-3xl" aria-hidden="true">
                  {{ item.icon }}
                </div>
              </div>

              <div class="flex flex-1 flex-col gap-1 p-3.5">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="text-card leading-tight">{{ item.name }}</h3>
                  <span class="tnum shrink-0 font-mono text-body font-semibold text-primary">
                    {{ formatPeso(item.price) }}
                  </span>
                </div>
                <p class="text-meta text-pretty text-muted-foreground">{{ item.desc }}</p>
                <Badge variant="secondary" class="mt-1.5 w-fit text-label capitalize">
                  {{ item.cat }}
                </Badge>
              </div>
            </article>
          </SpotlightCard>
        </StaggerItem>
      </StaggerList>
    </div>
  </section>
</template>
