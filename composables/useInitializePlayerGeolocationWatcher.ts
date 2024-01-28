import {useState} from "nuxt/app";
import type {PlayerData, PlayerCoordinates} from "~/types/CustomTypes";
import { STORE_GEOLOCATION_WATCHER, STORE_CURRENT_PLAYER} from "../constants";

export function useInitializePlayerGeolocationWatcher(playerName: string): void {
    // TODO: verify if this name is not already taken
    // or preset some fixed characters/names
    const geolocationOptions = {
        enableHighAccuracy: true,
    }
    if ('geolocation' in navigator) {
        useState(STORE_GEOLOCATION_WATCHER).value = navigator.geolocation.watchPosition( position => {
            useState<PlayerData>(STORE_CURRENT_PLAYER).value.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
                }
        },
        function() {},
        geolocationOptions);
    } else {
        console.log('Geolokace není podporována.')
    }
}