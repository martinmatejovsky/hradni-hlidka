import type {AreaAttackStat} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_AREA_ATTACK_STAT} from "~/constants";

export const useWipeLadderInvaders = (): void => {
    let areas: AreaAttackStat[] = useState<AreaAttackStat[]>(STORE_AREA_ATTACK_STAT).value

    areas.forEach((area: AreaAttackStat): void => {
        let defendersStrength = area.guardians.length;

        // hit only invaders that are at least at second position of the ladder so that it is not as easy
        for (let i = area.assaultLadder.length - 1; i >= 1 && defendersStrength > 0; i--) {
            const invader = area.assaultLadder[i];

            if (invader !== null) {
                const damageStrength = Math.min(defendersStrength, invader.health);

                // Deal damage to invader
                invader.health -= damageStrength;

                // Remove invader if health drops to 0
                if (invader.health <= 0) {
                    area.assaultLadder[i] = null;
                }

                // Reduce defenders strength by the damage dealt
                defendersStrength -= damageStrength;
            }
        }
    });
}