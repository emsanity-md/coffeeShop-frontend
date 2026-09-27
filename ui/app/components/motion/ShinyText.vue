<script setup lang="ts">
/**
 * Brand wordmark with a slow shimmer. Deliberately used in exactly two places
 * (site nav, POS rail) — a shine that runs everywhere stops meaning anything.
 * Built on shadcn's `shimmer` utility so it respects reduced-motion for free.
 */
defineProps<{ class?: string }>()
</script>

<template>
  <span
    class="shimmer relative inline-flex items-center gap-1.5 font-semibold text-primary"
    :class="class"
  >
    <slot />
  </span>
</template>
