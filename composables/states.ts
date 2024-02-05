import {useState} from "nuxt/app";
import type {PlayerData, GameLocation, GameInstance} from "~/types/CustomTypes";
import * as CONST from "../constants";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

// TODO: useStoredPlayersLocation should be imported from server, which is the only place to know locations of all players
export const useStoredPlayersLocation = () => useState<PlayerData[]>(CONST.STORE_PLAYERS_LOCATION, (): PlayerData[] => [])
export const useStoredGeolocationWatcher = () => useState<number | null>(CONST.STORE_GEOLOCATION_WATCHER, (): number | null => null)
export const useWakeLock = () => useState<WakeLockSentinel | null>(CONST.STORE_WAKE_LOCK, (): WakeLockSentinel | null => null)
export const useStoredCurrentPlayer = () => useState<PlayerData>(CONST.STORE_CURRENT_PLAYER, (): PlayerData => {
    return {
        name: '',
        key: String(Math.floor(100000 + Math.random() * 900000)),
        location: {
            latitude: null,
            longitude: null,
            accuracy: null,
        }
    }
})
export const useStoredGameLocations = (initialData: GameLocation[]) => useState<GameLocation[]>(CONST.STORE_GAME_LOCATIONS, () => initialData)
export const useStoredGameInstance = (game: GameInstance) => useState<GameInstance>(CONST.STORE_GAME_INSTANCE, () => game)
