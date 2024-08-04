import { getDistance, computeDestinationPoint } from 'geolib';
import type {LatLngTuple} from "leaflet";
import type {AssaultLadder} from "~/types/CustomTypes";

// Pomocná funkce pro výpočet úhlu mezi dvěma body
const calculateAngle = (start: LatLngTuple, end: LatLngTuple): number => {
    const [startLat, startLng] = start;
    const [endLat, endLng] = end;
    const deltaLat = endLat - startLat;
    const deltaLng = endLng - startLng;
    return Math.atan2(deltaLat, deltaLng);
};

// Pomocná funkce pro výpočet nového bodu na základě vzdálenosti a úhlu pomocí geolib
const calculateNewPoint = (start: LatLngTuple, distance: number, angle: number): LatLngTuple => {
    const [startLat, startLng] = start;
    const destination = computeDestinationPoint(
        { latitude: startLat, longitude: startLng },
        distance,
        angle * (180 / Math.PI)
    );
    return [destination.latitude, destination.longitude];
};

// Funkce pro výpočet levého horního rohu čtverce
export const useCalculateSquareCorner = ({ location: { start, end } }: AssaultLadder): LatLngTuple => {
    const ladderStart = [start.lat, start.lng] as LatLngTuple;
    const ladderEnd = [end.lat, end.lng] as LatLngTuple;

    const diagonal = getDistance(
        { latitude: ladderStart[0], longitude: ladderStart[1] },
        { latitude: ladderEnd[0], longitude: ladderEnd[1] }
    );

    const side = diagonal / Math.sqrt(2);
    const angle = calculateAngle(ladderStart, ladderEnd);

    // Úhel pro levý horní roh od ladderStart (45 stupňů v radiánech přičtený k původnímu úhlu)
    const angleTopLeft = angle + Math.PI / 4; // 45 stupňů v radiánech

    return calculateNewPoint(ladderStart, side, angleTopLeft);
};
