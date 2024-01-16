<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p>Lat: {{ playerLocation.latitude }}</p>
  <p>Lon: {{ playerLocation.longitude }}</p>
  <p>Accur: {{ playerLocation.accuracy }}</p>
  <p>Is inside? {{ isInsideGameArea }}</p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Coordinates } from '~/types/CustomTypes'

const errorMessage = ref(null as string | null)
const playerLocation = ref({
  latitude: undefined,
  longitude: undefined,
  accuracy: undefined,
} as Coordinates)

const isInsideGameArea = ref(false)

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
}

const gameArea = ref ([
  {latitude: 50.1918117, longitude: 12.7414242},
  {latitude: 50.1904517, longitude: 12.7405606},
  {latitude: 50.1904036, longitude: 12.7443800},
  {latitude: 50.1917397, longitude: 12.7443103},
] as Coordinates[])

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

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition( position => {
      playerLocation.value.latitude = position.coords.latitude
      playerLocation.value.longitude = position.coords.longitude
      playerLocation.value.accuracy = position.coords.accuracy

      isInsideGameArea.value = isPointInsidePolygon(playerLocation.value, gameArea.value);
    }, function(error) {
      errorMessage.value = error.message
    }, geolocationOptions);
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
})
</script>
