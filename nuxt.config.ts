// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  runtimeConfig: {
    public: {
      dbHost: process.env.NUXT_DB_HOST,
      dbKey: process.env.NUXT_DB_KEY,
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
