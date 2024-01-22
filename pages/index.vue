<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p v-if="geolocationErrorMessage" class="text-red">{{ geolocationErrorMessage }}</p>
  <p>Lat, lon:</p>
  <p>
    {{ playerLocation?.latitude || 'zařízení nerozpoznává polohu' }} {{ playerLocation?.longitude }}</p>
  <p>Accuracy: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
  <p>Is inside?</p>
  <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>
</template>

<script setup lang="ts">
// IMPORT
import { onMounted, onUnmounted, computed} from 'vue'
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName'
import { usePlayerLocationAccuracy } from '~/composables/usePlayerLocationAccuracy'
import { requestWakeLockScreen, releaseWakeLockScreen} from '~/composables/useWakeLockScreen'
import {playerLocation, geolocationWatcher, geolocationErrorMessage, initializeGeolocationWatcher} from '~/composables/useGeolocationWatchPosition'

// DATA
const playerAccuracy = computed(() => usePlayerLocationAccuracy(playerLocation.value))
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
  initializeGeolocationWatcher()
  requestWakeLockScreen()
})

onUnmounted((): void => {
  if (geolocationWatcher) {
    navigator.geolocation.clearWatch(geolocationWatcher.value)
  }
  releaseWakeLockScreen()
})
</script>