import {useState} from "nuxt/app";
import type {AttackThreat} from "~/types/CustomTypes";
import {gameAreas} from "../data/gameAreas";

export const updateThreatLevels = () => {
    let attackThreatState = useState<AttackThreat[]>('attackThread').value
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
                useState('gameState').value = 'lost';
            }
        });
    }, 1000);
}