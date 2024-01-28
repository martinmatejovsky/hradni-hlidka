import type {PlayerCoordinates} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import type {GamePolygons} from "~/types/CustomTypes";
import {STORE_GAME_POLYGONS} from "~/constants";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    }

    const foundAreas = useState<GamePolygons[]>(STORE_GAME_POLYGONS).value.filter(gameArea => {
        return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return '';
    } else {
        return foundAreas[0].areaName;
    }
}