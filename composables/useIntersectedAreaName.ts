import type {PlayerCoordinates} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import type {BattleZone} from "~/types/CustomTypes";
import {STORE_BATTLE_ZONE} from "~/constants";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    }

    const foundAreas = useState<BattleZone>(STORE_BATTLE_ZONE).value.polygons.filter(gameArea => {
        return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return '';
    } else {
        return foundAreas[0].areaName;
    }
}