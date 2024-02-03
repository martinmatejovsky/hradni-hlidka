import type {BattleZone, BattleZonePolygon, Invader, InvaderType} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {ATTACK_TEMPO, STORE_BATTLE_ZONE_API, STORE_GAME_STATE} from "~/constants";

export const useRunAttack = () => {
    let areas: BattleZonePolygon[] = useState<BattleZone>(STORE_BATTLE_ZONE_API).value.polygons;

    // 1. put attackers into waiting list, if it is empty. They should stay there for a moment
    // to let players react and prepare
    for (let i = 0; i < areas.length; i++) {
        if (areas[i].assembledInvaders.length === 0) {
            const randomInvadersAmount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < randomInvadersAmount; j++) {
                areas[i].assembledInvaders.push({
                    type: "normal" as InvaderType,
                    health: 2,
                } as Invader)
            }
        }
    }

    return setInterval(() => {
        // 2. evaluate winning conditions - no attacker left or in assembly area
        if (areas.every((area: BattleZonePolygon): boolean => area.assembledInvaders.length === 0
            && area.assaultLadder.every(invader => invader === null)
        )) {
            useState(STORE_GAME_STATE).value = 'won';
        }

        // 3. calculate damage done by guardians and remove attackers from ladders
        useWipeLadderInvaders();

        // 4. move attackers up the ladder
        useMoveInvadersOnLadder();
    }, ATTACK_TEMPO);
}