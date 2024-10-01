import type {Coordinates, PlayerCoordinates} from '~/types/CustomTypes';

/**
 * Check if a point is inside a polygon
 * @param point
 * @param gameArea list of coordinates that make up the polygon
 */
export function useIsPositionInsidePolygon(point: PlayerCoordinates, gameArea: Coordinates[]) {
    const x = point.lat;
    const y = point.lng;
    let isInside = false;

    for (let i = 0, j = gameArea.length - 1; i < gameArea.length; j = i++) {
        const xi = gameArea[i].lat;
        const yi = gameArea[i].lng;
        const xj = gameArea[j].lat;
        const yj = gameArea[j].lng;

        const intersect =
            ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            isInside = !isInside;
        }
    }

    return isInside;
}
