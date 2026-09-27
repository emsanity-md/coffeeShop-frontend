<script setup lang="ts">
/**
 * Order lifecycle explainer. The stepper and the status colours come from
 * `constants/order-status.ts` — the same source the live orders screen reads,
 * so this section can't describe a machine the app doesn't implement.
 */
import { CircleX, TrendingUp } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { ROUTES } from '~/constants/site'
import { ORDER_STATUSES, STATUS_META } from '~/constants/order-status'
</script>

<template>
  <section id="lifecycle" class="scroll-mt-20 border-t border-border bg-muted/30">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div class="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
        <RevealOnScroll>
          <p class="text-label text-primary">Order lifecycle</p>
          <h2 class="mt-2 text-display">Five states, one direction</h2>
          <p class="mt-3 text-body text-pretty text-muted-foreground">
            An order moves forward through the queue, or gets cancelled. That's
            the whole model — and cancelled orders drop out of the revenue total
            automatically.
          </p>

          <div class="mt-6 soft-panel flex items-start gap-3 rounded-xl p-4">
            <CircleX class="mt-0.5 size-4 shrink-0" style="color: var(--status-cancelled)" />
            <p class="text-meta text-muted-foreground">
              <span class="font-medium text-foreground">Cancelled</span> is terminal but
              reversible — reopen it back to pending and it counts again.
            </p>
          </div>

          <Button as-child variant="outline" class="mt-6">
            <NuxtLink :to="ROUTES.orders">Open the orders screen</NuxtLink>
          </Button>
        </RevealOnScroll>

        <RevealOnScroll :delay="0.1">
          <div class="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-7">
            <div class="flex items-center gap-2">
              <TrendingUp class="size-4 text-primary" />
              <h3 class="text-section">Happy path</h3>
            </div>

            <StatusStepper detailed class="mt-6" />

            <div class="mt-7 border-t border-border pt-5">
              <p class="text-label text-muted-foreground">All states</p>
              <ul class="mt-3 flex flex-wrap gap-1.5">
                <li
                  v-for="status in ORDER_STATUSES"
                  :key="status"
                  class="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-meta"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :style="{ background: STATUS_META[status].tone }"
                    aria-hidden="true"
                  />
                  {{ STATUS_META[status].label }}
                </li>
              </ul>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  </section>
</template>
