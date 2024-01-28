import {useState} from "nuxt/app";
import {STORE_WAKE_LOCK} from "~/constants";

export const useRequestWakeLockScreen = async (): Promise<void> => {
    const wakeLockScreen = useState(STORE_WAKE_LOCK);
    if(('wakeLock' in navigator) && !wakeLockScreen.value) {
        const wakeLockScreen = useWakeLock();
        try {
            wakeLockScreen.value = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock is active ++')
            console.log(wakeLockScreen.value)
        } catch (err: any) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
};

export const useReleaseWakeLockScreen = async (): Promise<void> => {
    const wakeLockScreen = useState(STORE_WAKE_LOCK);
    try {
        if (wakeLockScreen.value) {
            await wakeLockScreen.value.release();
            wakeLockScreen.value = null;
        } else {
            console.warn('Trying to release null wake lock.');
        }
    } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
    }
};