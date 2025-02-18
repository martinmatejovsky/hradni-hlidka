import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";
import * as CONST from "../constants";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

export const useStoredGeolocationWatcher = () => useState<number | null>(CONST.STORE_GEOLOCATION_WATCHER, (): number | null => null)
export const useWakeLock = () => useState<WakeLockSentinel | null>(CONST.STORE_WAKE_LOCK, (): WakeLockSentinel | null => null)
export const useStoredCurrentPlayer = () => useState<PlayerData>(CONST.STORE_CURRENT_PLAYER, (): PlayerData => {
    return {
        name: '',
        key: '',
        location: {
            lat: null,
            lng: null,
            accuracy: null,
        },
        insideZone: '',
        strength: 0,
        perks: {
            sharpSword: 0,
        },
        socketId: '',
    }
})
export const useStoredApplicationError = () => useState<string | null>(CONST.STORE_APPLICATION_ERROR, () => null)