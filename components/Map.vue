<script setup lang="ts">

useHead({
  script: [
    {
      src: "/leafletRotated.js",
      defer: true
    }
  ],
  link: [
    {
      href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
      crossorigin: ""
    }
  ],
});

import type {LatLngExpression} from "leaflet";
import type {BattleZone, Invader, PlayerData, Coordinates, UtilityZone} from '~/types/CustomTypes';
import {useListenBus} from "~/composables/useEventBus";
import ladderImage from '~/assets/icons/ladder.svg';
import * as L from 'leaflet';
import 'leaflet.fullscreen/Control.FullScreen.js';
import 'leaflet.fullscreen/Control.FullScreen.css';
import {useCalculateSquareCorner} from "~/composables/useCoordinatesUtils";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";

// Pinia store
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();

const zoom = ref([18, 19, 20]);
let checkLeafletInterval: ReturnType<typeof setInterval>;
let trackingTimeout: ReturnType<typeof setTimeout>;
const markers = reactive<{ [key: string]: L.Marker }>({});
const invaderIcons = reactive<{ [key: number]: L.Marker }>({});
const battleZonePolygons = ref<L.Polygon[]>([]);
const utilityZonePolygons = ref<L.Polygon[]>([]);
const TRACKING_DELAY = 10000;
let map: L.Map;

const currentPlayer = computed(() => storeCurrentPlayer.currentPlayer);
const battleZones = computed((): BattleZone[] => storeGameInstance.gameInstance.battleZones);
const utilityZones = computed((): UtilityZone[] => storeGameInstance.gameInstance.utilityZones);

const props = defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
  mapCenter: {
    type: Object as PropType<Coordinates>,
    required: true
  },
  nameOfIntersectedArea: {
    type: String as PropType<string>,
  }
});

const polygonColors = {
  battleZone: '255,120,0,0.4',
  battleZoneHighlighted: '255,120,0,0.7',
  utilityZone: '57,65,133,0.4',
  utilityZoneHighlighted: '57,65,133,0.8',
}

// Simplified comparison function for Invader objects
function simpleEqual (obj1: Invader, obj2: Invader): boolean {
  return (
      obj1.id === obj2.id &&
      obj1.assemblyArea === obj2.assemblyArea &&
      obj1.ladderStep === obj2.ladderStep
  );
}

function arraysEqual (arr1: Invader[], arr2: Invader[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (!simpleEqual(arr1[i], arr2[i])) return false;
  }
  return true;
}

function addLabelsToPolygons(polygons: L.Polygon[]) {
  polygons.forEach(polygon => {
    const zoneKey = polygon.getTooltip()?.getContent() || '' ;
    if (!zoneKey) return;

    const bounds = polygon.getBounds();
    const center = bounds.getCenter();
    const label = new L.Marker(center, {
      icon: L.divIcon({
        className: 'hh-zone-label',
        html: zoneKey,
        iconSize: [100, 20],
        iconAnchor: [50, 10],
        css
      })
    });

    label.addTo(map);


    // polygons.forEach(polygon => {
    //   const zoneKey = polygon.getTooltip()?.getContent();
    //
    //   polygon
    //       .bindTooltip(zoneKey, {
    //         permanent: true, // The label remains visible
    //         direction: "center", // Center the text inside the polygon
    //         className: "custom-polygon-label", // Custom styling
    //         offset: [0, 0]
    //       })
    //       .openTooltip();
    // });
  });
}
function addLadders() {
  battleZones.value.forEach(battleZone => {
    const ladder = battleZone.assaultLadder.location

    const ladderCorner = useCalculateSquareCorner(battleZone.assaultLadder);

    L.imageOverlay.rotated(ladderImage, ladderCorner, ladder.end, ladder.start, {
      interactive: false,
      id: 'ladder-' + battleZone.key,
      className: "hh-ladder-image"
    }).addTo(map);
  })
}

