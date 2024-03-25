import type {GameInstance, BattleZone, GameState, PlayerData} from "~/types/CustomTypes";
import {STORE_GAME_INSTANCE, STORE_CURRENT_PLAYER} from "~/constants";

export const useGetterGameState = computed((): GameState => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.gameState
})

export const useGetterBattleZones = computed((): BattleZone[] => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.battleZones
})

export const useGetterCurrentPlayerIsLeader = computed((): Boolean => {
    return useState<GameInstance>(STORE_GAME_INSTANCE).value?.players[0]?.key === useState<PlayerData>(STORE_CURRENT_PLAYER).value.key || false
})