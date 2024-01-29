import type {GamePolygons} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_GAME_POLYGONS} from "~/constants";

export const useRunAttack = () => {
    let gamePolygons: GamePolygons[] = useState<GamePolygons[]>(STORE_GAME_POLYGONS).value

    // fill mock data of first attackers
    for (let i = 0; i < gamePolygons.length; i++) {
        useAttackersAmountCorrection(gamePolygons[i].areaName, i + 4);
    }

    // 1. put attackers into waiting list, if it is empty. They will stay there for a moment
    // to let players react and prepare
    // 2. calculate damage done by guardians and remove attackers from ladders
    useUpdateThreatLevels();
    // 3. start releasing attackers from waiting list to ladders
}