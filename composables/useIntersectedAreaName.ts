import type {PlayerCoordinates} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import type {BattleZone} from "~/types/CustomTypes";
import {STORE_BATTLE_ZONE_API} from "~/constants";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    } else if (!useState<BattleZone>(STORE_BATTLE_ZONE_API).value) {
        return 'Herní zóna není k dispozici';
    }

    const foundAreas = useState<BattleZone>(STORE_BATTLE_ZONE_API).value.polygons.filter(gameArea => {
        return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return '';
    } else {
        return foundAreas[0].areaName;
    }
}