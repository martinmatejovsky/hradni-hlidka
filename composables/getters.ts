import type {GameInstance, BattleZone} from "~/types/CustomTypes";
import {STORE_GAME_INSTANCE} from "~/constants";

export const useGetterGameState = (): string => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.gameState
}

export const useGetterBattleZones = (): BattleZone[] => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.battleZones
}