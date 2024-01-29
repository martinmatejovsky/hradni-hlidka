import type {AreaAttackStat, Invader, InvaderType} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {ATTACK_TEMPO, STORE_AREA_ATTACK_STAT, STORE_GAME_STATE} from "~/constants";

export const useRunAttack = () => {
    let areas: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value

    // 1. put attackers into waiting list, if it is empty. They will stay there for a moment
    // to let players react and prepare
    for (let i = 0; i < areas.length; i++) {
        if (areas[i].assembledInvaders.length === 0) {
            const randomAttackersAmount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < randomAttackersAmount; j++) {
                areas[i].assembledInvaders.push({
                    type: "normal" as InvaderType,
                    health: 1,
                } as Invader)
            }
        }
    }

    const intervalId = setInterval((): void => {
        // 2. calculate damage done by guardians and remove attackers from ladders

        // 3. move attackers up the ladder
        useMoveInvadersOnLadder();
    }, ATTACK_TEMPO);

    // 4. evaluate if attackers reached the top of the ladder
    if (useState(STORE_GAME_STATE).value === "lost") {
        clearInterval(intervalId);
    }
}