import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import { STORE_AREA_ATTACK_STAT } from "~/constants";

export const useAttackersAmountCorrection = (areaName: string, attackersCorrection: number): void => {
    let attackThreatState = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value
    if (attackThreatState?.length > 0) {
        attackThreatState.find(attackThreat => attackThreat.areaName === areaName).attackersAmount += attackersCorrection;
    }
}