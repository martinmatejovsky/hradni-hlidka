import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";

function useInitializePlayerGeolocationWatcher(playerName: string): void {
    // TODO: verify if this name is not already taken
    // or preset some fixed characters/names
    const geolocationOptions = {
        enableHighAccuracy: true,
    }
    if ('geolocation' in navigator) {
        useState('geolocationWatcher').value = navigator.geolocation.watchPosition( position => {
                useState<PlayerData[]>('playersLocation').value.push({
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

export {
    useInitializePlayerGeolocationWatcher,
}