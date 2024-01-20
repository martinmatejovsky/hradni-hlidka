<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p>Lat, lon:</p>
  <p>
    {{ playerLocation.latitude }} {{ playerLocation.longitude }}</p>
  <p>Accuracy: {{ playerLocation.accuracy }}</p>
  <p>Is inside?</p>
  <p class="text-h1 text-red">{{ isInsideArea }}</p>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import type { Coordinates } from '../types/CustomTypes'
import { gameAreas } from '../data/gameAreas'

const errorMessage = ref(null as string | null)
const playerLocation = ref({
  latitude: undefined,
  longitude: undefined,
  accuracy: undefined,
} as Coordinates)
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
}
function isPointInsidePolygon(point: Coordinates, gameArea: Coordinates[]) {
  const x = point.latitude;
  const y = point.longitude;
  let isInside = false;

  for (let i = 0, j = gameArea.length - 1; i < gameArea.length; j = i++) {
    const xi = gameArea[i].latitude;
    const yi = gameArea[i].longitude;
    const xj = gameArea[j].latitude;
    const yj = gameArea[j].longitude;

    const intersect =
        ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    console.log('intersect', intersect);
    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}
const insideAreaName = computed(() => {
  return gameAreas.filter(gameArea => {
    return isPointInsidePolygon(playerLocation.value, gameArea.areaCornerCoordinates)
  }).map(gameArea => {
    return gameArea.areaName
  }).join(', ')
})
const isInsideArea = computed(() => {
  return insideAreaName.value || '-'
})

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition( position => {
      playerLocation.value.latitude = position.coords.latitude
      playerLocation.value.longitude = position.coords.longitude
      playerLocation.value.accuracy = position.coords.accuracy
    }, function(error) {
      errorMessage.value = error.message
    }, geolocationOptions);
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
})
</script>
