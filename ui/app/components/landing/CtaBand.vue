<script setup lang="ts">
/** Closing call to action. */
import { ArrowRight, Coffee } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { ROUTES } from '~/constants/site'
</script>

<template>
  <section class="border-t border-border">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <RevealOnScroll>
        <div class="sheen-panel relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center shadow-card sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 opacity-70"
            style="background: radial-gradient(70% 120% at 50% 0%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 65%)"
          />
          <div class="relative">
            <span class="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Coffee class="size-5" />
            </span>
            <h2 class="mx-auto mt-5 max-w-2xl text-display text-balance">
              Ready to pour?
            </h2>
            <p class="mx-auto mt-3 max-w-md text-body text-pretty text-muted-foreground">
              Take an order end to end — it takes about a minute, and nothing you
              type leaves this browser.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Button as-child size="lg">
                <NuxtLink :to="ROUTES.pos">
                  Open the POS
                  <ArrowRight class="size-4" />
                </NuxtLink>
              </Button>
              <Button as-child size="lg" variant="outline">
                <NuxtLink :to="ROUTES.orders">View orders</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  </section>
</template>
