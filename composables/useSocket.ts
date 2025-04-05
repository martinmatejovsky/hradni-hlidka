// tutorial on https://socket.io/how-to/use-with-vue

import { io } from "socket.io-client"
import type {GameInstance, LastWaveNotice} from "~/types/CustomTypes"
import {useEventBus} from "~/composables/useEventBus";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";

export function useSocket(gameId: string) {
    const storeGameInstance = useGameInstanceStore()
    const storeCurrentPlayer = useCurrentPlayerStore();
    const runtimeConfig = useRuntimeConfig();
    const URL = runtimeConfig.public.socketIoUrl as string;
    const socket = io(URL, {query: {gameId}})

    socket.on("connect", (): void => {
        console.log("Connected to useSocket with game ID", gameId);
    })

    socket.on('newPlayerJoined', (game: GameInstance): void => {
        storeGameInstance.setGameInstance(game);
    })

    socket.on('playerLeftGame', (game: GameInstance): void => {
        storeGameInstance.setGameInstance(game);
    })

    socket.on('gameStarted', (game: GameInstance): void => {
        storeGameInstance.setGameInstance(game);
    })

    socket.on('gameUpdated', (game: GameInstance) => {
        storeGameInstance.setGameInstance(game);

        if (game && game.players) {
            const player = game.players.find(p => p.key === storeCurrentPlayer.currentPlayer.key);
            if (player) {
                storeCurrentPlayer.currentPlayer.perks = player.perks;
                storeCurrentPlayer.currentPlayer.canPourBoilingOil = player.canPourBoilingOil;
            }
        }
        useEventBus('updateLifeOfInvaders');
    })

    socket.on('lastWaveNotice', (status: LastWaveNotice) => {
        useEventBus('lastWaveNotice', status)
    })

    socket.on('oilIsPoured', (affectedZone: string) => {
        useEventBus('oilIsPouredGlobalEvent', affectedZone);
    })

    return socket;
}
