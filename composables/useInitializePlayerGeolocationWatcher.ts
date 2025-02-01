import {useState} from "nuxt/app";
import {STORE_APPLICATION_ERROR} from "~/constants";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";


export function useInitializePlayerGeolocationWatcher(): void {
    const geolocationOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
    }

    if ('geolocation' in navigator) {
        const storeCurrentPlayer = useCurrentPlayerStore()

        storeCurrentPlayer.geolocationWatcher = navigator.geolocation.watchPosition( position => {
            storeCurrentPlayer.setCurrentPlayerGeolocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
          })
        },
        function() {},
        geolocationOptions);
    } else {
        useState(STORE_APPLICATION_ERROR).value = 'Geolokace není podporována. Bez ní nebude možné hrát.'
    }
}
