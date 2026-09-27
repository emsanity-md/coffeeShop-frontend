<script setup lang="ts">
/**
 * Count-up number. Animates from `from` to the current `value` with an ease-out
 * curve, and renders the raw target immediately when the visitor has asked for
 * reduced motion.
 */
import { computed, ref, watch } from 'vue'
import { animate, useReducedMotion } from 'motion-v'

const props = withDefaults(defineProps<{
  value: number
  /** Formatter — receives the tweened value. Defaults to a rounded integer. */
  format?: (n: number) => string
  duration?: number
  from?: number
}>(), {
  duration: 0.7,
  from: 0,
  format: (n: number) => Math.round(n).toLocaleString('en-PH'),
})

const reduced = useReducedMotion()
const current = ref(props.from)
let controls: { stop: () => void } | null = null

watch(() => props.value, (next) => {
  controls?.stop()

  if (reduced.value) {
    current.value = next
    return
  }

  controls = animate(current.value, next, {
    duration: props.duration,
    ease: [0.25, 1, 0.5, 1],
    onUpdate: v => { current.value = v },
  })
}, { immediate: true })

onBeforeUnmount(() => controls?.stop())

const display = computed(() => props.format(current.value))
</script>

<template>
  <span class="tnum">{{ display }}</span>
</template>
