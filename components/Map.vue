<script setup lang="ts">
useHead({
  script: [ { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', defer: true, integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=", crossorigin: "" } ],
  link: [{ href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=", crossorigin: "" }]
})

import {useState} from "nuxt/app";
import type {PlayerData} from "~/types/CustomTypes";
import {STORE_CURRENT_PLAYER} from "~/constants";
import horseRiderIcon from '~/assets/icons/horse-rider.svg';

const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const zoom = ref(11)

defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
});

onMounted(() => {
  let map = L.map('map').setView([50.1912094, 12.7429419], zoom.value);

  let currentPlayerIcon = L.divIcon({
    className: 'h-rider-icon',
    html: `<img class="h-rider-icon-image" alt="" src="${horseRiderIcon}"/>`+
        '<span class="h-rider-icon-description">{{ currentPlayer.name }}</span>',
  });

  L.TileLayer.Battlefield = L.TileLayer.extend({
    getTileUrl: function(coords) {
      return `/map-layers/{z}/{x}/{y}.png`
          .replace('{z}', coords.z)
          .replace('{x}', coords.x)
          .replace('{y}', coords.y);
    },
    getAttribution: function() {
      return '&copy; Martin Matějovský, bejby'
    }
  });

  L.tileLayer.battlefield = function() {
    return new L.TileLayer.Battlefield();
  }

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  L.tileLayer.battlefield().addTo(map);

  // TODO: this does not work. How to get it from defineProps?
  connectedPlayers.value.forEach((player: PlayerData) => {
    if (player.key !== currentPlayer.value.key) {
      let otherPlayerIcon = L.divIcon({
        className: 'h-rider-icon',
        html: `<img class="h-rider-icon-image" alt="" src="${horseRiderIcon}"/>`+
            '<span class="h-rider-icon-description">{{ player.name }}</span>',
      });
      L.marker([player.location.latitude, player.location.longitude], {icon: otherPlayerIcon}).addTo(map)
    }
  })

  L.marker([50.1912094, 12.7429419], {icon: currentPlayerIcon}).addTo(map)

})
</script>

<template>
  <p>connected players count: {{connectedPlayers?.length}}</p>

  <div id="map"></div>
</template>

<style>
#map {
  height: 60vh;
  width: 100%;
}

.h-rider-icon-description {
  color: #000000;
  font-size: 14px;
  font-weight: bold;
}

.leaflet-marker-icon {
  transition: all 0.3s;
}
</style>
