<script setup lang="ts">

import type {LatLngExpression} from "leaflet";

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
import type { PlayerData } from '~/types/CustomTypes';
import { STORE_CURRENT_PLAYER } from '~/constants';
import ladderImage from '~/assets/icons/ladder.svg';
import * as L from 'leaflet';
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const zoom = ref([19, 20]);

// helper points. Must be in object of game area
const ladderStart: L.LatLngTuple  = [50.1912128, 12.7434836];
const ladderEnd: L.LatLngTuple = [50.1912128, 12.7432047];
const battleZones = ref(useGetterBattleZones)
let checkLeafletInterval: ReturnType<typeof setInterval>;

const props = defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
});

const markers = reactive<{ [key: string]: L.Marker }>({});
let map: L.Map;

onMounted(async () => {
  map = L.map('map').setView([50.1910336, 12.7435078], zoom.value[0]);

  let currentPlayerIcon = L.divIcon(useIconLeaflet({ label: currentPlayer.value.name }));

  L.TileLayer.Battlefield = L.TileLayer.extend({
    getTileUrl: function (coords) {
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
    if (player.key !== currentPlayer.value.key && player.location.latitude && player.location.longitude) {
      let otherPlayerIcon = L.divIcon(useIconLeaflet({ label: player.name }));
      markers[player.key] = L.marker([player.location.latitude, player.location.longitude], { icon: otherPlayerIcon }).addTo(map);
    }
  })

  if (currentPlayer.value.location.latitude && currentPlayer.value.location.longitude) {
    markers[currentPlayer.value.key] = L.marker([currentPlayer.value.location.latitude, currentPlayer.value.location.longitude], { icon: currentPlayerIcon }).addTo(map);
  }

  // Přidání orientacnich obdélníků pro každou battleZone
  battleZones.value.forEach(battleZone => {
    const corners = battleZone.cornerCoordinates

    console.table(corners)

    L.polygon(corners, { color: "#ff7800", weight: 1 }).addTo(map);
  });

  // Počkejte, až se leafletRotated.js načte
  checkLeafletInterval = setInterval(() => {
    if (L.imageOverlay && typeof L.imageOverlay.rotated === "function") {
      clearInterval(checkLeafletInterval);
      addLadders();
    }
  }, 200);
});

// Funkce pro přidání žebříků
function addLadders() {
  const ladderCorner = useCalculateSquareCorner(ladderStart, ladderEnd);

  let overlayLadder = L.imageOverlay.rotated(ladderImage, ladderCorner, ladderEnd, ladderStart, {
    interactive: false,
  }).addTo(map);
}

watch(() => currentPlayer.value.location, (newLocation) => {
  if (newLocation.latitude && newLocation.longitude) {
    const marker = markers[currentPlayer.value.key];
    if (marker) {
      marker.setLatLng([newLocation.latitude, newLocation.longitude]);
    }
  }
});

watch(() => props.connectedPlayers, (updatedConnectedPlayers) => {
  updatedConnectedPlayers.forEach((player: PlayerData) => {
    if (player.key !== currentPlayer.value.key && player.location.latitude && player.location.longitude) {
      const marker = markers[player.key];
      if (marker) {
        marker.setLatLng([player.location.latitude, player.location.longitude]);
      } else {
        let otherPlayerIcon = L.divIcon(useIconLeaflet({ label: player.name }));
        markers[player.key] = L.marker([player.location.latitude, player.location.longitude], { icon: otherPlayerIcon }).addTo(map);
      }
    }
  });
});

onBeforeUnmount(() => {
  clearInterval(checkLeafletInterval)
})

</script>

<template>
  <p>Curent player position: {{currentPlayer.location.latitude}} {{currentPlayer.location.longitude}}</p>

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

.hh-ladder {
  position: absolute;
  background-image: url('assets/icons/ladder.svg');
  background-size: contain;
  transform-origin: top left;
}
</style>
