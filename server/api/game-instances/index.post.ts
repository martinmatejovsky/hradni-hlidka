import {GameInstance, PlayerData} from "~/types/CustomTypes";
import { writeFile } from 'fs/promises';
import { usePrepareClearBattleZone } from '~/composables/usePrepareClearBattleZone'
export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.hostingPlayer || !body.gameLocation) {
        return {
            status: 400, // 400 Bad Request
            body: { error: 'Missing required property in request body' },
        };
    }

    const newGameInstance: GameInstance = {
        id: body.gameLocation.key + Date.now().toString(),
        gameState: 'ready',
        gameLocation: body.gameLocation ,
        battleZones: usePrepareClearBattleZone(body.gameLocation),
        players: new Array(body.hostingPlayer as PlayerData),
    }

    const dataDirectory = 'server/game-instances/';
    const instanceFileName: string = `${newGameInstance.id}.json`;
    const instanceFilePath: string = `${dataDirectory}${instanceFileName}`;

    try {
        await writeFile(instanceFilePath, JSON.stringify(newGameInstance, null, 2), 'utf-8');

        return {
            status: 201, // 201 Created
            headers: {
                'Content-Type': 'application/json',
            },
            body: newGameInstance,
        };
    } catch (error) {
        return {
            status: 500, // 500 Internal Server Error
            body: { error: 'Error writing game instance to server file ' + instanceFilePath },
        };
    }
});
