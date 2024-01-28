import {useState} from "nuxt/app";
import type {PlayerData, AreaAttackStat, GameState} from "~/types/CustomTypes";
import * as CONST from "../constants";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

const useStoredPlayersLocation = () => useState<PlayerData[]>(CONST.STORE_PLAYERS_LOCATION, (): PlayerData[] => [])
const useStoredGeolocationWatcher = () => useState<number | null>(CONST.STORE_GEOLOCATION_WATCHER, (): number | null => null)
const useStoredAttackThreat = () => useState<AreaAttackStat[]>(CONST.STORE_AREA_ATTACK_STAT, useClearGameAreas)
const useGameState = () => useState<GameState>(CONST.STORE_GAME_STATE, (): GameState => 'ready')
const useWakeLock = () => useState<WakeLockSentinel | null>(CONST.STORE_WAKE_LOCK, (): WakeLockSentinel | null => null)

export {
    useStoredPlayersLocation,
    useStoredGeolocationWatcher,
    useStoredAttackThreat,
    useGameState,
    useWakeLock,
}
