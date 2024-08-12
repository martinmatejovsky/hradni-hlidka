import type {BattleZone, GameLocation, Invader, PlayerData, BasePolygon} from '~/types/CustomTypes';

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
                },
            })
        }
    })

    return emptyZone;
};
