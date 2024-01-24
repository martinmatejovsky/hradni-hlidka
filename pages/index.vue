<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <div v-if="storedGeolocationWatcher">
    <p>Lat, lon:</p>
    {{ currentPlayerData?.location.latitude }} {{ currentPlayerData?.location.longitude }}
    <br>
    Hrajete jako {{ currentPlayerData?.name }}
    <p>Accuracy: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
    <p>Is inside?</p>
    <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>
  </div>
  <p v-else>Zařízení nerozpoznává polohu.</p>
</template>

<script setup lang="ts">
// CONSTANTS
const testerPlayerName = 'TestMartin';

// IMPORTS
import { onMounted, onUnmounted, computed } from 'vue';
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName';
import { requestWakeLockScreen, releaseWakeLockScreen } from '~/composables/useWakeLockScreen';
import { useInitializePlayerGeolocationWatcher } from '~/composables/useInitializePlayerGeolocationWatcher';
import { useStoredPlayersLocation, useStoredGeolocationWatcher } from '~/composables/states'

// DATA
const storedPlayersLocation = useStoredPlayersLocation();
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const currentPlayerData = computed(() => storedPlayersLocation.value.find((player) => player.name === testerPlayerName));
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(currentPlayerData.value?.location));
const playerAccuracy = computed(() => currentPlayerData.value?.location.accuracy);
const accuracyClass = computed(() => {
  if (playerAccuracy.value < 7) {
    return 'text-green';
  } else if (playerAccuracy.value < 25) {
    return 'text-yellow';
  } else {
    return 'text-red';
  }
});

onMounted(() => {
  requestWakeLockScreen();
  useInitializePlayerGeolocationWatcher(testerPlayerName);
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
  releaseWakeLockScreen();
});
</script>