<script setup lang="ts">
/**
 * Horizontal filter pills. Replaces the ad-hoc row of ghost buttons the POS and
 * the orders page each used to roll.
 *
 * Built on shadcn's ToggleGroup so keyboard behaviour (arrow keys, roving
 * focus) and the `aria-*` wiring come from reka-ui rather than being
 * hand-rolled.
 */
import { ToggleGroup } from '~/components/ui/toggle-group'
import { ToggleGroupItem } from '~/components/ui/toggle-group'
import { cn } from '~/utils'
import type { Component } from 'vue'

export interface PillOption {
  value: string
  label: string
  icon?: Component
  /** Trailing count chip, e.g. the number of orders in this status. */
  count?: number
  /** Overrides the pill's accent — used to tint by order status. */
  tone?: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: PillOption[]
  size?: 'sm' | 'default'
  ariaLabel?: string
  class?: string
}>(), { size: 'sm', ariaLabel: 'Filter', class: '' })

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onChange(value: unknown) {
  // reka-ui emits `string | string[]`; an empty array means the user toggled
  // the active pill off. Treat that as a no-op so the filter always has a value.
  const next = Array.isArray(value) ? value[0] : value
  if (typeof next === 'string' && next) emit('update:modelValue', next)
}
</script>

<template>
  <ToggleGroup
    :model-value="props.modelValue"
    type="single"
    :aria-label="props.ariaLabel"
    variant="outline"
    :class="cn('flex w-max min-w-0 gap-1.5', props.class)"
    @update:model-value="onChange"
  >
    <ToggleGroupItem
      v-for="opt in props.options"
      :key="opt.value"
      :value="opt.value"
      :size="props.size"
      :aria-label="opt.count !== undefined ? `${opt.label}, ${opt.count}` : opt.label"
      class="anim-press gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors"
      :style="opt.tone ? { color: opt.tone } : undefined"
    >
      <component :is="opt.icon" v-if="opt.icon" class="size-3.5 shrink-0" />
      <span>{{ opt.label }}</span>
      <span
        v-if="opt.count !== undefined"
        class="tnum ml-0.5 rounded-full bg-muted px-1.5 py-px text-[10px] leading-4 text-muted-foreground"
      >{{ opt.count }}</span>
    </ToggleGroupItem>
  </ToggleGroup>
</template>
