import { AttackThreat } from "~/types/AttackThreat";
import { gameAreas } from "~/data/gameAreas";

export const useClearGameAreas = (): AttackThreat[] => {
    let threat = [] as AttackThreat[];
    gameAreas.forEach(area => {
        threat.push({
            areaName: area.areaName,
            threatLevel: 0,
            attackersAmount: 0,
            conquered: false,
        })
    })
    return threat;
}