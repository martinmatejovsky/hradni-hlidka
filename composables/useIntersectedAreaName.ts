import {computed} from "vue";
import {gameAreas} from "~/data/gameAreas";
import {useIsPositionInsidePolygon} from "./useIsInsidePolygon";
import type {PlayerCoordinates} from "~/types/CustomTypes";

export function useIntersectedAreaName(playerLocationValue: PlayerCoordinates) {
    const intersectedAreaName = computed(() => {
        return gameAreas.filter(gameArea  => {
            return useIsPositionInsidePolygon(playerLocationValue, gameArea.areaCornerCoordinates)
        }).map(gameArea => {
            return gameArea.areaName
        }).join(', ')
    })

    return {intersectedAreaName}
}