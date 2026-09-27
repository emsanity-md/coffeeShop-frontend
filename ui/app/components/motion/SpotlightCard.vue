<script setup lang="ts">
/**
 * Pointer-tracked spotlight. Writes `--spot-x` / `--spot-y` as CSS custom
 * properties; the `spotlight` utility in main.css paints the glow. Kept in CSS
 * rather than motion-v because it must react to every pointer move without
 * involving the JS animation loop.
 */
import { ref } from 'vue'

const el = ref<HTMLElement | null>(null)
const active = ref(false)

function onMove(event: PointerEvent) {
  const node = el.value
  if (!node) return
  const rect = node.getBoundingClientRect()
  node.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  node.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

function onEnter() { active.value = true }
function onLeave() { active.value = false }
</script>

<template>
  <div
    ref="el"
    class="spotlight"
    :class="active && 'spotlight-hover'"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <slot />
  </div>
</template>
