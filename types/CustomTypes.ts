export type Coordinates = {
    latitude: number,
    longitude: number,
}

export type PlayerCoordinates = Coordinates & {accuracy: number}