import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
  },
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://senseofjewels.com',
    name: 'Sense of Jewels',
  },
  sitemap: {
    strictNuxtContentPaths: false,
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'robots', content: 'index, follow' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:site_name', content: 'Sense of Jewels' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
    server: {
      allowedHosts: true,
    },
  },
  nitro: {
    trustProxy: true,
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '0 23 * * *': ['backup:database'],
    },
  },
  runtimeConfig: {
    authEmail: process.env.NUXT_AUTH_EMAIL || '',
    authPassword: process.env.NUXT_AUTH_PASSWORD || '',
    midtransServerKey: process.env.NUXT_MIDTRANS_SERVER_KEY || '',
    rajaongkirApiKey: process.env.NUXT_RAJAONGKIR_API_KEY || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://senseofjewels.com',
      midtransClientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
      midtransIsProduction: process.env.NUXT_PUBLIC_MIDTRANS_IS_PRODUCTION || 'false',
    },
  },
})
