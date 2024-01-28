import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import {gameAreas} from "../data/gameAreas";
import { STORE_AREA_ATTACK_STAT, STORE_GAME_STATE } from "../constants";

export const useUpdateThreatLevels = () => {
    let attackThreatState = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value
    // fill mock data of first attackers
    for (let i = 0; i < gameAreas.length; i++) {
        useAttackersAmountCorrection(gameAreas[i].areaName, i + 4);
    }
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