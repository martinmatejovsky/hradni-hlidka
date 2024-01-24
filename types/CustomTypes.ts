export type Coordinates = {
    latitude: number | null,
    longitude: number | null,
}

export type PlayerCoordinates = Coordinates & {accuracy: number | null}

export type PlayerData = {
    name: string,
    location: PlayerCoordinates,
}