<template>
  <div v-if="!storedGeolocationWatcher">
    Zařízení nerozpoznává polohu.
  </div>
  <div v-else>
    <p>Hrajete jako {{ currentPlayer?.name }}</p>
    <p>Souřadnice: {{ currentPlayer?.location.latitude }} {{ currentPlayer?.location.longitude }}</p>
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
    <p class="mb-4">Jsem uvnitř? <span class="text-h4 text-indigo-lighten-4">{{ nameOfIntersectedArea || '--'}}</span></p>

    <v-divider class="mb-4"></v-divider>

    <v-btn v-if="storedGameState === 'ready'" @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>
    <div v-else-if="storedGameState === 'lost'">
      <h4 class="text-h4 mb-4 text-red">Prohráli jste.</h4>
      <v-btn @click="restartAttack" rounded="xs" class="mb-6">Znovu na ně!</v-btn>
    </div>

    <div v-else-if="storedGameState === 'running'">
      <h3 class="mb-3">Postup útoku</h3>
      <p v-if="storedAreaAttackStat.length === 0">Žádná data o útoku.</p>
      <div v-else>
        <div v-for="attackedArea in storedAreaAttackStat" class="mb-3" :key="attackedArea.areaName">
          <h4 class="text-amber">{{ attackedArea.areaName }}</h4>
          <p>strážce: {{ attackedArea.guardians[0]?.name || '--' }}</p>
          <p>Shromážděni: {{ attackedArea.assembledInvaders.length }}</p>
          <p>Žebřik: {{ attackedArea.assaultLadder }}</p>
          <v-progress-linear
              v-model="attackedArea.threatLevel"
              bg-color="lime-darken-4"
              :color="attackedArea.conquered ? 'error' : 'orange-darken-4'"
              height="25"
          >
            <template v-slot:default="{ value }">
              <strong>{{ Math.ceil(value) }} %</strong>
            </template>
          </v-progress-linear>
        </div>
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
  useRunAttack();
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