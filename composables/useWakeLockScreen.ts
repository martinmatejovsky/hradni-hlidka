import {useState} from "nuxt/app";
import {STORE_WAKE_LOCK} from "../constants";

const requestWakeLockScreen = async (): Promise<void> => {
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
const releaseWakeLockScreen = async (): Promise<void> => {
    try {
        await wakeLockScreen.value?.release();
        wakeLockScreen.value = null;
    } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
    }
};

export { requestWakeLockScreen, releaseWakeLockScreen };
