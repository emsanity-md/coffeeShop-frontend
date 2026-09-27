<script setup lang="ts">
/** Marketing shell: site nav + scrolling page + footer. */
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-background">
    <SiteNav />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
