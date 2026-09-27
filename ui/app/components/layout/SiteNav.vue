<script setup lang="ts">
/**
 * Landing-page header. Transparent at the top of the page, then gains a
 * translucent background and a bottom rule once the user scrolls — so the hero
 * reads full-bleed but the nav never fights the content underneath it.
 */
import { ref } from 'vue'
import { ArrowRight, Menu, X } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { NAV_LINKS, ROUTES, SITE } from '~/constants/site'
import { cn } from '~/utils'

const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Any in-page jump should close the mobile menu.
watch(menuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
    :class="scrolled || menuOpen
      ? 'border-b border-border bg-background/85 backdrop-blur-md'
      : 'border-b border-transparent bg-transparent'"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
      <SiteBrand shimmer size="md" class="shrink-0" />

      <nav class="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
        <a
          v-for="link in NAV_LINKS"
          :key="link.href"
          :href="link.href"
          class="rounded-md px-3 py-2 text-body text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >{{ link.label }}</a>
      </nav>

      <div class="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Button as-child class="hidden sm:inline-flex" size="sm">
          <NuxtLink :to="ROUTES.pos">
            Open the POS
            <ArrowRight class="size-4" />
          </NuxtLink>
        </Button>
        <Button
          class="md:hidden"
          variant="ghost"
          size="icon-sm"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="size-4" />
          <Menu v-else class="size-4" />
        </Button>
      </div>
    </div>

    <!-- Mobile sheet -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="menuOpen" class="border-t border-border md:hidden">
        <nav class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
          <a
            v-for="link in NAV_LINKS"
            :key="link.href"
            :href="link.href"
            class="rounded-md px-3 py-2.5 text-section text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            @click="menuOpen = false"
          >{{ link.label }}</a>
          <Button as-child class="mt-2 w-full">
            <NuxtLink :to="ROUTES.pos" @click="menuOpen = false">
              Open the POS
              <ArrowRight class="size-4" />
            </NuxtLink>
          </Button>
        </nav>
      </div>
    </Transition>
  </header>
</template>
