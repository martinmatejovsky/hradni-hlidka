import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

// TODO: specify custom type of store structure for one player
const useStoredPlayersLocation = () => useState<PlayerData[]>('playersLocation', (): PlayerData[] => [])
const useStoredGeolocationWatcher = () => useState<number | null>('geolocationWatcher', (): number | null => null)

export {
    useStoredPlayersLocation,
    useStoredGeolocationWatcher,
}
