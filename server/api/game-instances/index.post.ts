import {GameInstance, PlayerData} from "~/types/CustomTypes";
import { usePrepareClearBattleZone } from '~/composables/usePrepareClearBattleZone'
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
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

    try {
        const supabase = createClient(runtimeConfig.public.dbHost, runtimeConfig.public.dbKey);

        // Insert a row
        const { data, error } = await supabase
            .from('game_instances')
            .insert([newGameInstance])
            .select();

        if (error) {
            return {
                status: 500,
                body: { error: error.message },
            };
        }
        return {
            status: 201,
            body: { gameInstance: data[0] as GameInstance },
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            status: 500,
            body: { error: 'Error while accessing database' },
        };
    }
});
