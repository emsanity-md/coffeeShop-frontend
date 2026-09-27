<script setup lang="ts">
/**
 * Order lifecycle indicator. Renders the real `STATUS_FLOW` and colours each
 * step from the `--status-*` tokens, so the explainer on the landing page and
 * the badge on a live order card can never disagree about the machine.
 */
import { computed } from 'vue'
import { STATUS_META, STATUS_FLOW } from '~/constants/order-status'
import type { OrderStatus } from '~/types/order'

const props = withDefaults(defineProps<{
  /** Highlights steps up to and including this status. Omit for a static map. */
  current?: OrderStatus | null
  /** Adds labels, blurbs and connecting lines — for the landing explainer. */
  detailed?: boolean
  class?: string
}>(), { current: null, detailed: false, class: '' })

const steps = computed(() =>
  STATUS_FLOW.map((status, index) => {
    const meta = STATUS_META[status]
    const reached = props.current
      ? STATUS_FLOW.indexOf(props.current) >= index
      : true
    return { status, index, meta, reached }
  }),
)

const ariaLabel = computed(() =>
  props.current
    ? `Order status: ${STATUS_META[props.current].label}`
    : 'Order lifecycle',
)
</script>

<template>
  <ol
    class="flex w-full items-start gap-1"
    :class="[props.detailed ? 'flex-col gap-0 sm:flex-row sm:gap-2' : '', props.class]"
    :aria-label="ariaLabel"
  >
    <li
      v-for="(step, i) in steps"
      :key="step.status"
      class="flex min-w-0 flex-1 items-start gap-2"
      :class="props.detailed ? 'flex-col sm:flex-row sm:items-center' : 'flex-col items-center gap-1.5'"
    >
      <!-- connector (hidden on the first step) -->
      <span
        v-if="i > 0"
        aria-hidden="true"
        class="hidden shrink-0 rounded-full sm:block"
        :class="[
          props.detailed ? 'h-px w-6' : 'h-px w-full',
          step.reached ? 'bg-primary/50' : 'bg-border',
        ]"
      />

      <div class="flex min-w-0 items-center gap-2">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors"
          :class="step.reached ? 'border-transparent' : 'border-border bg-muted'"
          :style="step.reached ? { background: `color-mix(in srgb, ${step.meta.tone} 16%, transparent)`, color: step.meta.tone } : undefined"
        >
          <component
            :is="step.meta.icon"
            class="size-3.5"
            :class="step.reached ? '' : 'text-muted-foreground'"
          />
        </span>

        <div v-if="props.detailed" class="min-w-0">
          <p
            class="text-card font-medium leading-tight"
            :class="step.reached ? 'text-foreground' : 'text-muted-foreground'"
          >
            {{ step.meta.label }}
          </p>
          <p class="text-meta truncate text-muted-foreground">{{ step.meta.blurb }}</p>
        </div>
        <span v-else class="sr-only">{{ step.meta.label }}</span>
      </div>
    </li>
  </ol>
</template>
