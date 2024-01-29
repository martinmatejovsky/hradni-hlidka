import type {AreaAttackStat, GamePolygons, Invader, PlayerData} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_GAME_POLYGONS} from "~/constants";

export const useClearGameAreas = (): AreaAttackStat[] => {
    let threat = [] as AreaAttackStat[];
    useState<GamePolygons[]>(STORE_GAME_POLYGONS).value.forEach(area => {
        threat.push({
            areaName: area.areaName,
            threatLevel: 0,
            attackersAmount: 0,
            conquered: false,
            guardians: [] as PlayerData[],
            assembledInvaders: [] as Invader[],
        })
    })
    return threat;
}