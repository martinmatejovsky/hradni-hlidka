<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <div v-if="!storedGeolocationWatcher">
    Zařízení nerozpoznává polohu.
  </div>
  <div v-else>
    <p>Lat, lon:</p>
    {{ currentPlayerDataValue?.location.latitude }} {{ currentPlayerDataValue?.location.longitude }}
    <br>
    Hrajete jako {{ currentPlayerDataValue?.name }}
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
    <p>Je uvnitř?</p>
    <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>
    <h2>Postup útoku</h2>
    <p v-if="storedAttackThreat.length === 0">Žádná data o útoku.</p>
    <div v-else>
      <div v-for="attack in storedAttackThreat" :key="attack.areaName">
        <h3>{{ attack.areaName }}</h3>
        <v-progress-linear
            v-model="attack.threatLevel"
            color="blue-grey"
            height="25"
        >
          <template v-slot:default="{ value }">
            <strong>{{ Math.ceil(value) }} %</strong>
          </template>
        </v-progress-linear>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// CONSTANTS
const testerPlayerName = 'TestBeolf';

// IMPORTS
import { onMounted, onUnmounted, computed } from 'vue';
import { gameAreas } from '~/data/gameAreas';
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName';
import { requestWakeLockScreen, releaseWakeLockScreen } from '~/composables/useWakeLockScreen';
import { useInitializePlayerGeolocationWatcher } from '~/composables/useInitializePlayerGeolocationWatcher';
import { useStoredPlayersLocation, useStoredGeolocationWatcher, useStoredAttackThreat } from '~/composables/states'
import { useAttackersAmountCorrection } from '~/composables/useAttackersAmountCorrection';

// DATA
const storedPlayersLocation = useStoredPlayersLocation();
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const storedAttackThreat = useStoredAttackThreat();
const currentPlayerDataValue = computed(() => storedPlayersLocation.value.find((player) => player.name === testerPlayerName));
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(currentPlayerDataValue.value?.location));
const playerAccuracy = computed(() => Math.round(currentPlayerDataValue.value?.location.accuracy || 0));
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
  requestWakeLockScreen();
  useInitializePlayerGeolocationWatcher(testerPlayerName);
  // fill mock data of attackers
  for (let i = 0; i < gameAreas.length; i++) {
    useAttackersAmountCorrection(gameAreas[i].areaName, i + 1);
  }
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
  releaseWakeLockScreen();
});
</script>