<script setup lang="ts">
/**
 * The Brewed mark — a coffee bean, drawn in-repo rather than pulled from an
 * icon set. The stock cup glyph in the nav read as "any coffee app"; a bean is
 * the one silhouette that still identifies the brand at 16px in the POS rail.
 *
 * Proportions are tuned for the smallest use (16px, nav `sm`): near-circular
 * rather than egg-shaped, because an elongated bean collapses into a sliver at
 * that size. The crease is inset from the tips so it ends rounded instead of
 * spiking out of the outline.
 *
 * Two details make it cheap to reuse anywhere:
 *  - Colour is `currentColor`, so it inherits the chip/ink it sits in and
 *    needs no light/dark variant.
 *  - The crease is a subpath of the same `evenodd` path, so it punches a hole.
 *    A mask would do the same job but would need a unique id per instance to
 *    avoid cross-talk when several marks share a page.
 *
 * No props: the root is a single `<svg>`, so sizing via `size-*` (and any
 * other attribute) falls through from the call site.
 */
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Tilted: an upright bean reads as an egg, a leaning one reads as a bean. -->
    <g transform="rotate(-15 12 12)">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="
          M12 3
          C16.64 3 20.4 7.03 20.4 12
          C20.4 16.97 16.64 21 12 21
          C7.36 21 3.6 16.97 3.6 12
          C3.6 7.03 7.36 3 12 3
          Z

          M13 4.2
          C17.4 8.2 8.6 15.8 13 19.8
          L11 19.8
          C6.6 15.8 15.4 8.2 11 4.2
          Z
        "
      />
    </g>
  </svg>
</template>
