<script setup lang="ts">
/**
 * Scroll-triggered reveal. Wraps `motion` with the shared fade-up so call sites
 * don't repeat `initial`/`whileInView`/`transition` on every section.
 */
import { motion } from 'motion-v'
import { useReducedMotion } from 'motion-v'
import { fadeUp } from '~/composables/useMotionPreset'

const props = withDefaults(defineProps<{
  /** Seconds to wait before revealing — used to cascade a group. */
  delay?: number
  /** Travel distance in px. Lower reads calmer. */
  distance?: number
  as?: string
}>(), { delay: 0, distance: 14, as: 'div' })

const reduced = useReducedMotion()
</script>

<template>
  <component
    :is="motion[props.as as 'div']"
    :initial="reduced ? { opacity: 0 } : { opacity: 0, y: props.distance }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-64px' }"
    :transition="fadeUp(props.delay)"
  >
    <slot />
  </component>
</template>
