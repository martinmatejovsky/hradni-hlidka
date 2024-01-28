import { AreaAttackStat } from "~/types/customTypes";
import { gameAreas } from "~/data/gameAreas";
import {PlayerData} from "../types/CustomTypes";

export const useClearGameAreas = (): AreaAttackStat[] => {
    let threat = [] as AreaAttackStat[];
    gameAreas.forEach(area => {
        threat.push({
            areaName: area.areaName,
            threatLevel: 0,
            attackersAmount: 0,
            conquered: false,
            guardians: [] as PlayerData[],
        })
    })
    return threat;
}