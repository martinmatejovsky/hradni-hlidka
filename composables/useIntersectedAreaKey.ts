import type {BattleZone, PlayerCoordinates} from "~/types/CustomTypes";

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    } else if (!useGetterBattleZones.value) {
        return 'Herní zóna není k dispozici';
    }

    const foundAreas: BattleZone[] = useGetterBattleZones.value.filter(zone => {
        return useIsPositionInsidePolygon(playerLocationValue, zone.cornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return '';
    } else {
        return foundAreas[0].key;
    }
}