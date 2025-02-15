import L from "leaflet";
import {useCalculateSquareCorner} from "~/composables/useCoordinatesUtils";
import ladderImage from "assets/icons/ladder.svg";
import type {BattleZone, Invader} from "~/types/CustomTypes";

export function useMapLabels() {
  function addLabelsToPolygons(map: L.Map, polygons: L.Polygon[]) {
    polygons.forEach(polygon => {
      const zoneKey = polygon.getTooltip()?.getContent() || '';
      if (!zoneKey) return;

      const bounds = polygon.getBounds();
      const center = bounds.getCenter();
      const label = new L.Marker(center, {
        icon: L.divIcon({
          className: 'hh-zone-label',
          html: zoneKey,
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        })
      });

      label.addTo(map);
    });
  }

  function addLadders(map: L.Map, battleZones: BattleZone[]) {
    battleZones.forEach(battleZone => {
      const ladder = battleZone.assaultLadder.location

      const ladderCorner = useCalculateSquareCorner(battleZone.assaultLadder);

      L.imageOverlay.rotated(ladderImage, ladderCorner, ladder.end, ladder.start, {
        interactive: false,
        id: 'ladder-' + battleZone.key,
        className: "hh-ladder-image"
      }).addTo(map);
    })
  }

  function createInvaderIcon(map: L.Map, id: number, zoneKey: string, battleZones: BattleZone[], invaderIcons: any) {
    const battleZone = battleZones.find(zone => zone.key === zoneKey);
    if (!battleZone) {
      console.warn(`BattleZone with key ${zoneKey} not found`);
      return;
    }

    // Find the invader in the battleZone
    const invader = battleZone.invaders.find(invader => invader.id === id);
    if (!invader) {
      console.warn(`Invader with id ${id} not found in zone ${zoneKey}`);
      return;
    }

    // Get the coordinate for the invader's assembly area
    const assemblyAreaIndex = invader.assemblyArea ? invader.assemblyArea: 0;
    const assemblyCoordinate = battleZone.assemblyArea[assemblyAreaIndex];

    if (assemblyCoordinate.lat && assemblyCoordinate.lng) {
      // Create a Leaflet divIcon
      const invaderDivIcon = L.divIcon({
        className: `hh-invader-icon is-${invader.type}`,
        html: `${invader.health}`,
        iconSize: [20, 20], // Set the size of the icon
      });

      invaderIcons[id] = L.marker([assemblyCoordinate.lat, assemblyCoordinate.lng], { icon: invaderDivIcon }).addTo(map);
    } else {
      console.warn(`No coordinate found for assemblyArea index ${assemblyAreaIndex} in zone ${zoneKey}`);
      return;
    }
  }

  function handleUpdateInvadersIcons(map: L.Map, battleZones: BattleZone[], invaderIcons: any) {
    const currentInvaders: Invader[] = battleZones.flatMap((zone: BattleZone) => zone.invaders);

    // 1. Add new icons for invaders that don't have an icon yet
    battleZones.forEach((zone: BattleZone) => {
      zone.invaders.forEach(invader => {
        if (!invaderIcons[invader.id]) {
          createInvaderIcon(map, invader.id, zone.key, battleZones, invaderIcons);
        }
      });
    });

    // 2. Remove icons for invaders that no longer exist in currentInvaders
    Object.keys(invaderIcons).forEach(id => {
      const invaderId = parseInt(id);
      const invaderStillExists = currentInvaders.some(invader => invader.id === invaderId);

      if (!invaderStillExists) {
        const markerToRemove = invaderIcons[invaderId];
        if (markerToRemove) {
          markerToRemove.remove();
        }
        delete invaderIcons[invaderId];
      }
    });
  }

  return { addLabelsToPolygons, addLadders, handleUpdateInvadersIcons };
}