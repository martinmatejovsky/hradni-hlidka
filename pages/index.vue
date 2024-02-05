<template>
  <div v-if="!storedGeolocationWatcher">
    Zařízení nerozpoznává polohu.
  </div>
  <div v-else>
    <form-game-settings />

    <p>Hrajete jako {{ currentPlayer?.name }}</p>
    <p>Souřadnice: {{ currentPlayer?.location.latitude }} {{ currentPlayer?.location.longitude }}</p>
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
  </div>
</template>

<script setup lang="ts">
// IMPORTS
import {onMounted, onUnmounted, computed} from 'vue';

// STATE INITIAL VALUES
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const currentPlayer = useStoredCurrentPlayer();

// DATA
const playerAccuracy = computed(() => Math.round(currentPlayer.value?.location.accuracy || 0));
const accuracyClass = computed(() => {
  if (playerAccuracy.value < 7) {
    return 'text-green';
  } else if (playerAccuracy.value < 25) {
    return 'text-yellow';
  } else {
    return 'text-red';
  }
});

// LIFECYCLE HOOKS
onMounted(() => {
  useInitializePlayerGeolocationWatcher();
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
});
</script>