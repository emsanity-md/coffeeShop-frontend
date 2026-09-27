import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },

  modules: ['shadcn-nuxt', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  components: [
    // shadcn-vue primitives are registered by `shadcn-nuxt` with an empty
    // prefix; exclude them here so the two scanners don't fight over a name.
    { path: '~/components', pathPrefix: false, ignore: ['**/ui/**'] },
  ],

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  // Fonts are self-hosted via @fontsource-variable/geist{,-mono}, imported in
  // app/assets/css/main.css. Deliberately not a CDN link or a build-time
  // provider: the POS is local-first and should render identically offline.

  image: {
    // All menu/ambience imagery is committed to public/images and served
    // through ipx, so no remote provider domains are needed.
    format: ['avif', 'webp'],
    quality: 72,

    // Named screens for `sizes` tokens. Declared explicitly (and including
    // `xs`) because Nuxt Image resolves a `vw` size against the screen width
    // registered for its token — and an *unprefixed* size is given the key
    // "1px", which resolves against a 1px screen and yields a 1px-wide
    // candidate. Prefixing every token avoids that. These must stay in step
    // with the Tailwind breakpoints (40/48/64/80rem = 640/768/1024/1280).
    screens: { xs: 420, sm: 640, md: 768, lg: 1024, xl: 1280 },

    // Every image here passes `sizes`, so its srcset is width-based. The
    // default `densities: [1, 2]` makes the module multiply each size variant
    // by each density, adding duplicate candidates that can never win a `w`
    // descriptor comparison. DPR 1.0 is correct because the width variants
    // already span the range. (An empty array is rejected by the module's own
    // checkDensities guard.)
    densities: [1],
  },
})
