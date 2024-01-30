import type {AreaAttackStat, Invader, InvaderType} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {ATTACK_TEMPO, STORE_AREA_ATTACK_STAT} from "~/constants";

export const useRunAttack = () => {
    let areas: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value

    // 1. put attackers into waiting list, if it is empty. They should stay there for a moment
    // to let players react and prepare
    for (let i = 0; i < areas.length; i++) {
        if (areas[i].assembledInvaders.length === 0) {
            const randomAttackersAmount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < randomAttackersAmount; j++) {
                areas[i].assembledInvaders.push({
                    type: "normal" as InvaderType,
                    health: 2,
                } as Invader)
            }
        }
    }

    return setInterval(() => {
        // 2. calculate damage done by guardians and remove attackers from ladders
        useWipeLadderInvaders();

        // 3. move attackers up the ladder
        useMoveInvadersOnLadder();
    }, ATTACK_TEMPO);
}