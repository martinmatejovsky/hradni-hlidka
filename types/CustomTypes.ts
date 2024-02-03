export type Coordinates = {
    latitude: number | null,
    longitude: number | null,
}
export type PlayerCoordinates = Coordinates & {accuracy: number | null}
export type PlayerData = {
    name: string,
    location: PlayerCoordinates,
}
export type GameState = "setting" | "ready" | "running" | "won" | "lost"

interface BasePolygon {
    areaName: string;
    areaCornerCoordinates: Coordinates[];
}

export interface BattleZonePolygon extends BasePolygon {
    conquered: boolean;
    guardians: PlayerData[];
    assembledInvaders: Invader[];
    assaultLadder: (Invader | null)[];
}

type GameLocationBase = {
    name: string;
    key: string;
    polygons: BasePolygon[];
};

export type GameLocation = GameLocationBase & {
    polygons: BasePolygon[];
};

export type BattleZone = GameLocationBase & {
    polygons: BattleZonePolygon[];
};
export type InvaderType = "normal"
export type Invader = {
    type: InvaderType,
    health: number,
}