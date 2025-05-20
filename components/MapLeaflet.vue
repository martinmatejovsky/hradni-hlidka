<script setup lang="ts">
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
import cannonLoading from "assets/icons/cannon-loading.svg";
import cannonFiring from "assets/icons/cannon-firing.svg";
const {
  animatePouredOil
} = useLeafletMapUtilities();

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
import {
  type BattleZone,
  type Invader,
  type PlayerData,
  type Coordinates,
  type UtilityZone,
  WeaponType
} from '~/types/CustomTypes';
import {useEventBus, useListenBus} from "~/composables/useEventBus";
import * as L from 'leaflet';
import 'leaflet.fullscreen/Control.FullScreen.js';
import 'leaflet.fullscreen/Control.FullScreen.css';
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
import {useLeafletMapUtilities} from "@/composables/useLeafletMapMethods";
import {useIconLeaflet} from "~/composables/useIconLeaflet";
import {Socket} from "socket.io-client";
import {useEvaluateWeaponAbility} from "~/composables/useEvaluateWeaponAbility";
import PanelFireCannon from "~/components/PanelFireCannon.vue";
import {useZoneIntersectionStore} from "~/stores/zoneIntersectionStore";

const {
  addLabelsToPolygons,
  addLadders,
  handleUpdateInvadersIcons,
  addBoilingOilPots,
  addBombardingMarks,
  cannonBallTravel,
} = useLeafletMapUtilities();

const emit = defineEmits(['leafletMapLoaded'])

// Pinia store
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();
const zoneIntersection = useZoneIntersectionStore();

const zoom = ref([18, 19, 20]);
let checkLeafletInterval: ReturnType<typeof setInterval>;
let trackingTimeout: ReturnType<typeof setTimeout>;
const markers = reactive<{ [key: string]: L.Marker }>({});
const invaderIcons = reactive<{ [key: number]: L.Marker }>({});
const boilingOilIcons: Record<string, L.Marker> = {};
const boilingOilPerkIcon = ref<HTMLElement | null>(null);
const battleZonePolygons = ref<L.Polygon[]>([]);
const utilityZonePolygons = ref<L.Polygon[]>([]);
const TRACKING_DELAY = 10000;
let oilPouredInLocation = ref<string>('')
let map: L.Map;

