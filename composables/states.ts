import {useState} from "nuxt/app";
import type {PlayerData, AttackThreat, GameState} from "~/types/CustomTypes";
import {gameAreas} from "~/data/gameAreas";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

const useStoredPlayersLocation = () => useState<PlayerData[]>('playersLocation', (): PlayerData[] => [])
const useStoredGeolocationWatcher = () => useState<number | null>('geolocationWatcher', (): number | null => null)
const useStoredAttackThreat = () => useState<AttackThreat[]>('attackThread', (): AttackThreat[] => {
    let threat = [] as AttackThreat[];
    gameAreas.forEach(area => {
        threat.push({
            areaName: area.areaName,
            threatLevel: 0,
            attackersAmount: 0,
            conquered: false,
        })
    })
    return threat;
})
const useGameState = () => useState<GameState>('gameState', (): GameState => 'ready')
const useWakeLock = () => useState<WakeLockSentinel | null>('wakeLock', (): WakeLockSentinel | null => null)

export {
    useStoredPlayersLocation,
    useStoredGeolocationWatcher,
    useStoredAttackThreat,
    useGameState,
    useWakeLock,
}
