type Coordinates = {
    latitude: number | null,
    longitude: number | null,
}
type PlayerCoordinates = Coordinates & {accuracy: number | null}
type PlayerData = {
    name: string,
    location: PlayerCoordinates,
}
type AreaAttackStat = {
    areaName: string,
    threatLevel: number,
    attackersAmount: number,
    conquered: boolean,
    guardians: PlayerData[],
}
type GameState = "ready" | "running" | "won" | "lost"

export type {
    Coordinates,
    PlayerCoordinates,
    PlayerData,
    AreaAttackStat,
    GameState,
}