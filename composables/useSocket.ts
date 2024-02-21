// tutorial on https://socket.io/how-to/use-with-vue

import { reactive } from "vue"
import { io } from "socket.io-client"
import type { GameInstance } from "~/types/CustomTypes"
import * as CONST from "~/constants";

// TODO: create custom interface for useSocketState?
export const useSocketState = reactive({
    connected: false,
})

export function useSocket(gameId: string) {
    const runtimeConfig = useRuntimeConfig();
    const URL = runtimeConfig.public.socketIoUrl as string;
    const socket = io(URL, {query: {gameId}})

    socket.on("connect", () => {
        console.log("Connected to useSocket");
        useSocketState.connected = true;
    })

    socket.on("disconnect", () => {
        console.log("Disconnected to useSocket");
        useSocketState.connected = false;
    })

    socket.on('newPlayerJoined', (game: GameInstance) => {
        console.log('++++++++++')
        console.log(game.players)
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    socket.on('playerLeftGame', (game: GameInstance) => {
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    return socket;
}