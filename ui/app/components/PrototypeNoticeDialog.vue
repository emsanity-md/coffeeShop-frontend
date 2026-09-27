<script setup lang="ts">
/**
 * Prototype / privacy notice.
 *
 * Shown once per browser on first entry to the POS (not the landing page — the
 * marketing surface isn't where someone starts entering data). Dismissal is
 * remembered, but the notice stays reachable from the rail and the footer.
 */
import { Check, Info, ShieldCheck } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

defineProps<{ open: boolean }>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'dismiss', forever: boolean): void
}>()
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg" :show-close="false">
      <DialogHeader>
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
              <ShieldCheck class="size-5" />
            </span>
            <div class="min-w-0">
              <DialogTitle class="text-section leading-tight">
                Prototype — no real data is collected
              </DialogTitle>
              <DialogDescription class="text-meta">Demo &amp; UI preview only</DialogDescription>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div class="soft-panel space-y-3 rounded-lg p-4">
        <p class="flex gap-2.5 text-body leading-relaxed">
          <Info class="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            This is a <span class="font-medium">prototype</span> build. No personal
            or payment data is collected, stored, or transmitted to any server.
          </span>
        </p>

        <ul class="list-disc space-y-1.5 pl-5 text-body text-muted-foreground">
          <li>
            <span class="font-medium text-foreground">Local only:</span> the cart,
            customer names and orders live in your browser's
            <code class="rounded bg-background px-1 py-0.5 font-mono text-meta">localStorage</code>
            and are never sent anywhere.
          </li>
          <li>
            <span class="font-medium text-foreground">No backend:</span> the menu is
            static demo data. Prices and totals are mock values in pesos.
          </li>
          <li>
            <span class="font-medium text-foreground">No tracking:</span> no analytics,
            cookies or third-party tracking. Clearing site data removes every demo order.
          </li>
          <li>Use placeholder names — please don't enter real personal information.</li>
        </ul>

        <p class="text-meta leading-relaxed text-muted-foreground">
          Production would add a real backend, encrypted storage, authentication and a
          payment provider before handling any real data.
        </p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <Button
          class="flex-1"
          @click="emit('dismiss', false)"
        >
          <Check class="size-4" />
          I understand — continue
        </Button>
        <Button
          class="flex-1"
          variant="outline"
          @click="emit('dismiss', true)"
        >
          Don't show again
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
