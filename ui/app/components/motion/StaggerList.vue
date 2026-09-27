<script setup lang="ts">
/**
 * Cascading list container. Pairs with `<StaggerItem>`: motion propagates the
 * `hidden` → `visible` variant down, so children only need to declare their own
 * variant and pick up the cascade for free.
 */
import { motion, useReducedMotion } from 'motion-v'

const props = withDefaults(defineProps<{
  /** Seconds between consecutive children. */
  stagger?: number
  as?: string
}>(), { stagger: 0.045, as: 'div' })

const reduced = useReducedMotion()
</script>

<template>
  <component
    :is="motion[props.as as 'div']"
    :initial="reduced ? { opacity: 0 } : 'hidden'"
    :while-in-view="reduced ? { opacity: 1 } : 'visible'"
    :viewport="{ once: true, margin: '-56px' }"
    :variants="{
      hidden: {},
      visible: { transition: { staggerChildren: reduced ? 0 : props.stagger } },
    }"
  >
    <slot />
  </component>
</template>
