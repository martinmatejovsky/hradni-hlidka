import {computed} from 'vue';
import type {PlayerCoordinates} from "~/types/CustomTypes";
export const usePlayerLocationAccuracy = (playerLocation: PlayerCoordinates): { accuracy: ComputedRef<number> }  => {
    const playerLocationAccuracy: number = playerLocation.accuracy
    const accuracy = computed<number>(() => Math.round(playerLocationAccuracy));

    return { accuracy };
}