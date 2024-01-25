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
    <p class="text-h3 mb-6 text-indigo-lighten-4">{{ nameOfIntersectedArea }}</p>

    <v-btn v-if="storedGameState === 'ready'" @click="startAttack" rounded="xs" class="mb-6">Zahájit útok</v-btn>
    <div v-else-if="storedGameState === 'lost'">
      <h3 class="text-h3 mb-6 text-red">Prohráli jste.</h3>
      <v-btn @click="restartAttack" rounded="xs" class="mb-6">Znovu na ně!</v-btn>
    </div>

    <h2>Postup útoku</h2>
    <p v-if="storedAttackThreat.length === 0">Žádná data o útoku.</p>
    <div v-else>
      <div v-for="attack in storedAttackThreat" :key="attack.areaName">
        <h3>{{ attack.areaName }}</h3>
        <v-progress-linear
            v-model="attack.threatLevel"
            :color="attack.conquered ? 'error' : 'primary'"
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
// IMPORTS
import { onMounted, onUnmounted, computed } from 'vue';
import { gameAreas } from '~/data/gameAreas';
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName';
import { requestWakeLockScreen, releaseWakeLockScreen } from '~/composables/useWakeLockScreen';
import { useInitializePlayerGeolocationWatcher } from '~/composables/useInitializePlayerGeolocationWatcher';
import { useStoredPlayersLocation, useStoredGeolocationWatcher, useStoredAttackThreat, useGameState } from '~/composables/states'
import { useAttackersAmountCorrection } from '~/composables/useAttackersAmountCorrection';
import { updateThreatLevels } from "~/composables/updateThreatLevels";

// CONSTANTS
const testerPlayerName = 'TestBeolf';

// DATA
const storedPlayersLocation = useStoredPlayersLocation();
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const storedAttackThreat = useStoredAttackThreat();
const storedGameState = useGameState();
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

// METHODS
const startAttack = () => {
  storedGameState.value = 'running';
  updateThreatLevels();
};
const restartAttack = () => {}

// LIFECYCLE HOOKS
onMounted(() => {
  requestWakeLockScreen();
  useInitializePlayerGeolocationWatcher(testerPlayerName);
  // fill mock data of attackers
  for (let i = 0; i < gameAreas.length; i++) {
    useAttackersAmountCorrection(gameAreas[i].areaName, i + 2);
  }
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
  releaseWakeLockScreen();
});
</script>