import { useState } from "nuxt/app";
import type { AreaAttackStat, Invader } from "~/types/CustomTypes";
import { LADDER_POSITIONS, STORE_AREA_ATTACK_STAT, STORE_GAME_STATE } from "~/constants";

export const useMoveInvadersOnLadder = () => {
    let areas: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value;

    // interval for updating threat levels
    areas.forEach((area: AreaAttackStat): void => {
        let attackerToClimb: Invader | null = area.assembledInvaders.pop() || null;

        for (let i = LADDER_POSITIONS - 1; i > 0; i--) {
            area.assaultLadder[i] = area.assaultLadder[i - 1];
        }

        area.assaultLadder[0] = attackerToClimb;

        if (area.assaultLadder[LADDER_POSITIONS - 1] !== null) {
            area.conquered = true;
            useState(STORE_GAME_STATE).value = "lost";
        }
    });
};