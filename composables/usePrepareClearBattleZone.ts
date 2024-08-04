import type {BattleZone, GameLocation, Invader, PlayerData, BasePolygon} from '~/types/CustomTypes';
import {LADDER_POSITIONS} from "~/constants";

export const usePrepareClearBattleZone = (zone: GameLocation): BattleZone[] => {
    let emptyZone: BattleZone[] = [];

    zone.polygons.forEach((polygon: BasePolygon): void => {
        if (polygon.polygonType === 'battleZone') {
            emptyZone.push({
                zoneName: polygon.polygonName,
                key: polygon.key,
                cornerCoordinates: polygon.cornerCoordinates,
                conquered: false,
                guardians: [] as PlayerData[],
                invaders: [] as Invader[],
                assembledInvaders: [] as Invader[],
                assaultLadder: {
                    location: polygon.assaultLadder.location,
                    content: new Array(LADDER_POSITIONS).fill(null) as Invader[]
                },
            })
        }
    })

    return emptyZone;
};
