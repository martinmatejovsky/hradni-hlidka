import type {GameInstance, BattleZone, GameState} from "~/types/CustomTypes";
import {STORE_GAME_INSTANCE} from "~/constants";

export const useGetterGameState = computed((): GameState => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.gameState
})

export const useGetterBattleZones = computed((): BattleZone[] => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.battleZones
})