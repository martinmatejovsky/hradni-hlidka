import {useState} from "nuxt/app";

// TODO - when initializing from server use this tutorial on
//  https://nuxt.com/docs/getting-started/state-management

// TODO: specify custom type of store structure for one player
const useStoredPlayersLocation = () => useState('playersLocation', () => [])
const useStoredGeolocationWatcher = () => useState('geolocationWatcher', () => null)

export {
    useStoredPlayersLocation,
    useStoredGeolocationWatcher,
}
