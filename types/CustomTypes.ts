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
    threatLevel: number,
    attackersAmount: number,
    conquered: boolean,
    guardians: PlayerData[],
    assembledInvaders: Invader[],
    assaultLadder: (Invader | null)[],
}
export type GameState = "ready" | "running" | "won" | "lost"
export type GamePolygons = {
    areaName: string,
    areaCornerCoordinates: Coordinates[],
}
export type InvaderType = "normal"
export type Invader = {
    type: InvaderType,
    health: number,
}