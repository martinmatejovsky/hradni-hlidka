import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";
import {STORE_GEOLOCATION_WATCHER, STORE_CURRENT_PLAYER, STORE_APPLICATION_ERROR} from "~/constants";

export function useInitializePlayerGeolocationWatcher(): void {
    const geolocationOptions = {
        enableHighAccuracy: true,
    }
    if ('geolocation' in navigator) {
        useState(STORE_GEOLOCATION_WATCHER).value = navigator.geolocation.watchPosition( position => {
            useState<PlayerData>(STORE_CURRENT_PLAYER).value.location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            }
        },
        function() {},
        geolocationOptions);
    } else {
        useState(STORE_APPLICATION_ERROR).value = 'Geolokace není podporována. Bez ní nebude možné hrát.'
    }
}
