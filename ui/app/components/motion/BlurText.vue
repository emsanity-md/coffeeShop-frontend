<script setup lang="ts">
/**
 * Blur-to-sharp entrance for headlines. One element rather than per-character,
 * so it stays cheap on long strings.
 */
import { motion, useReducedMotion } from 'motion-v'
import { MOTION } from '~/composables/useMotionPreset'

withDefaults(defineProps<{
  delay?: number
  /** Blur radius in px at the start. */
  from?: number
  as?: string
}>(), { delay: 0, from: 10, as: 'h1' })

const reduced = useReducedMotion()
</script>

<template>
  <component
    :is="motion[as as 'h1']"
    :initial="reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${from}px)`, y: 8 }"
    :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
    :transition="{ duration: MOTION.duration.slower, ease: MOTION.ease.warm, delay }"
  >
    <slot />
  </component>
</template>
