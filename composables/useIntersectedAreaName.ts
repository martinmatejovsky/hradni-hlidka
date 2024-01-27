import {gameAreas} from "~/data/gameAreas";
import type {PlayerCoordinates} from "~/types/CustomTypes";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    }

    const foundAreas = gameAreas.filter(gameArea => {
        return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return 'Hráč není v žádném polygonu';
    } else {
        return foundAreas[0].areaName;
    }
}