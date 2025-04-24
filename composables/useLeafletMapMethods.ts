import L from "leaflet";
import {useCalculateSquareCorner} from "~/composables/useCoordinatesUtils";
import ladderImage from "assets/icons/ladder.svg";
import bombardingMarkImage from "assets/icons/target-zone-aim.svg";
import type {
  AssaultLadder,
  BattleZone,
  Coordinates,
  Invader,
  InvaderType,
  PlayerCoordinates,
  UtilityZone
} from "~/types/CustomTypes";
import {useIconLeaflet} from "~/composables/useIconLeaflet";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {gsap} from "gsap";
import {cannonBallSpeed} from "~/constants";

const classPulsatingAnimation = "hh-pulsate";
const bombardingMarkClass = ".hh-bombarding-img";

function animateStraightLine(
  map: L.Map,
  marker: L.Marker,
  start: L.LatLng,
  end: L.LatLng,
  duration: number = 1200,
  onComplete?: () => void
) {
  const startTime = performance.now();

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = progress * progress;

    const lat = start.lat + (end.lat - start.lat) * easedProgress;
    const lng = start.lng + (end.lng - start.lng) * easedProgress;

    marker.setLatLng([lat, lng]);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      map.removeLayer(marker);
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(step);
}

function showOilSplashEffect(map: L.Map, position: L.LatLng) {
  const splashIcon = L.divIcon({
    className: 'oil-splash-icon',
    html: '<div class="oil-splash"></div>',
    iconSize: [20, 20],
  });

  const splashMarker = L.marker(position, { icon: splashIcon }).addTo(map);

  const splashEl = splashMarker.getElement()?.querySelector('.oil-splash') as HTMLElement;

  if (splashEl) {
    splashEl.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    splashEl.style.transform = 'scale(0.5)';
    splashEl.style.opacity = '1';

    // Trigger transition
    setTimeout(() => {
      splashEl.style.transform = 'scale(3)';
      splashEl.style.opacity = '0';
    }, 20);

    // Remove marker after animation
    setTimeout(() => {
      map.removeLayer(splashMarker);
    }, 700);
  }
}

const bezierInterpolation = (t: number, points: [any]) => {
  const x = (1 - t) * (1 - t) * points[0].lng +
    2 * (1 - t) * t * points[1].lng +
    t * t * points[2].lng;

  const y = (1 - t) * (1 - t) * points[0].lat +
    2 * (1 - t) * t * points[1].lat +
    t * t * points[2].lat;

  return L.latLng(y, x);
};

const animateCannonball = (map: L.Map, marker: L.Marker, startLatLng: PlayerCoordinates, endLatLng: Coordinates) => {
  const startLatLngClipped = {lat: startLatLng.lat, lng: startLatLng.lng};

  const controlPoint = L.latLng(
    (startLatLngClipped.lat + endLatLng.lat) / 2 + 0.0003,  // Střed lat + posunutí nahoru
    (startLatLngClipped.lng + endLatLng.lng) / 2  // Střed lng
  );

  gsap.to(marker, {
    duration: cannonBallSpeed / 1000,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const currentLatLng = bezierInterpolation(progress, [startLatLngClipped, controlPoint, endLatLng]);
      marker.setLatLng(currentLatLng);
    },
    onComplete: () => {
      map.removeLayer(marker);

      // explosion effect
      const explosionIcon = L.divIcon({
        className: "cannonball-explosion",
        html: '<div class="cannonball-explosion"></div>',
        iconSize: [20, 20]
      });

      const explosionMarker = L.marker(endLatLng, { icon: explosionIcon }).addTo(map);

      requestAnimationFrame(() => {
        gsap.fromTo(
          ".cannonball-explosion",
          { scale: 0.5, opacity: 1 },
          { scale: 3, opacity: 0, duration: 1, ease: "power2.out", onComplete: () => {
              map.removeLayer(explosionMarker);
            }
          }
        );
      });
    }
  });
};

export function animatePouredOil(map: L.Map, zoneKey: string) {
  const storeGameInstance = useGameInstanceStore();

  const affectedZone = storeGameInstance.gameInstance.battleZones.find(
      (zone) => zone.key === zoneKey
  );
  if (!affectedZone) return;

  const affectedLadder: AssaultLadder = affectedZone.assaultLadder;
  const start = affectedLadder.location.end;
  const end = affectedLadder.location.start;

  const oilBlobIcon = L.divIcon(useIconLeaflet({
    icon: "oil-blob",
    label: "",
  }));

  const oilMarker = L.marker(start, { icon: oilBlobIcon }).addTo(map);

  animateStraightLine(map, oilMarker, start, end, 800, () => {
    showOilSplashEffect(map, end);
  });
}

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
      let invaderIcon = L.divIcon(useIconLeaflet({icon: `invader-${type}`, label: ""}));
      invaderIcons[id] = L.marker([assemblyCoordinate.lat, assemblyCoordinate.lng], {icon: invaderIcon}).addTo(map);
    } else {
      console.warn(`No coordinate found for assemblyArea index ${assemblyAreaIndex} in zone ${zoneKey}`);
      return;
    }
  }

  function handleUpdateInvadersIcons(map: L.Map, battleZones: BattleZone[], invaderIcons: {
    [p: number]: L.Marker<any>
  }) {
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

  function cannonBallTravel(
    map: L.Map,
    from: PlayerCoordinates,
    toZoneKey: string,
  ) {
    const storeGameInstance = useGameInstanceStore()
    const targetZoneCoordinates = storeGameInstance.gameInstance.battleZones.find(zone => zone.key === toZoneKey)?.assemblyAreaCenter;

    const cannonballIcon = L.divIcon({
      className: 'cannonball-icon',
      html: '<div class="cannonball"></div>',
      iconSize: [20, 20]
    });

    const cannonballMarker = L.marker(from, { icon: cannonballIcon }).addTo(map);

    animateCannonball(map, cannonballMarker, from, targetZoneCoordinates);
  }

  return {
    addLabelsToPolygons,
    addLadders,
    handleUpdateInvadersIcons,
    addBoilingOilPots,
    addBombardingMarks,
    removeBombardingMarkerAnimation,
    cannonBallTravel,
    animatePouredOil,
  };
}