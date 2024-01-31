import type { AreaAttackStat, BattleZone, Invader, PlayerData } from "~/types/CustomTypes";
import { useState } from "nuxt/app";
import {LADDER_POSITIONS, STORE_BATTLE_ZONE} from "~/constants";

export const useClearGameAreas = (): AreaAttackStat[] => {
    let threat: AreaAttackStat[] = [];

    useState<BattleZone>(STORE_BATTLE_ZONE).value.polygons.forEach(area => {
        threat.push({
            areaName: area.areaName,
            conquered: false,
            guardians: [] as PlayerData[],
            assembledInvaders: [] as Invader[],
            assaultLadder: new Array(LADDER_POSITIONS).fill(null) as Invader[],
        });
    });
    return threat;
};