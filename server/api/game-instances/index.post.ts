import {GameInstance, PlayerData, BattleZone} from "~/types/CustomTypes";

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

    return {
        status: 201, // 201 Created
        headers: {
            'Content-Type': 'application/json',
        },
        body: newGameInstance,
    };
});
