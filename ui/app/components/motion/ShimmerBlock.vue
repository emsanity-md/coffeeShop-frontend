<script setup lang="ts">
/**
 * Image placeholder. Uses shadcn's `shimmer` utility (from
 * `shadcn-vue/tailwind.css`) so the loading state matches the rest of the
 * component library instead of being a bespoke keyframe.
 */
withDefaults(defineProps<{
  /** Tailwind aspect class, e.g. 'aspect-[4/3]'. */
  ratio?: string
  rounded?: string
}>(), { ratio: 'aspect-[4/3]', rounded: 'rounded-lg' })
</script>

<template>
  <div
    class="relative w-full overflow-hidden bg-muted"
    :class="[ratio, rounded]"
    aria-hidden="true"
  >
    <div class="shimmer absolute inset-0" />
  </div>
</template>
