import {useState} from "nuxt/app";
import {STORE_WAKE_LOCK} from "~/constants";
import {useWakeLock} from "~/composables/states";

export const useRequestWakeLockScreen = async (): Promise<void> => {
    const wakeLockScreen = useState(STORE_WAKE_LOCK);
    if(('wakeLock' in navigator) && !wakeLockScreen.value) {
        const wakeLockScreen = useWakeLock();
        try {
            wakeLockScreen.value = await navigator.wakeLock.request('screen');
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
        }
    } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
    }
};