export type Coordinates = {
    lat: number | null,
    lng: number | null,
}
export type PlayerCoordinates = Coordinates & {accuracy: number | null}
export type PlayerData = {
    name: string,
    key: string,
    location: PlayerCoordinates,
    insideZone: string,
    strength: number,
    perks: {
        smithyUpgrade: number,
    }
    socketId: string,
}
export enum Perks {
    smithyUpgrade = 'smithyUpgrade'
}
export type GameState = "none" | "ready" | "running" | "won" | "lost"
type PolygonType = "assaultZone" | "smithy"
export interface BasePolygon {
    polygonName: string,
    key: string,
    polygonType: PolygonType,
    cornerCoordinates: Coordinates[],
    assemblyArea?: Coordinates[],
    assaultLadder?: AssaultLadder,
}
export interface GameLocation {
    locationName: string,
    key: string,
    mapCenter: Coordinates,
    polygons: BasePolygon[],
    speedChoices: number[],
    ladderLengthChoices: number[],
}
export interface AssaultLadder {
    location: {
        start: Coordinates,
        end: Coordinates
    },
    steps: Coordinates[],
}
export interface BattleZone {
    zoneName: string,
    key: string,
    polygonType: PolygonType,
    cornerCoordinates: Coordinates[],
    conquered: boolean,
    guardians: string[],
    invaders: Invader[],
    assemblyArea: Coordinates[],
    assemblyCountdown: number,
    assaultLadder: AssaultLadder,
    waveCooldown: number,
}
export interface UtilityZone {
    zoneName: string,
    key: string,
    polygonType: PolygonType,
    cornerCoordinates: Coordinates[],
    guardians: string[],
}
export interface GameInstance {
    id: string,
    gameState: GameState,
    gameLocation: GameLocation,
    battleZones: BattleZone[],
    utilityZones: UtilityZone[],
    players: PlayerData[],
    gameTempo: number,
    ladderLength: number,
}
export type InvaderType = "regular" | "captain"
export type Invader = {
    id: number,
    type: InvaderType,
    health: number,
    assemblyArea: number|null,
    ladderStep: number|null,
}
export type Settings = {
    gameTempo: number,
    gameLength: number,
    ladderLength: number,
    assaultWaveVolume: number,
    assemblyCountdown: number,
    wavesMinDelay: number,
    defendersHitStrength: number,
    smithyUpgradeWaiting: number,
    smithyUpgradeStrength: number,
}
export type LastWaveNotice = 'none' | 'incoming' | 'running'