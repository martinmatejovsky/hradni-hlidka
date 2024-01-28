import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import { STORE_AREA_ATTACK_STAT } from "~/constants";

export const useAttackersAmountCorrection = (areaName: string, attackersCorrection: number): void => {
    let attackThreatState: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value
    if (attackThreatState?.length > 0) {
        const attackThreat = attackThreatState.find((attackThreat) => attackThreat.areaName === areaName);

        if (attackThreat) {
            attackThreat.attackersAmount = Math.max(0, attackThreat.attackersAmount + attackersCorrection);
        }
    }
}