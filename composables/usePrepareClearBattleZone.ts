import {BattleZone, BattleZonePolygon, BasePolygon, GameLocation} from '~/types/customTypes';
import {LADDER_POSITIONS, STORE_BATTLE_ZONE_API} from "~/constants";
import type {Invader, PlayerData} from "~/types/CustomTypes";

export const usePrepareClearBattleZone = (zone: GameLocation | null = null): BattleZone => {
    let emptyZone: any;

    if (zone) {
        emptyZone = {...zone} as BattleZone;
    } else {
        emptyZone = useState<BattleZone>(STORE_BATTLE_ZONE_API).value;
    }

    emptyZone.polygons.forEach((polygon: BattleZonePolygon) => {
        polygon.conquered = false;
        polygon.guardians = [] as PlayerData[];
        polygon.assembledInvaders = [] as Invader[];
        polygon.assaultLadder = new Array(LADDER_POSITIONS).fill(null) as Invader[];
    });

    return emptyZone;
};