const props = defineProps({
  socket: {
    type: Socket || undefined,
    required: true
  },
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

const currentPlayer = computed(() => storeCurrentPlayer.currentPlayer);
const battleZones = computed((): BattleZone[] => storeGameInstance.gameInstance.battleZones);
const utilityZones = computed((): UtilityZone[] => storeGameInstance.gameInstance.utilityZones);
const cannonLoadingProgress = computed((): number => Math.min(100, (storeGameInstance.cannonUsage.loadingProgress / storeGameInstance.gameSettings.cannonLoadingTime) * 100));

const labelIconPouringOil = computed(() => {
  const { currentPlayer } = storeCurrentPlayer;

  if (currentPlayer.canPourBoilingOil) {
    return "Vylejte otočením";
  }

  return partnerForBoilingOilName.value
    ? `nesete s ${partnerForBoilingOilName.value}`
    : "musí nést dva";
});

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

const polygonColors = {
  battleZone: '255,120,0,0.4',
  battleZoneHighlighted: '255,120,0,0.7',
  utilityZone: '57,65,133,0.4',
  utilityZoneHighlighted: '57,65,133,0.8',
}

let oilPouringListener: ((event: DeviceOrientationEvent) => void) | null = null;

const getIconNameBasedOnWeaponType = (weaponType: WeaponType): string => {
  switch (weaponType) {
    case WeaponType.NONE:
      return 'defender-no-weapon';
    case WeaponType.SWORD:
      return 'defender-swordsman';
    case WeaponType.CANNON:
      return 'defender-cannon';
    default:
      return 'defender-swordsman';
  }
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

function triggerPouringOil() {
  if (!storeCurrentPlayer.currentPlayer.insideZone) return
  props.socket.emit(
      'oilIsPouredOff',
      {
        player: storeCurrentPlayer.currentPlayer
      },
  );

  oilPouredInLocation.value = zoneIntersection.nameOfIntersectedArea;
}

const startWatchingPouring = () => {
  if (!storeCurrentPlayer.currentPlayer.canPourBoilingOil) return;

  oilPouringListener = (event: DeviceOrientationEvent): void => {
    if (event.beta !== null) {
      // `beta` měří naklonění kolem horizontální osy. -90° = vzhůru nohama
      if (event.beta < -70) {
        triggerPouringOil();
      }
    }
  };

  window.addEventListener("deviceorientation", oilPouringListener);
};

const stopWatchingPouring = () => {
  if (oilPouringListener) {
    window.removeEventListener("deviceorientation", oilPouringListener);
    oilPouringListener = null;
  }
};

// WATCHERS

// can pour boiling oil?
watch(() => storeCurrentPlayer.currentPlayer.canPourBoilingOil, (canPour) => {
  if (canPour) {
    startWatchingPouring();
  }
});

// if new oil is picked, reset last location of poured oil
watch(() => storeCurrentPlayer.currentPlayer.perks.boilingOil, (boilingOil) => {
  if (boilingOil) {
    oilPouredInLocation.value = '';
  }
});
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

watch(() => props.connectedPlayers, (updatedConnectedPlayers: PlayerData[]) => {
  updatedConnectedPlayers.forEach((player: PlayerData) => {
    let marker = markers[player.key];
    if(!marker) return;

    if (player.key !== currentPlayer.value.key && player.location.lat && player.location.lng) {
      if (marker) {
        marker.setLatLng([player.location.lat, player.location.lng]);
      } else {
        let iconToUse = getIconNameBasedOnWeaponType(player.weaponType) + '-other';
        let otherPlayerIcon = L.divIcon(useIconLeaflet({ icon: iconToUse, label: player.name }));
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
  useListenBus('oilIsPouredGlobalEvent', (zoneKey) => animatePouredOil(map, zoneKey));
  useListenBus('cannonIsFiredGlobalEvent', ([zoneKey, firedBy]) => cannonBallTravel(map, firedBy, zoneKey));
  map = L.map('map').setView(props.mapCenter, zoom.value[1]);

  // create icon of recent player
  let iconToUse = getIconNameBasedOnWeaponType(currentPlayer.value.weaponType) + '-me';
  let currentPlayerIcon = L.divIcon(useIconLeaflet({ icon: iconToUse,  label: currentPlayer.value.name }));

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
      let iconToUse = getIconNameBasedOnWeaponType(player.weaponType) + '-other';

      let otherPlayerIcon = L.divIcon(useIconLeaflet({icon: iconToUse, label: player.name }));
      markers[player.key] = L.marker([player.location.lat, player.location.lng], { icon: otherPlayerIcon }).addTo(map);
    }
  })

  if (currentPlayer.value.location.lat && currentPlayer.value.location.lng) {
    markers[currentPlayer.value.key] = L.marker([currentPlayer.value.location.lat, currentPlayer.value.location.lng], { icon: currentPlayerIcon }).addTo(map);
  }

  for (const marker of Object.values(markers)) {
    L.DomUtil.addClass(marker._icon, 'hh-live-player-icon');
  }

  battleZones.value.forEach(battleZone => {
    const corners = battleZone.areaPresentational as LatLngExpression[];
    const polygon = L.polygon(corners, {
      color: `rgba(${polygonColors.battleZone})`,
    }).addTo(map);

    polygon.bindTooltip(battleZone.zoneName);
    battleZonePolygons.value.push(polygon);
  });

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
      if (useEvaluateWeaponAbility(currentPlayer.value.weaponType).canBombardAssemblyArea) addBombardingMarks(map, battleZones.value);
      if(props.nameOfIntersectedArea) highlightOccupiedPolygon(props.nameOfIntersectedArea)
      emit('leafletMapLoaded');
    }
  }, 200);
});

onBeforeUnmount(() => {
  clearInterval(checkLeafletInterval);
  clearTimeout(trackingTimeout);
  stopWatchingPouring()
})
</script>

<template>
  <div class="hh-battle-map position-relative">
    <div id="map"></div>

    <div class="hh-badges pa-3 no-pointer-events">
      <div v-if="storeCurrentPlayer.currentPlayer.perks.sharpSword > 0" class="hh-badge is-sharp-sword">
        <v-icon icon="mdi-sword" color="black" class="hh-badge__icon" size="32px"></v-icon>
      </div>

      <div
        ref="boilingOilPerkIcon"
        v-if="storeCurrentPlayer.currentPlayer.perks.boilingOil"
        class="hh-badge is-boiling-oil flex flex-column"
        :class="{
          'is-incomplete': !partnerForBoilingOilName,
          'is-ready-to-pour': storeCurrentPlayer.currentPlayer.canPourBoilingOil && !oilPouredInLocation,
          'is-already-poured': oilPouredInLocation,
        }"
      >

        <img :src="cauldronFullIcon" alt="Cauldron" class="custom-icon hh-badge__icon pb-1" @click="triggerPouringOil()" />

        <span class="mt-1">
          {{ oilPouredInLocation ? 'Vylito v ' + oilPouredInLocation : labelIconPouringOil }}
        </span>
      </div>

      <div
        v-if="useEvaluateWeaponAbility(currentPlayer.weaponType).canBombardAssemblyArea"
        class="hh-badge is-cannon flex flex-column"
      >
        <template v-if="storeGameInstance.getIsCannonReadyToFire">
          <img :src="cannonFiring" alt="cannon" class="custom-icon hh-badge__icon" />
        </template>

        <template v-else>
          <img :src="cannonLoading" alt="cannon" class="custom-icon hh-badge__icon" />

          <div class="hh-progress-bar-container">
            <div class="hh-progress-bar" :style="`width: ${cannonLoadingProgress}%;`"></div>
          </div>
        </template>
      </div>

      <div class="hh-kill-score d-flex justify-center align-center ml-auto">
        <span>{{ currentPlayer.killScore }}</span>
      </div>
    </div>

    <div class="hh-map-bottom-controls">
      <VFadeTransition>
        <PanelFireCannon
          v-if="storeGameInstance.getIsCannonReadyToFire"
          :socket="socket"
        />
      </VFadeTransition>

      <div class="hh-area-switchers pa-2 flex justify-space-between">
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="auto" v-for="zone in battleZones" :key="zone.zoneName">
            <v-btn
                rounded="xs"
                size="small"
                @click="map.setView(zone.assaultLadder.steps[5], zoom[1])"
                class="hh-area-switcher-btn mx-3 my-1"
                :text="zone.zoneName"
            >
              {{ zone.zoneName }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>
