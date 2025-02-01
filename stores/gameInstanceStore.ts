import { defineStore } from 'pinia'
import type {GameLocation} from "~/types/CustomTypes";

const runtimeConfig = useRuntimeConfig()

export const useGameInstance = defineStore('gameInstance', {
  state: () => ({
  }),
  actions: {
    async postCreateNewGame(gameLocation: GameLocation, data: any): Promise<number> {
      const response: any = await $fetch( `${runtimeConfig.public.serverUrl}/api/game/createGame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameLocation: gameLocation,
          settings: data
        })
      })
      .catch((error) => {
        console.error(error);
      });

      return response.statusCode;
    }
  }
});
