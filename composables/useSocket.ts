// tutorial on https://socket.io/how-to/use-with-vue

import { io } from "socket.io-client"
import type { GameInstance } from "~/types/CustomTypes"
import * as CONST from "~/constants";

export function useSocket(gameId: string) {
    const runtimeConfig = useRuntimeConfig();
    const URL = runtimeConfig.public.socketIoUrl as string;
    const socket = io(URL, {query: {gameId}})

    socket.on("connect", () => {
        console.log("Connected to useSocket");
    })

    socket.on('newPlayerJoined', (game: GameInstance) => {
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    socket.on('playerLeftGame', (game: GameInstance) => {
        console.log('a player Left Game')
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    return socket;
}