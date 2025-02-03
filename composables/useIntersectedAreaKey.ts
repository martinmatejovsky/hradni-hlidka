import type {PlayerCoordinates} from "~/types/CustomTypes";
import { useIsPositionInsidePolygon } from "~/composables/useIsInsidePolygon";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates): string {
    const storeGameInstance = useGameInstanceStore()
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