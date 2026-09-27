<script setup lang="ts">
/**
 * Unified POS header.
 *
 * The old layout split this in two: the brand sat in the sidebar and the search
 * field sat above the menu grid, so on wide screens they were a full pane apart
 * and the eye had to travel. One bar keeps them together.
 */
import { Menu, PanelRightOpen, ReceiptText, Search, UserPlus, X } from '@lucide/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { ROUTES } from '~/constants/site'

defineProps<{
  search: string
  cartCount: number
  customerCount: number
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'open-categories'): void
  (e: 'open-cart'): void
  (e: 'open-customers'): void
}>()
</script>

<template>
  <header
    class="flex shrink-0 items-center gap-2 border-b border-border bg-card/85 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-4"
  >
    <SiteBrand class="hidden shrink-0 lg:flex" />

    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Open categories"
      class="shrink-0 lg:hidden"
      @click="emit('open-categories')"
    >
      <Menu class="size-4" />
    </Button>

    <InputGroup class="min-w-0 flex-1 lg:max-w-md">
      <InputGroupAddon>
        <Search class="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        :model-value="search"
        type="search"
        placeholder="Search the menu…"
        aria-label="Search the menu"
        @update:model-value="emit('update:search', $event)"
      />
      <InputGroupAddon v-if="search" class="hidden sm:flex">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Clear search"
          @click="emit('update:search', '')"
        >
          <X class="size-3.5" />
        </Button>
      </InputGroupAddon>
    </InputGroup>

    <div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="secondary" size="sm" @click="emit('open-customers')">
            <UserPlus class="size-4" />
            <span class="hidden sm:inline">Customers</span>
            <Badge
              v-if="customerCount"
              variant="default"
              class="tnum ml-0.5 size-4 px-1 text-[10px]"
            >{{ customerCount }}</Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Name the people at this table</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button as-child variant="secondary" size="sm">
            <NuxtLink :to="ROUTES.orders">
              <ReceiptText class="size-4" />
              <span class="hidden sm:inline">Orders</span>
            </NuxtLink>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Order history</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Open cart"
            class="relative lg:hidden"
            @click="emit('open-cart')"
          >
            <PanelRightOpen class="size-4" />
            <Badge
              v-if="cartCount"
              variant="default"
              class="tnum absolute -right-1 -top-1 size-4 px-1 text-[10px]"
            >{{ cartCount > 99 ? '99+' : cartCount }}</Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Review order</TooltipContent>
      </Tooltip>
    </div>
  </header>
</template>
