import {BattleZonesAll} from "~/data/battleZonesAll";

export default defineEventHandler((event) => {
    const requestedZone: string =  getRouterParams(event).zone
    const foundZone = BattleZonesAll.find(zone => zone.key === requestedZone)
    if (!foundZone) {
        return {
            status: 204,
            body: { error: 'Zone of that key was not found' },
        };
    }

    return foundZone
})