<script setup lang="ts">
/**
 * Receipt dialog. The on-screen copy is a styled preview; the print path is
 * `lib/receipt.ts`, which builds a separate monospace document for the thermal
 * printer.
 */
import { computed } from 'vue'
import { Printer, Users } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { STATUS_META } from '~/constants/order-status'
import type { CartItem } from '~/types/menu'
import type { OrderStatus } from '~/types/order'
import { SITE } from '~/constants/site'
import { customerInitials, formatDateTime, formatPeso, printReceipt } from '~/utils'

const props = defineProps<{
  open: boolean
  customerName: string
  items: CartItem[]
  total: number
  isSplit?: boolean
  splitTotal?: number
  date?: string
  orderId?: string
  status?: OrderStatus
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const orderIdShort = computed(() => props.orderId ? props.orderId.slice(0, 8).toUpperCase() : null)
const statusMeta = computed(() => (props.status ? STATUS_META[props.status] : null))

function onPrint() {
  printReceipt({
    customerName: props.customerName,
    items: props.items,
    total: props.total,
    isSplit: !!props.isSplit,
    splitTotal: props.splitTotal,
    date: props.date,
    orderId: props.orderId,
    status: props.status,
  })
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('close')">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader class="items-center text-center">
        <DialogTitle class="sr-only">Receipt for {{ props.customerName }}</DialogTitle>

        <div class="flex flex-col items-center gap-1.5">
          <span class="flex size-10 items-center justify-center rounded-full bg-primary/12 text-lg" aria-hidden="true">☕</span>
          <p class="text-section font-bold uppercase tracking-[0.2em]">{{ SITE.name }}</p>
          <p class="text-label uppercase tracking-widest text-muted-foreground">Coffee House</p>
          <p class="tnum mt-1 text-meta text-muted-foreground">
            {{ formatDateTime(props.date ?? '') }}
          </p>
          <p v-if="orderIdShort" class="tnum font-mono text-label text-muted-foreground">
            #{{ orderIdShort }}
          </p>
          <span
            v-if="statusMeta"
            class="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-label"
            :style="{
              color: statusMeta.tone,
              background: `color-mix(in srgb, ${statusMeta.tone} 14%, transparent)`,
            }"
          >
            <component :is="statusMeta.icon" class="size-3" />
            {{ statusMeta.label }}
          </span>
        </div>
      </DialogHeader>

      <Separator />

      <div class="flex items-center justify-center gap-3">
        <Avatar class="size-9">
          <AvatarFallback class="bg-primary/12 text-meta font-semibold text-primary">
            {{ customerInitials(props.customerName) }}
          </AvatarFallback>
        </Avatar>
        <p class="min-w-0 truncate text-title font-bold uppercase tracking-wider">
          {{ props.customerName }}
        </p>
      </div>

      <div
        v-if="props.isSplit"
        class="soft-panel mx-auto flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-meta text-muted-foreground"
      >
        <Users class="size-3.5" />
        Split bill · order total
        <span class="tnum font-semibold text-foreground">{{ formatPeso(props.splitTotal ?? props.total) }}</span>
      </div>

      <Separator />

      <ul class="space-y-1.5">
        <li
          v-for="item in props.items"
          :key="item.id"
          class="flex items-baseline justify-between gap-3 text-meta"
        >
          <span class="min-w-0 truncate">
            {{ item.name }}
            <span class="tnum text-muted-foreground">× {{ item.qty }}</span>
          </span>
          <span class="tnum shrink-0 font-medium">{{ formatPeso(item.price * item.qty) }}</span>
        </li>
      </ul>

      <Separator />

      <div class="soft-panel flex items-center justify-between rounded-xl px-4 py-3">
        <span class="text-card font-semibold">{{ props.isSplit ? 'Your share' : 'Total' }}</span>
        <LetterPullup
          :text="formatPeso(props.total)"
          class="font-mono text-title font-semibold"
        />
      </div>

      <p class="text-center text-label tracking-wide text-muted-foreground">
        Thank you · Come again ☕
      </p>

      <DialogFooter class="flex-col gap-2 sm:flex-row">
        <Button class="flex-1" @click="onPrint">
          <Printer class="size-4" />
          Print
        </Button>
        <Button class="flex-1" variant="secondary" @click="emit('close')">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
