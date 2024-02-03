import type {BattleZone, BattleZonePolygon} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_BATTLE_ZONE_API} from "~/constants";

export const useWipeLadderInvaders = (): void => {
    let zones: BattleZonePolygon[] = useState<BattleZone>(STORE_BATTLE_ZONE_API).value.polygons

    zones.forEach((zone): void => {
        let defendersStrength = zone.guardians.length;

        // hit only invaders that are at least at second position of the ladder so that it is not as easy
        for (let i = zone.assaultLadder.length - 1; i >= 1 && defendersStrength > 0; i--) {
            const invader = zone.assaultLadder[i];

            if (invader !== null) {
                const damageStrength = Math.min(defendersStrength, invader.health);

                // Deal damage to invader
                invader.health -= damageStrength;

                // Remove invader if health drops to 0
                if (invader.health <= 0) {
                    zone.assaultLadder[i] = null;
                }

                // Reduce defenders strength by the damage dealt
                defendersStrength -= damageStrength;
            }
        }
    });
}