import {useState} from "nuxt/app";
import type {PlayerData, AreaAttackStat, GameState, BattleZone} from "~/types/CustomTypes";
import * as CONST from "../constants";
import {BattleZonesAll as mockGameArea} from "~/data/battleZonesAll";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

// TODO: useStoredPlayersLocation should be imported from server, which is the only place to know locations of all players
export const useStoredPlayersLocation = () => useState<PlayerData[]>(CONST.STORE_PLAYERS_LOCATION, (): PlayerData[] => [])
export const useStoredGeolocationWatcher = () => useState<number | null>(CONST.STORE_GEOLOCATION_WATCHER, (): number | null => null)
export const useStoredAreaAttackStat = () => useState<AreaAttackStat[]>(CONST.STORE_AREA_ATTACK_STAT, useClearGameAreas)
export const useGameState = () => useState<GameState>(CONST.STORE_GAME_STATE, (): GameState => 'ready')
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
export const useStoredGamePolygons = () => useState<BattleZone>(CONST.STORE_BATTLE_ZONE, (): BattleZone => mockGameArea[0])
export const useApiBattleZones = (initialData: BattleZone[]) => useState<BattleZone[]>(CONST.STORE_BATTLE_ZONES_API, () => initialData)
export const useStoredBattleZone = (zone: BattleZone) => useState<BattleZone>(CONST.STORE_BATTLE_ZONE_API, () => zone)
