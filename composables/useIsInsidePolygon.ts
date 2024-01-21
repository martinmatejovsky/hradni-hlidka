import type {Coordinates, PlayerCoordinates} from '~/types/CustomTypes';

/**
 * Check if a point is inside a polygon
 * @param point
 * @param gameArea list of coordinates that make up the polygon
 */
export function useIsPositionInsidePolygon(point: PlayerCoordinates, gameArea: Coordinates[]) {
    const x = point.latitude;
    const y = point.longitude;
    let isInside = false;

    for (let i = 0, j = gameArea.length - 1; i < gameArea.length; j = i++) {
        const xi = gameArea[i].latitude;
        const yi = gameArea[i].longitude;
        const xj = gameArea[j].latitude;
        const yj = gameArea[j].longitude;

        const intersect =
            ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            isInside = !isInside;
        }
    }

    return isInside;
}