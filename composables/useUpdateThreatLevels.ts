import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import {STORE_AREA_ATTACK_STAT, STORE_GAME_STATE} from "~/constants";

export const useUpdateThreatLevels = () => {
    let attackThreatState: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value

    // interval for updating threat levels
    const intervalId = setInterval((): void => {
        attackThreatState.forEach((item: AreaAttackStat): void => {
            const guardiansAmount = item.guardians.length;
            useAttackersAmountCorrection(item.areaName, -1 * guardiansAmount);
            item.threatLevel += item.attackersAmount;

            if (item.threatLevel >= 100) {
                clearInterval(intervalId); // Clear the interval
                item.threatLevel = 100;
                item.conquered = true;
                useState(STORE_GAME_STATE).value = 'lost';
            }
        });
    }, 2000);
}