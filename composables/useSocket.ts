// tutorial on https://socket.io/how-to/use-with-vue

import { io } from "socket.io-client"
import type { GameInstance } from "~/types/CustomTypes"
import * as CONST from "~/constants";

export function useSocket(gameId: string) {
    const runtimeConfig = useRuntimeConfig();
    const URL = runtimeConfig.public.socketIoUrl as string;
    const socket = io(URL, {query: {gameId}})

    socket.on("connect", (): void => {
        console.log("Connected to useSocket");
    })

    socket.on('newPlayerJoined', (game: GameInstance): void => {
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    socket.on('playerLeftGame', (game: GameInstance): void => {
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    socket.on('gameStarted', (game: GameInstance): void => {
        console.log('game started')
        useState<GameInstance>(CONST.STORE_GAME_INSTANCE).value = game;
    })

    return socket;
}