function handleUpdateInvadersIcons() {
  const currentInvaders: Invader[] = battleZones.value.flatMap((zone: BattleZone) => zone.invaders);

  // 1. Add new icons for invaders that don't have an icon yet
  battleZones.value.forEach((zone: BattleZone) => {
    zone.invaders.forEach(invader => {
      if (!invaderIcons[invader.id]) {
        createInvaderIcon(invader.id, zone.key)
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

function updateInvadersOnMap(index: number) {
  let zone = battleZones.value[index];

  zone.invaders.forEach(invader => {
    const marker = invaderIcons[invader.id];
    if (!marker) {
      console.warn(`Marker for invader ${invader.id} not found.`);
      return;
    }

    let newCoordinates: Coordinates | null = null;

    if (invader.assemblyArea !== null) {
      newCoordinates = zone.assemblyArea[invader.assemblyArea];
    } else if (invader.ladderStep !== null) {
      newCoordinates = zone.assaultLadder.steps[invader.ladderStep];
    } else return;

    if (newCoordinates?.lat && newCoordinates?.lng) {
      marker.setLatLng([newCoordinates.lat, newCoordinates.lng]);

      const element = marker.getElement();

      if (element) {
        element.innerHTML = `${invader.health}`;
      }
    } else {
      console.warn(`No valid coordinates found for invader ${invader.id}.`);
    }
  });
}

function createInvaderIcon(id: number, zoneKey: string) {
  const battleZone = battleZones.value.find(zone => zone.key === zoneKey);
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

function highlightOccupiedPolygon(polygonKey: string | undefined) {
  // Reset all polygons to default colors
  battleZonePolygons.value.forEach(polygon => {
    const zoneKey = polygon.getTooltip()?.getContent();
    const isInside = zoneKey === polygonKey;

    polygon.setStyle({
      color: zoneKey === polygonKey
          ? `rgba(${polygonColors.battleZoneHighlighted})`
          : `rgba(${polygonColors.battleZone})`,
      fillOpacity: isInside ? 0.9 : 0.3
    });
  });


  utilityZonePolygons.value.forEach(polygon => {
    const zoneKey = polygon.getTooltip()?.getContent();
    const isInside = zoneKey === polygonKey;

    polygon.setStyle({
      color: zoneKey === polygonKey
          ? `rgba(${polygonColors.utilityZoneHighlighted})`
          : `rgba(${polygonColors.utilityZone})`,
      fillOpacity: isInside ? 0.6 : 0.3
    });
  });
}

function startTracking() {
  map.locate({ watch: true, enableHighAccuracy: true });
}

function pauseTracking() {
  clearTimeout(trackingTimeout);
  map.stopLocate();
  trackingTimeout = setTimeout(() => {
    startTracking();
  }, TRACKING_DELAY);
}

// WATCHERS

// change color of polygon where currentUser is
watch(
  () => props.nameOfIntersectedArea,
  (newAreaKey) => {
    highlightOccupiedPolygon(newAreaKey)
  }
);

// watch changes in invaders
watch(
  () => battleZones.value.map(zone => zone.invaders),
  (newInvaders, oldInvaders) => {
    for (let i = 0; i < newInvaders.length; i++) {
      if (!arraysEqual(newInvaders[i], oldInvaders[i])) {
        updateInvadersOnMap(i);
      }
    }
  },
  { deep: true }
);

watch(() => currentPlayer.value.location, (newLocation) => {
  if (newLocation.lat && newLocation.lng) {
    const marker = markers[currentPlayer.value.key];
    if (marker) {
      marker.setLatLng([newLocation.lat, newLocation.lng]);
    }
  }
});

watch(() => props.connectedPlayers, (updatedConnectedPlayers) => {
  updatedConnectedPlayers.forEach((player: PlayerData) => {
    let marker = markers[player.key];
    if(!marker) return;

    if (player.key !== currentPlayer.value.key && player.location.lat && player.location.lng) {
      if (marker) {
        marker.setLatLng([player.location.lat, player.location.lng]);
      } else {
        let otherPlayerIcon = L.divIcon(useIconLeaflet({ label: player.name }));
        marker = L.marker([player.location.lat, player.location.lng], { icon: otherPlayerIcon }).addTo(map);
      }
    }

    // add class if smithy upgrade is active
    const element = marker.getElement();

    if (element) {
      if (player.perks.smithyUpgrade > 0) {
        element.classList.add('has-upgrade-smithy');
      } else {
        element.classList.remove('has-upgrade-smithy');
      }
    }
  });
});

// LIFECYCLE
onMounted(async () => {
  useListenBus('updateLifeOfInvaders', handleUpdateInvadersIcons)

  map = L.map('map').setView(props.mapCenter, zoom.value[1]);

  // create icon of recent player
  let currentPlayerIcon = L.divIcon(useIconLeaflet({ label: currentPlayer.value.name }));

  L.TileLayer.Battlefield = L.TileLayer.extend({
    getTileUrl: function (coords: {x: string, y: string, z: string}) {
      return `/map-layers/{z}/{x}/{y}.png`
          .replace('{z}', coords.z)
          .replace('{x}', coords.x)
          .replace('{y}', coords.y);
    },
    getAttribution: function () {
      return '&copy; Martin Matějovský, bejby';
    },
    options: {
      minZoom: zoom.value[0],
      maxZoom: zoom.value[zoom.value.length - 1],
      errorTileUrl: '/map-layers/fog-of-war.png'
    }
  });

  L.tileLayer.battlefield = function () {
    return new L.TileLayer.Battlefield();
  }

  L.tileLayer.battlefield().addTo(map);

  // Center the map on default coordinates initially
  map.setView(props.mapCenter, zoom.value[1]);

  // Start locating the user and keep tracking
  startTracking();

  map.on('locationfound', (e) => {
    map.setView(e.latlng, map.getZoom());
  });

  map.on('locationerror', (e) => {
    console.warn('Location error:', e.message);
  });

  map.on('dragstart', () => {
    pauseTracking();
  });

  // taken from https://github.com/brunob/leaflet.fullscreen, I do not know how to run it correctly...
  L.control
    .fullscreen({
      position: 'topleft',
      title: 'Show me the fullscreen!',
      titleCancel: 'Exit fullscreen mode',
      content: null, // change the content of the button, can be HTML, default null
      forceSeparateButton: true,
      forcePseudoFullscreen: true,
      fullscreenElement: false
    })
    .addTo(map);

  // render PLAYER ICONS
  props.connectedPlayers.forEach((player: PlayerData) => {
    if (player.key !== currentPlayer.value.key && player.location.lat && player.location.lng) {
      let otherPlayerIcon = L.divIcon(useIconLeaflet({ label: player.name }));
      markers[player.key] = L.marker([player.location.lat, player.location.lng], { icon: otherPlayerIcon }).addTo(map);
    }
  })

  if (currentPlayer.value.location.lat && currentPlayer.value.location.lng) {
    markers[currentPlayer.value.key] = L.marker([currentPlayer.value.location.lat, currentPlayer.value.location.lng], { icon: currentPlayerIcon }).addTo(map);
  }

  // Přidání orientacnich obdélníků pro každou battleZone
  battleZones.value.forEach(battleZone => {
    const corners = battleZone.areaPresentational as LatLngExpression[];
    const polygon = L.polygon(corners, {
      color: `rgba(${polygonColors.battleZone})`,
    }).addTo(map);

    polygon.bindTooltip(battleZone.zoneName);
    battleZonePolygons.value.push(polygon);
  });

  // Přidání orientacnich obdélníků pro každou utilityZone. Testovací účely.
  utilityZones.value.forEach(utilityZone => {
    const corners = utilityZone.areaPresentational as LatLngExpression[];
    const polygon = L.polygon(corners, {
      color: `rgba(${polygonColors.utilityZone}`,
    }).addTo(map);

    polygon.bindTooltip(utilityZone.zoneName);
    utilityZonePolygons.value.push(polygon);
  });

  // labels for battleZones
  addLabelsToPolygons(battleZonePolygons.value);
  addLabelsToPolygons(utilityZonePolygons.value);

  // vykreslit ikonky utocniku, pokud uz nejaci maji byt na mape
  handleUpdateInvadersIcons();

  // Počkejme, až se leafletRotated.js načte
  checkLeafletInterval = setInterval(() => {
    if (L.imageOverlay && typeof L.imageOverlay.rotated === "function") {
      clearInterval(checkLeafletInterval);
      addLadders();
    }
  }, 200);
});

onBeforeUnmount(() => {
  clearInterval(checkLeafletInterval)
  clearTimeout(trackingTimeout);
})
</script>

<template>
  <div class="hh-battle-map position-relative">
    <div id="map"></div>
  </div>
</template>
