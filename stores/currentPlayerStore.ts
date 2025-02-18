import { defineStore } from 'pinia'
import type {PlayerCoordinates, PlayerData} from "~/types/CustomTypes";

export const useCurrentPlayerStore = defineStore('currentPlayer', {
  state: () =>({
    geolocationWatcher: null as (number | null),
    currentPlayer: {
      name: 'Beolf',
      key: '',
      location: {
        lat: 0,
        lng: 0,
        accuracy: 0,
      },
      insideZone: '',
      strength: 0,
      perks: {
        sharpSword: 0,
      },
      socketId: '',
    } as PlayerData,
  }),
  actions: {
    setCurrentPlayerGeolocation(coordinates: PlayerCoordinates): void {
      this.currentPlayer.location = coordinates
    }
  }
});
