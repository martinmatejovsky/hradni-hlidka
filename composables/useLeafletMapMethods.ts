import L from "leaflet";
import {useCalculateSquareCorner} from "~/composables/useCoordinatesUtils";
import ladderImage from "assets/icons/ladder.svg";
import bombardingMarkImage from "assets/icons/target-zone-aim.svg";
import type {BattleZone, Invader, InvaderType, UtilityZone} from "~/types/CustomTypes";
import {useIconLeaflet} from "~/composables/useIconLeaflet";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";

const classPulsatingAnimation = "hh-pulsate";
const bombardingMarkClass = ".hh-bombarding-img";

export function useLeafletMapUtilities() {
  function addBoilingOilPots(map: L.Map, utilityZones: UtilityZone[], boilingOilIcons: Record<string, L.Marker>) {
    const placesWithBoilingOil = utilityZones.filter(zone => zone.boilingOil);

    placesWithBoilingOil.forEach(zone => {
      if (!zone.boilingOil) return;

      const iconPosition = zone.boilingOil.location;

      // Vypočítání procentuálního progressu
      const boilingOil = zone.boilingOil!;
      const progress = Math.min(100, (boilingOil.readiness / boilingOil.readyAt) * 100);

      const boilingOilIcon = progress < 100 ?
        L.divIcon(useIconLeaflet({
          icon: "cauldron-empty",
          label: "",
          progress,
        }))
        : L.divIcon(useIconLeaflet({
          icon: "cauldron-full",
          label: ""
        }));

      if (boilingOilIcons[zone.key]) {
        boilingOilIcons[zone.key].setIcon(boilingOilIcon);
      } else {
        boilingOilIcons[zone.key] = L.marker(iconPosition, {icon: boilingOilIcon}).addTo(map);
      }
    });
  }

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

  function createInvaderIcon(
      map: L.Map,
      id: number,
      zoneKey: string,
      battleZones: BattleZone[],
      invaderIcons: { [p: number]: L.Marker<any> },
      type: InvaderType
  ) {
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
    const assemblyAreaIndex = invader.assemblyArea ? invader.assemblyArea : 0;
    const assemblyCoordinate = battleZone.assemblyArea[assemblyAreaIndex];

    if (assemblyCoordinate.lat && assemblyCoordinate.lng) {
      let invaderIcon = L.divIcon(useIconLeaflet({ icon: `invader-${type}`, label: "" }));
      invaderIcons[id] = L.marker([assemblyCoordinate.lat, assemblyCoordinate.lng], { icon: invaderIcon }).addTo(map);
    } else {
      console.warn(`No coordinate found for assemblyArea index ${assemblyAreaIndex} in zone ${zoneKey}`);
      return;
    }
  }

  function handleUpdateInvadersIcons(map: L.Map, battleZones: BattleZone[], invaderIcons: { [p: number]: L.Marker<any> }) {
    const currentInvaders: Invader[] = battleZones.flatMap((zone: BattleZone) => zone.invaders);

    // 1. Add new icons for invaders that don't have an icon yet
    battleZones.forEach((zone: BattleZone) => {
      zone.invaders.forEach(invader => {
        if (!invaderIcons[invader.id]) {
          createInvaderIcon(map, invader.id, zone.key, battleZones, invaderIcons, invader.type);
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

  function addBombardingMarks(map: L.Map, battleZones: BattleZone[]) {
    const storeGameInstance = useGameInstanceStore()
    let selectedMarker: L.Marker | null = null;

    battleZones.forEach(battleZone => {
      const bombardingTargetPosition = battleZone.assemblyAreaCenter;

      const icon = L.divIcon({
        className: "hh-bombarding-marker",
        html: `<img src="${bombardingMarkImage}" alt="" class="hh-bombarding-img">`,
        iconSize: [100, 100],
        iconAnchor: [50, 50], // Center the image
      });

      const bombardingMarker = L.marker(bombardingTargetPosition, {
        icon,
        interactive: true,
      }).addTo(map);

      // Click event for selecting the bombarding marker
      bombardingMarker.on("click", () => {
        const imgElement = bombardingMarker.getElement()?.querySelector(bombardingMarkClass);
        const alreadySelected = imgElement?.classList.contains(classPulsatingAnimation);

        // Remove animation from all other images
        document.querySelectorAll(bombardingMarkClass).forEach(img => {
          img.classList.remove(classPulsatingAnimation);
        });

        // Toggle animation to the clicked one
        if (alreadySelected) {
          storeGameInstance.cannonUsage.targetZoneId = '';
        } else {
          storeGameInstance.cannonUsage.targetZoneId = battleZone.key;
          imgElement?.classList.add(classPulsatingAnimation);
        }

        selectedMarker = bombardingMarker;
      });
    });
  }

  function removeBombardingMarkerAnimation() {
    const imgElements = document.querySelectorAll(bombardingMarkClass);
    imgElements.forEach(img => {
      img.classList.remove(classPulsatingAnimation);
    });
  }

  return { addLabelsToPolygons, addLadders, handleUpdateInvadersIcons, addBoilingOilPots, addBombardingMarks, removeBombardingMarkerAnimation };
}