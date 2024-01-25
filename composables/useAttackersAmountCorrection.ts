import {useState} from "nuxt/app";
import type {AttackThreat} from "~/types/CustomTypes";

export const useAttackersAmountCorrection = (areaName: string, attackersCorrection: number): void => {
    let attackThreatState = useState<AttackThreat[]>('attackThread').value
    console.log('attackThreat ++')
    console.log(attackThreatState)
    console.log(attackThreatState.length)
    if (attackThreatState?.length > 0) {
        attackThreatState.find(attackThreat => attackThreat.areaName === areaName).attackersAmount += attackersCorrection;
    }
}