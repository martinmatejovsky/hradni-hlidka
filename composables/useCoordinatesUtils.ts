import {computeDestinationPoint, getDistance} from 'geolib';
import type {LatLngTuple} from "leaflet";
import type {AssaultLadder} from "~/types/CustomTypes";

// Výpočet bearingu (azimutu) mezi dvěma body v zeměpisných souřadnicích
const calculateBearing = (
  start: { latitude: number, longitude: number },
  end: { latitude: number, longitude: number }
): number => {
    const startLat = start.latitude * Math.PI / 180;
    const startLng = start.longitude * Math.PI / 180;
    const endLat = end.latitude * Math.PI / 180;
    const endLng = end.longitude * Math.PI / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

// Funkce pro výpočet levého horního rohu čtverce
export const useCalculateSquareCorner = ({ location: { start, end } }: AssaultLadder): LatLngTuple => {
    const point1 = [start.lat, start.lng] as [number, number];
    const point3 = [end.lat, end.lng] as [number, number];

    // Vypočítáme bearing (azimut) od start k end
    const bearing = calculateBearing(
      { latitude: point1[0], longitude: point1[1] },
      { latitude: point3[0], longitude: point3[1] }
    );

    const diagonalDistance = getDistance(
      { latitude: point1[0], longitude: point1[1] },
      { latitude: point3[0], longitude: point3[1] }
    );

    const sideLength = diagonalDistance / Math.sqrt(2);
    const bearingToPoint4 = (bearing - 45 + 360) % 360;

    const point4 = computeDestinationPoint(
      { latitude: point1[0], longitude: point1[1] },
      sideLength,
      bearingToPoint4
    );

    return [point4.latitude, point4.longitude];
};
