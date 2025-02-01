// tutorial on https://socket.io/how-to/use-with-vue

import { io } from "socket.io-client"
import type {GameInstance, LastWaveNotice, PlayerData} from "~/types/CustomTypes"
import {useEventBus} from "~/composables/useEventBus";
import {STORE_CURRENT_PLAYER} from "~/constants";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";

// Pinia store
const storeGameInstance = useGameInstanceStore()

export function useSocket(gameId: string) {
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
        // const gameState = useState<GameInstance>(CONST.STORE_GAME_INSTANCE);
        const currentPlayerState = useState<PlayerData>(STORE_CURRENT_PLAYER);

        storeGameInstance.setGameInstance(game);
        // gameState.value = game;

        if (game && game.players && currentPlayerState.value) {
            const player = game.players.find(p => p.key === currentPlayerState.value.key);
            if (player) {
                currentPlayerState.value.perks = player.perks;
            }
        }
        useEventBus('updateLifeOfInvaders');
    })

    socket.on('lastWaveNotice', (status: LastWaveNotice) => {
        useEventBus('lastWaveNotice', status)
    })

    return socket;
}
