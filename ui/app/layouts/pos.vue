<script setup lang="ts">
/**
 * Tool shell for /pos and /orders.
 *
 * Locks the viewport to the height and gives each pane its own scroll area, so
 * the cart can't be pushed off-screen by a long menu — the reason the POS uses
 * a full-height flex layout rather than a normal scrolling page.
 *
 * The TooltipProvider lives in app.vue, not here: /pos renders a Sheet, and a
 * sheet is portalled outside the layout subtree, so a provider scoped to the
 * layout wouldn't reach the tooltips inside it.
 */
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-background">
    <slot />
  </div>
</template>
