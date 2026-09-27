<script setup lang="ts">
import { themeNoFlashScript } from '~/composables/useTheme'
import { TooltipProvider } from '~/components/ui/tooltip'

/**
 * Applies the persisted theme class before first paint.
 *
 * Injected via `useHead` rather than an inline <script> in the template: Vue
 * strips side-effect tags from component templates, so the template version
 * never rendered and the app fell back to a light-first flash on every load.
 *
 * A synchronous inline script in <head> runs before the body paints, which is
 * exactly what's needed — a deferred or bundled version would be too late.
 * `innerHTML` is used because Unhead escapes `textContent` but writes
 * `innerHTML` verbatim.
 */
useHead({
  script: [{ innerHTML: themeNoFlashScript }],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- One provider for the whole app. TooltipRoot injects from it, so any
         route using <Tooltip> without this ancestor throws. -->
    <TooltipProvider :delay-duration="250">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </TooltipProvider>

    <Toaster position="bottom-right" :close-button="true" />
  </div>
</template>
