import {computed} from "vue";
import {gameAreas} from "~/data/gameAreas";
import {useIsPositionInsidePolygon} from "./useIsInsidePolygon";
import type {PlayerCoordinates} from "~/types/CustomTypes";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates | null): string {
    return computed((): string => {
        if (!playerLocationValue) {
            return 'Není k dispozici';
        }

        const foundAres = gameAreas.filter(gameArea => {
            return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates);
        });

        if (foundAres.length === 0) {
            return 'Není v žádném polygonu';
        } else {
            return foundAres[0].areaName;
        }
    }).value;
}