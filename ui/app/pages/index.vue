<script setup lang="ts">
import { SITE } from '~/constants/site'
import menuData from '~/data/menu.json'

definePageMeta({ layout: 'landing' })

useSeoMeta({
  title: `${SITE.fullName} — ${SITE.tagline}`,
  description: SITE.description,
  ogTitle: SITE.fullName,
  ogDescription: SITE.description,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

/**
 * Machine-readable menu summary.
 *
 * Declared via `useHead` rather than an inline <script> in the template: Vue
 * strips side-effect tags (<script>/<style>) from component templates, so the
 * template version produced no JSON-LD at all.
 *
 * `innerHTML` is deliberate — Unhead escapes `textContent` but writes
 * `innerHTML` raw, and escaped JSON-LD is not valid JSON-LD.
 */
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: SITE.fullName,
        description: SITE.description,
        hasMenuItem: menuData.map(item => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.desc,
          offers: { '@type': 'Offer', price: item.price.toFixed(2), priceCurrency: 'PHP' },
        })),
      }),
    },
  ],
})
</script>

<template>
  <div>
    <HeroSection />
    <FeaturesBento />
    <MenuShowcase />
    <HowItWorks />
    <LifecycleSection />
    <CtaBand />
  </div>
</template>
