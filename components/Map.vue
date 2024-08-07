<script setup lang="ts">

import type {LatLngExpression} from "leaflet";
import {useGetterBattleZones} from "~/composables/getters";

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
  ]
});

import { ref, onMounted, watch, reactive } from 'vue';
import { useState } from 'nuxt/app';
import type {Invader, PlayerData} from '~/types/CustomTypes';
import { STORE_CURRENT_PLAYER } from '~/constants';
import ladderImage from '~/assets/icons/ladder.svg';
import * as L from 'leaflet';
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const battleZones = ref(useGetterBattleZones)
const zoom = ref([19, 20]);
let checkLeafletInterval: ReturnType<typeof setInterval>;
let mapElement: HTMLElement | null = null;

const props = defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
});

const markers = reactive<{ [key: string]: L.Marker }>({});
const invaderIcons = reactive<{ [key: number]: HTMLDivElement }>({});

let map: L.Map;

// Simplified comparison function for Invader objects
function simpleEqual (obj1: Invader, obj2: Invader): boolean {
  return (
      obj1.id === obj2.id &&
      obj1.assembleArea === obj2.assembleArea &&
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
  if (!mapElement) {
    mapElement = document.getElementById('map');
  }

  console.log("updating invaders in", index, battleZones.value[index].zoneName)

  battleZones.value[index].invaders.forEach(invader => {
    // Check if invader is on the ladder
    if (invader.ladderStep !== null) {
      console.log("climbing is ID", invader.id)

      // Create or update the invader icon
      if (!invaderIcons[invader.id]) {
        // Create new icon
        const invaderIcon = document.createElement('div');
        invaderIcon.classList.add('hh-invader-icon');
        invaderIcon.id = `invader-${invader.id}`;
        invaderIcon.textContent = `Invader ${invader.id}`;
        mapElement!.appendChild(invaderIcon);
        invaderIcons[invader.id] = invaderIcon;
      }
      // Update the invader icon position or other properties if needed
      // For example: invaderIcons[invader.id].style.left = `${invader.ladderStep * 10}px`;
    }
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

// WATCHERS

// watch changes in invaders
watch(
    () => battleZones.value.map(zone => zone.invaders),
    (newInvaders, oldInvaders) => {
      for (let i = 0; i < newInvaders.length; i++) {
        if (!arraysEqual(newInvaders[i], oldInvaders[i])) {
          updateInvadersOnMap(i);
        }
      }

      console.log("DIV invaders:")
      console.table(invaderIcons)
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
    if (player.key !== currentPlayer.value.key && player.location.lat && player.location.lng) {
      const marker = markers[player.key];
      if (marker) {
        marker.setLatLng([player.location.lat, player.location.lng]);
      } else {
        let otherPlayerIcon = L.divIcon(useIconLeaflet({ label: player.name }));
        markers[player.key] = L.marker([player.location.lat, player.location.lng], { icon: otherPlayerIcon }).addTo(map);
      }
    }
  });
});

// LIFECYCLE
onMounted(async () => {
  map = L.map('map').setView([50.1910336, 12.7435078], zoom.value[0]);

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
    }
  });

  L.tileLayer.battlefield = function () {
    return new L.TileLayer.Battlefield();
  }

  L.tileLayer.battlefield().addTo(map);

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
    const corners = battleZone.cornerCoordinates as LatLngExpression[]

    L.polygon(corners, { color: "#ff7800", weight: 1 }).addTo(map);
  });

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
})

</script>

<template>
  <p>Curent player position: {{currentPlayer.location.lat}} {{currentPlayer.location.lng}}</p>

  <div id="map"></div>
</template>

<style>
:root {
  --icon-leaflet-body-size: 100px;
}
#map {
  height: 60vh;
  width: 100%;
}
.h-icon-leaflet {
  width: var(--icon-leaflet-body-size);
  transform: translate(calc(var(--icon-leaflet-body-size) / -2), -12px);
}
.h-rider-icon-description {
  color: #000000;
  font-size: 14px;
  font-weight: bold;
}
.leaflet-marker-icon {
  position: relative;
  transition: all 0.3s;
}
.hh-ladder-image {
  position: absolute;
}
.hh-invader-icon {
  position: relative;
  width: auto;
  height: auto;
  padding: 4px;
  background-color: #af1b7b;
  color: white;
  float: right;
  z-index: 400;
}
</style>
