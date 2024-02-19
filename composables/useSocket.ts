// tutorial on https://socket.io/how-to/use-with-vue

import { reactive } from "vue"
import { io } from "socket.io-client"
import type {PlayerData} from "~/types/CustomTypes"

// TODO: create custom interface for useSocketState?
export const useSocketState = reactive({
    connected: false,
})

export function useSocket() {
    const runtimeConfig = useRuntimeConfig();
    const URL = runtimeConfig.public.socketIoUrl as string;
    const socket = io(URL);

    socket.on("connect", () => {
        console.log("Connected to useSocket");
        useSocketState.connected = true;
    })

    socket.on("disconnect", () => {
        console.log("Disconnected to useSocket");
        useSocketState.connected = false;
    })

    socket.on('newPlayerJoined', (player: PlayerData) => {
        console.log('newPlayerJoined', player);
    })

    return socket;
}

