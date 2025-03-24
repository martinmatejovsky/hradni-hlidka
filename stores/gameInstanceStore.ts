import { defineStore } from 'pinia'
import type {GameLocation, GameInstance, Settings} from "~/types/CustomTypes";

const runtimeConfig = useRuntimeConfig()

export const useGameInstanceStore = defineStore('gameInstance', {
  state: () => ({
    gameInstance: {} as GameInstance,
    gameSettings: {} as Settings,
    canonUsage: {
      targetZoneId: '',
    }
  }),
  actions: {
    setGameInstance(gameInstance: GameInstance): void {
      this.gameInstance = gameInstance
    },
    async getGameInstance(): Promise<void> {
      try {
        const game = await $fetch(`${runtimeConfig.public.serverUrl}/api/game`, {
          method: 'GET',
        }) as GameInstance

        this.setGameInstance(game)
      } catch (error) {
        console.error(error);
      }
    },
    async getGameSettings(): Promise<void> {
      $fetch(`${runtimeConfig.public.serverUrl}/api/game/settings`, {
        method: 'GET',
      })
      .then(response => {
        this.gameSettings = <Settings>response
      })
    },
    async postCreateNewGame(gameLocation: GameLocation, data: any): Promise<number> {
      try {
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

        this.gameInstance = response.gameInstance as GameInstance;
        return response.statusCode;
      } catch (error) {
        console.error(error);
        return 500;
      }
    }
  }
});
