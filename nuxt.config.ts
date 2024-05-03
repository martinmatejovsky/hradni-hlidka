// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL,
      socketIoUrl: process.env.SOCKET_IO_SERVER_URL,
    }
  },
  modules: [
    async (options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', config => config.plugins.push(
        vuetify()
      ))
    },
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
      },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})
