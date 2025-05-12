import { defineStore } from 'pinia'
import { useIntersectedAreaKey } from "~/composables/useIntersectedAreaKey";
import { useCurrentPlayerStore } from "~/stores/currentPlayerStore";
import { useGameInstanceStore } from "~/stores/gameInstanceStore";

export const useZoneIntersectionStore = defineStore('zoneIntersection', {
  state: () => ({
    // Empty state since we'll use getters and other stores
  }),
  getters: {
    /**
     * Get the key of the area that the current player is intersecting with
     * @returns The key of the intersected area or empty string if none
     */
    keyOfIntersectedArea(): string {
      const currentPlayerStore = useCurrentPlayerStore();
      const playerLocation = currentPlayerStore.currentPlayer.location;

      if (playerLocation?.lat && playerLocation?.lng) {
        return useIntersectedAreaKey(playerLocation);
      } else {
        return '';
      }
    },

    /**
     * Get the name of the area that the current player is intersecting with
     * @returns The name of the intersected area or empty string if none
     */
    nameOfIntersectedArea(): string {
      const gameInstanceStore = useGameInstanceStore();
      const battleZones = gameInstanceStore.gameInstance.battleZones;
      const utilityZones = gameInstanceStore.gameInstance.utilityZones;

      if (!battleZones || !utilityZones) {
        return '';
      }

      const allAreas = [...battleZones, ...utilityZones];
      const area = allAreas.find(zone => zone.key === this.keyOfIntersectedArea);
      return area?.zoneName || '';
    },

    /**
     * Check if the current intersected area is a smithy
     * @returns True if the current area is a smithy, false otherwise
     */
    isInSmithyArea(): boolean {
      const gameInstanceStore = useGameInstanceStore();
      const utilityZones = gameInstanceStore.gameInstance.utilityZones;

      if (!utilityZones) {
        return false;
      }

      const area = utilityZones.find(zone => zone.key === this.keyOfIntersectedArea);
      return area?.polygonType === 'smithy';
    }
  },
  actions: {
    /**
     * Update the player's zone in the currentPlayerStore when it changes
     * This action can be called from watchers in components
     */
    updatePlayerZone(): void {
      const currentPlayerStore = useCurrentPlayerStore();
      const playerKey = currentPlayerStore.currentPlayer.key;

      if (playerKey) {
        currentPlayerStore.currentPlayer.insideZone = this.keyOfIntersectedArea;
      }
    }
  }
});