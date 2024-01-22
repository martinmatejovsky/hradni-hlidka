<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p v-if="errorMessage" class="text-red">{{ errorMessage }}</p>
  <p>Lat, lon:</p>
  <p>
    {{ playerLocation?.latitude || 'zařízení nerozpoznává polohu' }} {{ playerLocation?.longitude }}</p>
  <p>Accuracy: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
  <p>Is inside?</p>
  <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed} from 'vue'
import type { PlayerCoordinates } from '~/types/CustomTypes'
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName'
import { usePlayerLocationAccuracy } from '~/composables/usePlayerLocationAccuracy'
import { requestWakeLockScreen, releaseWakeLockScreen} from '~/composables/useWakeLockScreen'

const errorMessage = ref(null as string | null)
const playerLocation = ref<PlayerCoordinates | null>(null)
const playerAccuracy = computed(() => usePlayerLocationAccuracy(playerLocation.value))
const geolocationWatcher = ref(0)
const geolocationOptions = {
  enableHighAccuracy: true,
}
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(playerLocation.value))
const accuracyClass = computed(() => {
  if (playerAccuracy.value < 7) {
    return 'text-green'
  } else if (playerAccuracy.value < 25) {
    return 'text-yellow'
  } else {
    return 'text-red'
  }
})

onMounted((): void => {
  if ('geolocation' in navigator) {
    geolocationWatcher.value = navigator.geolocation.watchPosition( position => {
      playerLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
    }, function(error) {
      errorMessage.value = error.message
    }, geolocationOptions);
  } else {
    errorMessage.value = 'Geolokace není podporována.'
  }

  requestWakeLockScreen()
})

onUnmounted((): void => {
  if (geolocationWatcher) {
    navigator.geolocation.clearWatch(geolocationWatcher.value)
  }
  releaseWakeLockScreen()
})
</script>