import type {GameInstance, BattleZone} from "~/types/CustomTypes";
import {STORE_GAME_INSTANCE} from "~/constants";

export const useGetterGameState = computed((): string => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.gameState
})

export const useGetterBattleZones = computed((): BattleZone[] => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.battleZones
})