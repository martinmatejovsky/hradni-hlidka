import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";
import {STORE_PLAYERS_LOCATION, STORE_GEOLOCATION_WATCHER} from "../constants";

export function useInitializePlayerGeolocationWatcher(playerName: string): void {
    // TODO: verify if this name is not already taken
    // or preset some fixed characters/names
    const geolocationOptions = {
        enableHighAccuracy: true,
    }
    if ('geolocation' in navigator) {
        useState(STORE_GEOLOCATION_WATCHER).value = navigator.geolocation.watchPosition( position => {
                useState<PlayerData[]>(STORE_PLAYERS_LOCATION).value.push({
                    name: playerName,
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                } as PlayerData)
            },
            function() {},
            geolocationOptions);
    } else {
        console.log('Geolokace není podporována.')
    }
}