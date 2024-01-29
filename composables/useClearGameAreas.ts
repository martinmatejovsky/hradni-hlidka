import type { AreaAttackStat, GamePolygons, Invader, PlayerData } from "~/types/CustomTypes";
import { useState } from "nuxt/app";
import {LADDER_POSITIONS, STORE_GAME_POLYGONS} from "~/constants";

export const useClearGameAreas = (): AreaAttackStat[] => {
    let threat: AreaAttackStat[] = [];

    useState<GamePolygons[]>(STORE_GAME_POLYGONS).value.forEach(area => {
        threat.push({
            areaName: area.areaName,
            threatLevel: 0,
            attackersAmount: 0, // remove?
            conquered: false,
            guardians: [] as PlayerData[],
            assembledInvaders: [] as Invader[],
            assaultLadder: new Array(LADDER_POSITIONS).fill(null) as Invader[],
        });
    });
    return threat;
};