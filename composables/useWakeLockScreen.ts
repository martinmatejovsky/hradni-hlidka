import { ref } from 'vue';

const wakeLockScreen = ref(null as WakeLockSentinel | null);
const requestWakeLockScreen = async (): Promise<void> => {
    try {
        wakeLockScreen.value = await navigator.wakeLock.request('screen');
    } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
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

export { wakeLockScreen, requestWakeLockScreen, releaseWakeLockScreen };
