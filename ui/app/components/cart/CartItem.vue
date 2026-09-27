<script setup lang="ts">
/**
 * A single line in the cart.
 *
 * Compact card layout rather than the previous image tile: the controls need a
 * predictable hit target on a phone, and a 4:3 photo per line made the list
 * twice as long as it needed to be.
 */
import { computed } from 'vue'
import { Minus, Plus, X } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { PHOTOS } from '~/data/photos'
import type { CartItem } from '~/types/menu'
import { formatPeso } from '~/utils'

const props = defineProps<{ item: CartItem }>()

const emit = defineEmits<{
  (e: 'changeQty', id: number, delta: number): void
  (e: 'remove', id: number): void
}>()

// Resolve through the manifest rather than rebuilding the path by hand —
// a photo could live in either image group, and the manifest is the record.
const image = computed(() => (props.item.image ? PHOTOS[props.item.image] : undefined))
</script>

<template>
  <div class="group flex items-center gap-2.5 rounded-lg border border-border bg-card p-2">
    <NuxtImg
      v-if="image"
      :src="image.src"
      alt=""
      :width="image.width"
      :height="image.height"
      sizes="xs:48px"
      class="size-12 shrink-0 rounded-md object-cover"
      loading="lazy"
      aria-hidden="true"
    />
    <div
      v-else
      class="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-lg"
      aria-hidden="true"
    >
      {{ props.item.icon }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-card leading-tight">{{ props.item.name }}</p>
      <p class="tnum mt-0.5 text-meta text-muted-foreground">
        {{ formatPeso(props.item.price) }} each
      </p>
    </div>

    <!-- Quantity stepper -->
    <div class="flex shrink-0 items-center gap-0.5 rounded-md border border-border">
      <Button
        variant="ghost"
        size="icon-xs"
        :aria-label="`Decrease ${props.item.name}`"
        @click="emit('changeQty', props.item.id, -1)"
      >
        <Minus class="size-3.5" />
      </Button>
      <span
        class="tnum min-w-6 text-center text-body font-semibold tabular-nums"
        :aria-label="`Quantity ${props.item.qty}`"
      >{{ props.item.qty }}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        :aria-label="`Increase ${props.item.name}`"
        @click="emit('changeQty', props.item.id, 1)"
      >
        <Plus class="size-3.5" />
      </Button>
    </div>

    <span class="tnum w-16 shrink-0 text-right font-mono text-body font-semibold">
      {{ formatPeso(props.item.price * props.item.qty) }}
    </span>

    <Button
      variant="ghost"
      size="icon-xs"
      :aria-label="`Remove ${props.item.name}`"
      class="shrink-0 text-muted-foreground hover:text-destructive"
      @click="emit('remove', props.item.id)"
    >
      <X class="size-3.5" />
    </Button>
  </div>
</template>
