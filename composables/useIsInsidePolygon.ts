import type {Coordinates, PlayerCoordinates} from '~/types/CustomTypes';

/**
 * Check if a point is inside a polygon
 * @param point
 * @param gameArea list of coordinates that make up the polygon
 */
export function useIsPositionInsidePolygon(point: PlayerCoordinates, gameArea: Coordinates[]) {
    const x = <number>point.lat;
    const y = <number>point.lng;
    let isInside = false;

    for (let i = 0, j = gameArea.length - 1; i < gameArea.length; j = i++) {
        const xi = <number>gameArea[i].lat;
        const yi = <number>gameArea[i].lng;
        const xj = <number>gameArea[j].lat;
        const yj = <number>gameArea[j].lng;

        const intersect =
            ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            isInside = !isInside;
        }
    }

    return isInside;
}
