import {useState} from "nuxt/app";
import type {AttackThreat} from "~/types/CustomTypes";

export const updateThreatLevels = () => {
    let attackThreatState = useState<AttackThreat[]>('attackThread').value
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