// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
  ui: {
    theme: {
      colors: ['primary','secondary','neutral', 'success', 'warning', 'error']
    }
  }
})