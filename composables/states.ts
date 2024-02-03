import {useState} from "nuxt/app";
import type {PlayerData, GameLocation, GameState, BattleZone} from "~/types/CustomTypes";
import * as CONST from "../constants";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

// TODO: useStoredPlayersLocation should be imported from server, which is the only place to know locations of all players
export const useStoredPlayersLocation = () => useState<PlayerData[]>(CONST.STORE_PLAYERS_LOCATION, (): PlayerData[] => [])
export const useStoredGeolocationWatcher = () => useState<number | null>(CONST.STORE_GEOLOCATION_WATCHER, (): number | null => null)
export const useGameState = () => useState<GameState>(CONST.STORE_GAME_STATE, (): GameState => 'setting')
export const useWakeLock = () => useState<WakeLockSentinel | null>(CONST.STORE_WAKE_LOCK, (): WakeLockSentinel | null => null)
export const useStoredCurrentPlayer = () => useState<PlayerData>(CONST.STORE_CURRENT_PLAYER, (): PlayerData => {
    return {
        name: '',
        location: {
            latitude: null,
            longitude: null,
            accuracy: null,
        }
    }
})
export const useStoredGameLocations = (initialData: GameLocation[]) => useState<GameLocation[]>(CONST.STORE_GAME_LOCATIONS, () => initialData)
export const useStoredBattleZone = (zone: GameLocation) => useState<BattleZone>(CONST.STORE_BATTLE_ZONE_API, () => usePrepareClearBattleZone(zone))
