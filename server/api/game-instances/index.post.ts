import {GameInstance, PlayerData, GameLocation} from "~/types/CustomTypes";
import { writeFile } from 'fs/promises';

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.hostingPlayer || !body.gameLocation) {
        return {
            status: 400, // 400 Bad Request
            body: { error: 'Missing required property in request body' },
        };
    }

    const newGameInstance: GameInstance = {
        id: Date.now().toString(),
        gameLocation: body.gameLocation as GameLocation,
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
