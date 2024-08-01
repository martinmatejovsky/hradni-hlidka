import { getDistance, computeDestinationPoint } from 'geolib';
import type {LatLngTuple} from "leaflet";

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
export const useCalculateSquareCorner = (ladderStart: LatLngTuple, ladderEnd: LatLngTuple): LatLngTuple => {
    // Vzdálenost mezi startem a koncem (úhlopříčka čtverce)
    const diagonal = getDistance(
        { latitude: ladderStart[0], longitude: ladderStart[1] },
        { latitude: ladderEnd[0], longitude: ladderEnd[1] }
    );

    // Délka strany čtverce
    const side = diagonal / Math.sqrt(2);

    // Úhel mezi startem a koncem
    const angle = calculateAngle(ladderStart, ladderEnd);

    // Úhel pro levý horní roh (45 stupňů v radiánech přičtený k původnímu úhlu)
    const angleTopLeft = angle + Math.PI / 4; // 45 stupňů v radiánech

    // Výpočet souřadnic levého horního rohu
    return calculateNewPoint(ladderStart, side, angleTopLeft);
};
