import type { GameInstance, PlayerCoordinates} from "~/types/CustomTypes";
import { useState } from "nuxt/app";
import { STORE_GAME_INSTANCE } from "~/constants";
import { useIsPositionInsidePolygon } from "~/composables/useIsInsidePolygon";

const currentGame = useState<GameInstance>(STORE_GAME_INSTANCE)

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates): string {
    let zones = [...currentGame.value.battleZones, ...currentGame.value.utilityZones];

    const foundAreas = zones.find(zone => {
        return useIsPositionInsidePolygon(playerLocationValue, zone.cornerCoordinates);
    });

    return foundAreas?.key || '';
}