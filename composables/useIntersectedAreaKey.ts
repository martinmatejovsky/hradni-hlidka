import type {PlayerCoordinates} from "~/types/CustomTypes";
import { useIsPositionInsidePolygon } from "~/composables/useIsInsidePolygon";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";

// Pinia store
const storeGameInstance = useGameInstanceStore()

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates): string {
    let zones = [...storeGameInstance.gameInstance.battleZones, ...storeGameInstance.gameInstance.utilityZones];

    const foundAreas = zones.find(zone => {
        return useIsPositionInsidePolygon(playerLocationValue, zone.cornerCoordinates);
    });

    return foundAreas?.key || '';
}