import type {BattleZone} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_BATTLE_ZONES} from "~/constants";

// TODO: should be as wipeLadderInvaders on server, but with small delays between each iteration on invaders
// and enabling CSS animations on invaders

export const useWipeLadderInvaders = (): void => {
    let zones: BattleZone[] = useState<BattleZone[]>(STORE_BATTLE_ZONES).value

    zones.forEach((zone): void => {
        let defendersStrength = zone.guardians.length;
        let invadersOnLadder = zone.invaders.filter(invader => invader.ladderStep !== null);

        if (invadersOnLadder.length > 0) {
            // write me function: if an invader is on ladder position 1 or more, than hit it according to defenders strength and lower defenders strength
            invadersOnLadder.forEach(invader => {
                if (invader.ladderStep! > 0) {
                    const damageStrength = Math.min(defendersStrength, invader.health);

                    // Deal damage to invader
                    invader.health -= damageStrength;

                    // Remove invader if health drops to 0
                    if (invader.health <= 0) {
                        // remove invader from zone.invaders array
                        const invaderIndex = zone.invaders.indexOf(invader);
                        zone.invaders.splice(invaderIndex, 1);
                    }

                    // Reduce defenders strength by the damage dealt
                    defendersStrength -= damageStrength;
                }
            })
        }
    });
}
