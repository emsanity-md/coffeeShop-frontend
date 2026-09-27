<script setup lang="ts">
/**
 * One entry in a `<StaggerList>`. The variant names must match the container's
 * for motion to cascade the timing.
 */
import { motion, useReducedMotion } from 'motion-v'
import { MOTION } from '~/composables/useMotionPreset'

withDefaults(defineProps<{ as?: string }>(), { as: 'div' })

const reduced = useReducedMotion()
</script>

<template>
  <component
    :is="motion[as as 'div']"
    :variants="{
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: MOTION.duration.slow, ease: MOTION.ease.warm } },
    }"
  >
    <slot />
  </component>
</template>
