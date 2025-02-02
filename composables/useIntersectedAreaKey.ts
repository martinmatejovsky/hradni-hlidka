import type {PlayerCoordinates} from "~/types/CustomTypes";
import { useIsPositionInsidePolygon } from "~/composables/useIsInsidePolygon";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";

// Pinia store
const storeGameInstance = useGameInstanceStore()

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates): string {
    if (!storeGameInstance.gameInstance?.battleZones) {
        return '';
    }

    let zones = [...storeGameInstance.gameInstance.battleZones, ...storeGameInstance.gameInstance.utilityZones];

    if (!zones.length) {
        return '';
    }

    const foundAreas = zones.find(zone => {
        return useIsPositionInsidePolygon(playerLocationValue, zone.areaOfAcceptedPresence);
    });

    return foundAreas?.key || '';
}