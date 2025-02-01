import { defineStore } from 'pinia'
import type {GameLocation} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_APPLICATION_ERROR} from "~/constants";
const pageError = useState(STORE_APPLICATION_ERROR);

const runtimeConfig = useRuntimeConfig()

export const useStoreZones = defineStore('zones', {
  state: () => ({
    gameLocations: [] as GameLocation[],
  }),
  actions: {
    getGameLocations(): void {
      $fetch(`${runtimeConfig.public.serverUrl}/api/game-locations`)
        .then(response => {
          this.gameLocations = response as GameLocation[];
        })
        .catch((error) => {
          pageError.value = 'Nepodařilo se načíst seznam bitevních míst <br>' + error
        })
    }
  }
});
