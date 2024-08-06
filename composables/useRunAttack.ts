import type {BattleZone, GameInstance, Invader, InvaderType} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {ATTACK_TEMPO, STORE_BATTLE_ZONES, STORE_GAME_INSTANCE} from "~/constants";

export const useRunAttack = () => {
    // let areas: BattleZone[] = useState<BattleZone[]>(STORE_BATTLE_ZONES).value;

    // 1. put attackers into waiting list, if it is empty. They should stay there for a moment
    // to let players react and prepare
    // for (let i = 0; i < areas.length; i++) {
    //     if (areas[i].assembledInvaders.length === 0) {
    //         const randomInvadersAmount = Math.floor(Math.random() * 4) + 1;
    //         for (let j = 0; j < randomInvadersAmount; j++) {
    //             areas[i].assembledInvaders.push({
    //                 type: "normal" as InvaderType,
    //                 health: 2,
    //             } as Invader)
    //         }
    //     }
    // }

    // return setInterval(() => {
    //     // 2. evaluate winning conditions - no attacker left or in assembly area
    //     if (??) {
    //         // TODO: emit it to server and do not write it into State directly
    //         useState<GameInstance>(STORE_GAME_INSTANCE).value.gameState = 'won';
    //     }
    //
    //     // 3. calculate damage done by guardians and remove attackers from ladders
    //     useWipeLadderInvaders();
    //
    //     // 4. move attackers up the ladder
    //     useMoveInvadersOnLadder();
    // }, ATTACK_TEMPO);
}
