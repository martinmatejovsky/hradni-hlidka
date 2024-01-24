import type {PlayerCoordinates} from "~/types/CustomTypes";
export const usePlayerLocationAccuracy = (playerLocation: PlayerCoordinates | null): number => {
    return Math.round(playerLocation.value?.location.accuracy || 0);
}