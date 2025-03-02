<script setup lang="ts">
import cauldronFullIcon from "assets/icons/cauldron-full.svg";

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
import {useEventBus, useListenBus} from "~/composables/useEventBus";
import * as L from 'leaflet';
import 'leaflet.fullscreen/Control.FullScreen.js';
import 'leaflet.fullscreen/Control.FullScreen.css';
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
import {useLeafletMapUtilities} from "@/composables/useLeafletMapMethods";
import {useIconLeaflet} from "~/composables/useIconLeaflet";

const {
  addLabelsToPolygons,
  addLadders,
  handleUpdateInvadersIcons,
  addBoilingOilPots
} = useLeafletMapUtilities();

// Pinia store
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();

const zoom = ref([18, 19, 20]);
let checkLeafletInterval: ReturnType<typeof setInterval>;
let trackingTimeout: ReturnType<typeof setTimeout>;
const markers = reactive<{ [key: string]: L.Marker }>({});
const invaderIcons = reactive<{ [key: number]: L.Marker }>({});
const boilingOilIcons: Record<string, L.Marker> = {};
const battleZonePolygons = ref<L.Polygon[]>([]);
const utilityZonePolygons = ref<L.Polygon[]>([]);
const TRACKING_DELAY = 10000;
let map: L.Map;

const currentPlayer = computed(() => storeCurrentPlayer.currentPlayer);
const battleZones = computed((): BattleZone[] => storeGameInstance.gameInstance.battleZones);
const utilityZones = computed((): UtilityZone[] => storeGameInstance.gameInstance.utilityZones);

const partnerForBoilingOilName = computed((): string => {
  const myCarriedPot = storeGameInstance.gameInstance.carriedOilPots.find(pot =>
      pot.carriedBy.includes(currentPlayer.value.key)
  );
  if(!myCarriedPot) return '';

  const otherPlayerId = myCarriedPot.carriedBy.find(id => id !== currentPlayer.value.key);

  if (!otherPlayerId) return '';

  const otherPlayer = storeGameInstance.gameInstance.players.find(player => player.key === otherPlayerId);

  return otherPlayer ? otherPlayer.name : '';
});

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

watch(
    () => utilityZones.value.map(zone => zone),
    (newUtilityZone) => {
        addBoilingOilPots(map, newUtilityZone, boilingOilIcons);
    },
    { deep: true }
)

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
        let otherPlayerIcon = L.divIcon(useIconLeaflet({ icon: "defender-swordsman",  label: player.name }));
        marker = L.marker([player.location.lat, player.location.lng], { icon: otherPlayerIcon }).addTo(map);
      }
    }

    // add class if smithy upgrade is active
    const element = marker.getElement();

    if (element) {
      if (player.perks.sharpSword > 0) {
        element.classList.add('has-upgrade-smithy');
      } else {
        element.classList.remove('has-upgrade-smithy');
      }
    }
  });
});

// LIFECYCLE
onMounted(async () => {
  useListenBus('updateLifeOfInvaders', () => handleUpdateInvadersIcons(map, battleZones.value, invaderIcons));

  map = L.map('map').setView(props.mapCenter, zoom.value[1]);

  // create icon of recent player
  let currentPlayerIcon = L.divIcon(useIconLeaflet({ icon: "defender-swordsman",  label: currentPlayer.value.name }));

  L.TileLayer.Battlefield = L.TileLayer.extend({
    getTileUrl: function (coords: {x: string, y: string, z: string}) {
      return `/map-layers/{z}/{x}/{y}.png`
          .replace('{z}', coords.z)
          .replace('{x}', coords.x)
          .replace('{y}', coords.y);
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

  map.on('enterFullscreen', function () {
    useEventBus('leafletFullscreen', true);
  });

  map.on('exitFullscreen', function () {
    useEventBus('leafletFullscreen', false);
  });

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

  addBoilingOilPots(map, utilityZones.value, boilingOilIcons);

  // labels for battleZones
  addLabelsToPolygons(map, battleZonePolygons.value);
  addLabelsToPolygons(map, utilityZonePolygons.value);

  // vykreslit ikonky utocniku, pokud uz nejaci maji byt na mape
  handleUpdateInvadersIcons(map, battleZones.value, invaderIcons);

  // Počkejme, až se leafletRotated.js načte. Jinak vyhotovení některých funkcí selže.
  checkLeafletInterval = setInterval(() => {
    if (L.imageOverlay && typeof L.imageOverlay.rotated === "function") {
      clearInterval(checkLeafletInterval);
      addLadders(map, battleZones.value);
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

    <div class="hh-badges hh-above-fullscreen-leaflet pa-3">
      <div v-if="storeCurrentPlayer.currentPlayer.perks.sharpSword > 0" class="hh-badge is-sharp-sword">
        <v-icon icon="mdi-sword" color="black" class="hh-badge__icon" size="32px"></v-icon>
      </div>

      <div
        v-if="storeCurrentPlayer.currentPlayer.perks.boilingOil"
        class="hh-badge is-boiling-oil flex flex-column"
        :class="{'is-incomplete': !partnerForBoilingOilName}">

        <img :src="cauldronFullIcon" alt="Cauldron" class="custom-icon hh-badge__icon" />
        <span class="pt-1">
          {{ partnerForBoilingOilName
            ? `nesete s ${partnerForBoilingOilName}`
            : 'musí nést dva'
          }}
        </span>
      </div>
    </div>

    <div class="hh-area-switchers hh-above-fullscreen-leaflet pa-2 flex justify-space-between">
      <v-row align="center" justify="center">
        <v-col cols="auto" v-for="zone in battleZones" :key="zone.zoneName">
          <v-btn
              rounded="xs"
              size="small"
              @click="map.setView(zone.assaultLadder.steps[5], zoom[1])"
              class="hh-area-switcher-btn"
              :text="zone.zoneName"
          >
            {{ zone.zoneName }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
