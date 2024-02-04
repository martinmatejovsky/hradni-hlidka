import {GameInstance, PlayerData, BattleZone} from "~/types/CustomTypes";
import { writeFile } from 'fs/promises';

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.hostingPlayer || !body.selectedBattleZone) {
        return {
            status: 400, // 400 Bad Request
            body: { error: 'Missing required property' },
        };
    }

    const newGameInstance: GameInstance = {
        id: Date.now().toString(),
        battleZone: body.selectedBattleZone as BattleZone,
        players: new Array(body.hostingPlayer as PlayerData),
    }

    const dataDirectory = 'server/game-instances/';
    const instanceFileName = `${newGameInstance.id}.json`;
    const instanceFilePath = `${dataDirectory}${instanceFileName}`;

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
