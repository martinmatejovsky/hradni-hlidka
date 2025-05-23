import { defineStore } from 'pinia'
import type {GameLocation, GameInstance, Settings} from "~/types/CustomTypes";

const runtimeConfig = useRuntimeConfig()

export const useGameInstanceStore = defineStore('gameInstance', {
  state: () => ({
    gameInstance: {} as GameInstance,
    gameSettings: {} as Settings,
    cannonUsage: {
      targetZoneId: '',
      loadingProgress: 0,
      cannonLoadingInterval: null as NodeJS.Timer | null,
    },
  }),
  getters: {
    getIsCannonReadyToFire(): boolean {
      return this.cannonUsage.loadingProgress === this.gameSettings.cannonLoadingTime;
    }
  },
  actions: {
    setCannonLoadingInterval(): void {
      this.cannonUsage.cannonLoadingInterval = setInterval(() => {
        if (this.cannonUsage.loadingProgress < this.gameSettings.cannonLoadingTime) {
          this.increaseCannonProgress();
        } else {
          clearInterval(this.cannonUsage.cannonLoadingInterval);
          this.cannonUsage.cannonLoadingInterval = null;
        }
      }, 1000);
    },
    clearCannonLoadingInterval(): void {
        if (this.cannonUsage.cannonLoadingInterval) {
            clearInterval(this.cannonUsage.cannonLoadingInterval);
            this.cannonUsage.cannonLoadingInterval = null;
        }
    },
    resetCannonProperties() {
      this.cannonUsage.targetZoneId = '';
      this.cannonUsage.loadingProgress = 0;
    },
    increaseCannonProgress() {
      if (this.cannonUsage.loadingProgress < this.gameSettings.cannonLoadingTime) {
        this.cannonUsage.loadingProgress++;
      }
    },
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
