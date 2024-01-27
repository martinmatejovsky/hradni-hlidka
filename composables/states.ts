import {useState} from "nuxt/app";
import type {PlayerData, AttackThreat, GameState} from "~/types/CustomTypes";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

const useStoredPlayersLocation = () => useState<PlayerData[]>('playersLocation', (): PlayerData[] => [])
const useStoredGeolocationWatcher = () => useState<number | null>('geolocationWatcher', (): number | null => null)
const useStoredAttackThreat = () => useState<AttackThreat[]>('attackThread', useClearGameAreas)
const useGameState = () => useState<GameState>('gameState', (): GameState => 'ready')
const useWakeLock = () => useState<WakeLockSentinel | null>('wakeLock', (): WakeLockSentinel | null => null)

export {
    useStoredPlayersLocation,
    useStoredGeolocationWatcher,
    useStoredAttackThreat,
    useGameState,
    useWakeLock,
}
