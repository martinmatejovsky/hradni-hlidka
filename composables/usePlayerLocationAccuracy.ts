import type {PlayerCoordinates} from "~/types/CustomTypes";
export const usePlayerLocationAccuracy = (playerLocation: PlayerCoordinates | null): number => {
    return computed ((): number => {
        return Math.round(playerLocation?.accuracy || 0);
    }).value
}