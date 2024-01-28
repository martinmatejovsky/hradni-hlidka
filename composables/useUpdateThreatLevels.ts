import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import {STORE_AREA_ATTACK_STAT, STORE_GAME_POLYGONS, STORE_GAME_STATE} from "~/constants";
import type {GamePolygons} from "~/types/CustomTypes";

export const useUpdateThreatLevels = () => {
    let attackThreatState: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value
    let gamePolygons: GamePolygons[] = useState<GamePolygons[]>(STORE_GAME_POLYGONS).value

    // fill mock data of first attackers
    for (let i = 0; i < gamePolygons.length; i++) {
        useAttackersAmountCorrection(gamePolygons[i].areaName, i + 4);
    }

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