<script setup lang="ts">
/**
 * Brand lockup. `shimmer` is opt-in so the shine stays meaningful — it runs on
 * the marketing header only, never in the POS rail.
 *
 * There is deliberately no `class` prop: the root is a single element, so Vue's
 * attribute fallthrough already handles class/aria from the call site.
 */
import { SITE } from '~/constants/site'

withDefaults(defineProps<{
  /** Adds the slow shimmer sweep to the wordmark. */
  shimmer?: boolean
  size?: 'sm' | 'md'
}>(), { shimmer: false, size: 'sm' })
</script>

<template>
  <NuxtLink
    to="/"
    class="group inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    :aria-label="`${SITE.fullName} — home`"
  >
    <span
      class="flex shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary transition-colors group-hover:bg-primary/20"
      :class="size === 'md' ? 'size-9' : 'size-7'"
    >
      <BrandMark :class="size === 'md' ? 'size-5' : 'size-4'" />
    </span>
    <span class="flex flex-col leading-none">
      <span
        :class="[
          'font-semibold text-primary',
          shimmer ? 'shimmer' : '',
          size === 'md' ? 'text-title' : 'text-card',
        ]"
      >{{ SITE.name }}</span>
      <span
        v-if="size === 'md'"
        class="text-label mt-0.5 text-muted-foreground"
      >Coffee House</span>
    </span>
  </NuxtLink>
</template>
