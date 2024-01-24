import {useState} from "nuxt/app";

function useInitializePlayerGeolocationWatcher(playerName: string): void {
    // TODO: verify if this name is not already taken
    // or preset some fixed characters/names
    const geolocationOptions = {
        enableHighAccuracy: true,
    }
    if ('geolocation' in navigator) {
        useState('geolocationWatcher').value = navigator.geolocation.watchPosition( position => {
                useState('playersLocation').value.push({
                    name: playerName,
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                })
            },
            function() {},
            geolocationOptions);
    } else {
        console.log('Geolokace není podporována.')
    }
    console.log('Hrajete jako ' + playerName)
}

export {
    useInitializePlayerGeolocationWatcher,
}