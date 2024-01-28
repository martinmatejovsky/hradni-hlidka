<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <div v-if="!storedGeolocationWatcher">
    Zařízení nerozpoznává polohu.
  </div>
  <div v-else>
    <p>Lat, lon:</p>
    {{ currentPlayer?.location.latitude }} {{ currentPlayer?.location.longitude }}
    <br>
    Hrajete jako {{ currentPlayer?.name }}
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
    <p>Je uvnitř?</p>
    <p class="text-h3 mb-6 text-indigo-lighten-4">{{ nameOfIntersectedArea || '--'}}</p>

    <v-btn v-if="storedGameState === 'ready'" @click="startAttack" rounded="xs" class="mb-6">Zahájit útok</v-btn>
    <div v-else-if="storedGameState === 'lost'">
      <h3 class="text-h3 mb-6 text-red">Prohráli jste.</h3>
      <v-btn @click="restartAttack" rounded="xs" class="mb-6">Znovu na ně!</v-btn>
    </div>

    <h2>Postup útoku</h2>
    <p v-if="storedAreaAttackStat.length === 0">Žádná data o útoku.</p>
    <div v-else>
      <div v-for="attack in storedAreaAttackStat" :key="attack.areaName">
        <h3>{{ attack.areaName }}, strážce: {{ attack.guardians[0]?.name || '--' }} Útočníků: {{ attack.attackersAmount }}</h3>
        <v-progress-linear
            v-model="attack.threatLevel"
            bg-color="blue-lighten-5"
            :color="attack.conquered ? 'error' : 'amber-lighten-2'"
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
import {onMounted, onUnmounted, computed, watch} from 'vue';
import type {PlayerData, AreaAttackStat} from "~/types/CustomTypes";

// CONSTANTS
const testerPlayerName = 'TestBeolf';

// STATE INITIAL VALUES
const storedGamePolygon = useStoredGamePolygons();
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const storedAreaAttackStat = useStoredAreaAttackStat();
const storedGameState = useGameState();
const currentPlayer = useStoredCurrentPlayer();

// DATA
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(currentPlayer.value?.location));
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

// METHODS
const startAttack = () => {
  useRequestWakeLockScreen();
  storedGameState.value = 'running';
  useUpdateThreatLevels();
};
const restartAttack = () => {
  storedAreaAttackStat.value = useClearGameAreas();
  storedGameState.value = 'ready';
  updateAreasOfCurrentPlayer();
}
const updateAreasOfCurrentPlayer = ():void => {
  if (nameOfIntersectedArea.value.length > 0) {
    storedAreaAttackStat.value.forEach((area: AreaAttackStat) => {
      if (area.areaName === nameOfIntersectedArea.value) {
        area.guardians.push(currentPlayer.value);
      }
    })
  } else if (nameOfIntersectedArea.value === '') {
    storedAreaAttackStat.value.forEach((area: AreaAttackStat) => {
      const index = area.guardians.findIndex((guardian: PlayerData) => guardian.name === currentPlayer.value.name);
      area.guardians.splice(index, 1);
    })
  }
}

// WATCHERS
watch(nameOfIntersectedArea, (): void => {
  updateAreasOfCurrentPlayer()
});

// LIFECYCLE HOOKS
onMounted(() => {
  currentPlayer.value.name = testerPlayerName;
  useInitializePlayerGeolocationWatcher();
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
  useReleaseWakeLockScreen();
});
</script>