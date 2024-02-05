import type {PlayerCoordinates} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import type {BattleZone} from "~/types/CustomTypes";
import {STORE_BATTLE_ZONES} from "~/constants";

export function useIntersectedAreaKey(playerLocationValue: PlayerCoordinates | undefined): string {
    if (!playerLocationValue) {
        return 'Pozice hráče není k dispozici';
    } else if (!useState<BattleZone>(STORE_BATTLE_ZONES).value) {
        return 'Herní zóna není k dispozici';
    }

    const foundAreas = useState<BattleZone[]>(STORE_BATTLE_ZONES).value.filter(zone => {
        return useIsPositionInsidePolygon(playerLocationValue, zone.cornerCoordinates);
    });

    if (foundAreas.length === 0) {
        return '';
    } else {
        return foundAreas[0].key;
    }
}