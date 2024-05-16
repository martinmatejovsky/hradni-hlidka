<script setup lang="ts">
import horseRiderIcon from "assets/icons/horse-rider.svg";
import {useState} from "nuxt/app";
import type {GameInstance, PlayerData} from "~/types/CustomTypes";
import {STORE_GAME_INSTANCE} from "~/constants";

const currentGame = useState<GameInstance>(STORE_GAME_INSTANCE)
const pageError = useStoredApplicationError()

// STATE INITIAL VALUES
const storedGeolocationWatcher = useStoredGeolocationWatcher();

// COMPUTED
const connectedPlayers = computed((): PlayerData[] => {
  return currentGame && currentGame.value ? [...currentGame.value?.players] : [];
});

watch(connectedPlayers, (players) => {
  players.forEach((player: PlayerData): null => {
    let currentPlayerIcon = L.divIcon({
      className: 'h-rider-icon',
      html: `<img class="h-rider-icon-image" alt="" src="${horseRiderIcon}"/>` +
          `<span class="h-rider-icon-description">${player.name}</span>`,
    });

    L.marker([player.location.latitude, player.location.longitude], { icon: currentPlayerIcon }).addTo(map);
  });
});

// LIFECYCLE HOOKS
onBeforeMount(() => {
  useStoredCurrentPlayer()
  useInitializePlayerGeolocationWatcher();
})

onMounted(() => {
  let map = L.map('map').setView([50.1912094, 12.7429419], 11);

  let currentPlayerIcon = L.divIcon({
    className: 'h-rider-icon',
    html: `<img class="h-rider-icon-image" alt="" src="${horseRiderIcon}"/>`+
        '<span class="h-rider-icon-description">Hrdina</span>',
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

  // L.marker([50.1912094, 12.7429419], {icon: currentPlayerIcon}).addTo(map)
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
});
</script>

<template>
  <v-app>
    <v-container class="bg-surface-variant mb-6">
      <v-app-bar title="Hradní hlídka"></v-app-bar>
      <v-main>
        <div v-if="pageError">
          <v-alert type="error" class="mb-4" dismissible v-html="pageError"></v-alert>
        </div>

        <NuxtPage/>

        <p>players: {{ connectedPlayers.length }}</p>
        <div id="map"></div>
      </v-main>
    </v-container>
  </v-app>
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
</style>
