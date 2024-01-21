<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p>Lat, lon:</p>
  <p>
    {{ playerLocation?.latitude || 'zařízení nerozpoznává polohu' }} {{ playerLocation?.longitude }}</p>
  <p>Accuracy: {{ playerAccuracy }}</p>
  <p>Is inside?</p>
  <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import type { PlayerCoordinates } from '~/types/CustomTypes'
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName'
import { usePlayerLocationAccuracy } from '~/composables/usePlayerLocationAccuracy'

const errorMessage = ref(null as string | null)
const playerLocation = ref<PlayerCoordinates | null>(null)
const playerAccuracy = computed(() => usePlayerLocationAccuracy(playerLocation.value))
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
}
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(playerLocation.value))

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition( position => {
      playerLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }
    }, function(error) {
      errorMessage.value = error.message
    }, geolocationOptions);
  } else {
    console.error('Geolokace není podporována')
  }
})
</script>
