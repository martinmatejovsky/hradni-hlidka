<script setup lang="ts">
useHead({
  script: [ { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', defer: true, integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=", crossorigin: "" } ],
  link: [{ href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=", crossorigin: "" }]
})

import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";
import {STORE_CURRENT_PLAYER} from "~/constants";

const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const zoom = ref(11)

const props = defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
});

const markers = reactive<{ [key: string]: L.Marker }>({});

onMounted(() => {
  let map = L.map('map').setView([50.1912094, 12.7429419], zoom.value);

  let currentPlayerIcon = L.divIcon(useIconLeaflet({label: currentPlayer.value.name}));

  L.TileLayer.Battlefield = L.TileLayer.extend({
    getTileUrl: function(coords) {
      return `/map-layers/{z}/{x}/{y}.png`
          .replace('{z}', coords.z)
          .replace('{x}', coords.x)
          .replace('{y}', coords.y);
    },
    getAttribution: function() {
      return '&copy; Martin Matějovský, bejby'
    },
    options: {
      minZoom: 11,
      maxZoom: 11,
    }
  });

  L.tileLayer.battlefield = function() {
    return new L.TileLayer.Battlefield();
  }

  L.tileLayer.battlefield().addTo(map);

  props.connectedPlayers.forEach((player: PlayerData) => {
    if (player.key !== currentPlayer.value.key && player.location.latitude && player.location.longitude) {
      let otherPlayerIcon = L.divIcon(useIconLeaflet({label: player.name}));
      markers[player.key] = L.marker([player.location.latitude, player.location.longitude], { icon: otherPlayerIcon }).addTo(map);
    }
  })

  if (currentPlayer.value.location.latitude && currentPlayer.value.location.longitude) {
    markers[currentPlayer.value.key] = L.marker([currentPlayer.value.location.latitude, currentPlayer.value.location.longitude], {icon: currentPlayerIcon}).addTo(map)
  }

})

// write watch method to watch changes in currentPlayer.value.location and update the map with new location of the player
watch(() => currentPlayer.value.location, (newLocation) => {
  if (newLocation.latitude && newLocation.longitude) {
    const marker = markers[currentPlayer.value.key];
    if (marker) {
      marker.setLatLng([newLocation.latitude, newLocation.longitude]);
    }
  }
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
</style>
