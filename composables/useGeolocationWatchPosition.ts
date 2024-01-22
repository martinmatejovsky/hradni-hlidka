import {ref} from "vue";
import type {PlayerCoordinates} from "~/types/CustomTypes";

const playerLocation = ref<PlayerCoordinates | null>(null)
const geolocationWatcher = ref(0)
const geolocationOptions = {
    enableHighAccuracy: true,
}
const geolocationErrorMessage = ref('' as string)
const initializeGeolocationWatcher = ():void => {
    if ('geolocation' in navigator) {
        geolocationWatcher.value = navigator.geolocation.watchPosition( position => {
            playerLocation.value = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            }
        }, function() {},
        geolocationOptions);
    } else {
        geolocationErrorMessage.value = 'Geolokace není podporována.'
    }
}

export {
    playerLocation,
    geolocationWatcher,
    geolocationErrorMessage,
    initializeGeolocationWatcher,
}
