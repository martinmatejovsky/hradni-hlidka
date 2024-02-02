export type Coordinates = {
    latitude: number | null,
    longitude: number | null,
}
export type PlayerCoordinates = Coordinates & {accuracy: number | null}
export type PlayerData = {
    name: string,
    location: PlayerCoordinates,
}
export type AreaAttackStat = {
    areaName: string,
    conquered: boolean,
    guardians: PlayerData[],
    assembledInvaders: Invader[],
    assaultLadder: (Invader | null)[],
}
export type GameState = "setting" | "ready" | "running" | "won" | "lost"
export type BattleZone = {
    name: string,
    key: string,
    polygons: {
            areaName: string,
            areaCornerCoordinates: Coordinates[],
        }[]
}
export type InvaderType = "normal"
export type Invader = {
    type: InvaderType,
    health: number,
}