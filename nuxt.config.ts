// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: false },

  ssr: false,

  build: {
    transpile: ['vuetify'],
  },

  css: [
    '~/assets/styles/main.scss',
  ],

  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL,
      socketIoUrl: process.env.SOCKET_IO_SERVER_URL,
    }
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    'nuxt3-leaflet',
  ],

  app: {
    head: {
      title: 'Hradní hlídka',
      meta: [
        { charset: 'utf-8' },
        { name: 'description', content: 'Hra pod otevřeným nebem' },
      ],
      link: [
        { rel: 'stylesheet', href: 'Control.FullScreen.css' },
      ],
    },
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  compatibilityDate: '2024-09-16',
})