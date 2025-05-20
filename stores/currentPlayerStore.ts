import { defineStore } from 'pinia'
import {type PlayerCoordinates, type PlayerData, WeaponType} from "~/types/CustomTypes";

export const useCurrentPlayerStore = defineStore('currentPlayer', {
  state: () =>({
    geolocationWatcher: null as (number | null),
    currentPlayer: {
      key: '',
      name: 'Beolf',
      weaponType: WeaponType.SWORD,
      location: {
        lat: 0,
        lng: 0,
        accuracy: 0,
      },
      insideZone: '',
      strength: 0,
      perks: {
        sharpSword: 0,
        boilingOil: false,
      },
      canPourBoilingOil: false,
      socketId: '',
      killScore: 0,
    } as PlayerData,
  }),
  getters: {
    playerAlreadyCarriesOilPot(): boolean {
      return this.currentPlayer.perks.boilingOil
    }
  },
  actions: {
    setCurrentPlayerKey(key: string): void {
        this.currentPlayer.key = key
    },
    setCurrentPlayerGeolocation(coordinates: PlayerCoordinates): void {
      this.currentPlayer.location = coordinates
    }
  }
});
