import { useState } from "nuxt/app";
import type { AreaAttackStat, Invader } from "~/types/CustomTypes";
import { ATTACK_TEMPO, LADDER_POSITIONS, STORE_AREA_ATTACK_STAT, STORE_GAME_STATE } from "~/constants";

export const useUpdateThreatLevels = () => {
    let attackThreatState: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value;

    // interval for updating threat levels
    const intervalId = setInterval((): void => {
        attackThreatState.forEach((item: AreaAttackStat): void => {
            let attackerToClimb: Invader | null = item.assembledInvaders.pop() || null;

            for (let i = LADDER_POSITIONS - 1; i > 0; i--) {
                item.assaultLadder[i] = item.assaultLadder[i - 1];
            }

            item.assaultLadder[0] = attackerToClimb;

            if (item.assaultLadder[LADDER_POSITIONS - 1] !== null) {
                item.conquered = true;
                useState(STORE_GAME_STATE).value = "lost";
                clearInterval(intervalId);
            }
        });
    }, ATTACK_TEMPO);
};