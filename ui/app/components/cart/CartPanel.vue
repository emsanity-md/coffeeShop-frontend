<script setup lang="ts">
/**
 * Cart panel. Rendered as the desktop right-hand column and inside the mobile
 * sheet, so it takes its height from its container rather than the viewport.
 */
import { ShoppingBag, Trash2, X } from '@lucide/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import type { CartItem, Customer } from '~/types/menu'
import type { CustomerReceipt } from '~/types/order'
import { formatPeso } from '~/utils'

const props = withDefaults(defineProps<{
  cartItems: CartItem[]
  cartCount: number
  total: number
  customers: Customer[]
  receipts?: CustomerReceipt[]
  canPlaceOrder?: boolean
  /** Set when rendered inside the mobile sheet, to show the close button. */
  inSheet?: boolean
}>(), { receipts: () => [], canPlaceOrder: false, inSheet: false })

const emit = defineEmits<{
  (e: 'changeQty', id: number, delta: number): void
  (e: 'remove', id: number): void
  (e: 'clearCart'): void
  (e: 'placeOrder'): void
  (e: 'viewReceipt', receipt: CustomerReceipt): void
  (e: 'closeSheet'): void
}>()
</script>

<template>
  <aside
    class="flex h-full w-full flex-col border-border bg-card lg:w-[23rem] lg:border-l xl:w-[24rem]"
    aria-label="Current order"
  >
    <header class="flex shrink-0 items-center gap-2 border-b border-border p-3.5">
      <ShoppingBag class="size-4 shrink-0 text-primary" />
      <h2 class="min-w-0 flex-1 truncate text-section">Your order</h2>

      <Badge v-if="props.cartCount > 0" variant="secondary" class="tnum shrink-0">
        {{ props.cartCount }}
      </Badge>

      <Tooltip v-if="props.cartItems.length">
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Clear the whole order"
            class="shrink-0 text-muted-foreground hover:text-destructive"
            @click="emit('clearCart')"
          >
            <Trash2 class="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Clear order</TooltipContent>
      </Tooltip>

      <Button
        v-if="props.inSheet"
        variant="ghost"
        size="icon-xs"
        aria-label="Close cart"
        class="-mr-1 shrink-0 lg:hidden"
        @click="emit('closeSheet')"
      >
        <X class="size-4" />
      </Button>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
      <Empty v-if="!props.cartItems.length" class="border-0 py-10">
        <EmptyHeader>
          <EmptyMedia class="bg-muted text-muted-foreground">
            <ShoppingBag class="size-5" />
          </EmptyMedia>
          <EmptyTitle class="text-card">No items yet</EmptyTitle>
          <EmptyDescription class="text-meta">
            Tap a menu card to start the order.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <TransitionGroup v-else name="list" tag="ul" class="relative flex flex-col gap-2">
        <li v-for="item in props.cartItems" :key="item.id">
          <CartItem
            :item="item"
            @change-qty="(id, delta) => emit('changeQty', id, delta)"
            @remove="emit('remove', $event)"
          />
        </li>
      </TransitionGroup>
    </div>

    <CartFooter
      v-if="props.cartItems.length"
      :items="props.cartItems"
      :total="props.total"
      :customers="props.customers"
      :receipts="props.receipts"
      :can-place-order="props.canPlaceOrder"
      @place-order="emit('placeOrder')"
      @view-receipt="emit('viewReceipt', $event)"
    />

    <p
      v-else-if="props.cartItems.length === 0 && props.customers.length"
      class="shrink-0 border-t border-border p-3.5 text-meta text-muted-foreground"
    >
      {{ props.customers.length }} customer{{ props.customers.length === 1 ? '' : 's' }} added,
      waiting on items.
    </p>
  </aside>
</template>
