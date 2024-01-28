import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import {STORE_AREA_ATTACK_STAT, STORE_GAME_POLYGONS, STORE_GAME_STATE} from "~/constants";
import type {GamePolygons} from "~/types/CustomTypes";

export const useUpdateThreatLevels = () => {
    let attackThreatState = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value
    let gamePolygons = useState<GamePolygons[]>(STORE_GAME_POLYGONS).value

    // fill mock data of first attackers
    for (let i = 0; i < gamePolygons.length; i++) {
        useAttackersAmountCorrection(gamePolygons[i].areaName, i + 4);
    }

    // interval for updating threat levels
    const intervalId = setInterval(() => {
        attackThreatState.forEach((item) => {
            // Update threatLevel based on attackersAmount
            item.threatLevel += item.attackersAmount;

            if (item.threatLevel >= 100) {
                clearInterval(intervalId); // Clear the interval
                item.threatLevel = 100;
                item.conquered = true;
                useState(STORE_GAME_STATE).value = 'lost';
            }
        });
    }, 1000);
}