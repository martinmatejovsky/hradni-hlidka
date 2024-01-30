import {useState} from "nuxt/app";
import type {AreaAttackStat} from "~/types/CustomTypes";
import {ATTACK_TEMPO, LADDER_POSITIONS, STORE_AREA_ATTACK_STAT, STORE_GAME_STATE} from "~/constants";

const delayBetweenIterations = Math.floor(ATTACK_TEMPO / (LADDER_POSITIONS * 2));

export const useMoveInvadersOnLadder = (): void => {
    let areas: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value;

    areas.forEach((area: AreaAttackStat): void => {
        for (let i = LADDER_POSITIONS - 1; i >= 0; i--) {
            if (useState(STORE_GAME_STATE).value !== 'running') {
                return;
            }
             // Adjust the delay based on the iteration index
            setTimeout(() => {
                if (i > 0) {
                    area.assaultLadder[i] = area.assaultLadder[i - 1];
                    area.assaultLadder[i - 1] = null;
                }

                // last iteration of the inner loop in ladder
                else {
                    // After the last iteration, update the first position in assaultLadder
                    area.assaultLadder[0] = area.assembledInvaders.pop() || null;

                    // TODO: really check it here? It offers nice small delay when an invader reaches top, but the delay should be gained by other mean
                    if (area.assaultLadder[LADDER_POSITIONS - 1] !== null) {
                        area.conquered = true;
                        useState(STORE_GAME_STATE).value = 'lost';
                    }
                }
            }, (LADDER_POSITIONS - i) * delayBetweenIterations);
        }
    });
};