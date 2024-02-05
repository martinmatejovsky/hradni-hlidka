<template>
  <div v-if="!storedGeolocationWatcher">
    Zařízení nerozpoznává polohu.
  </div>
  <div v-else>
    <form-game-settings v-if="storedGameState === 'setting'"/>
    <p>Hrajete jako {{ currentPlayer?.name }}</p>
    <p>Souřadnice: {{ currentPlayer?.location.latitude }} {{ currentPlayer?.location.longitude }}</p>
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>

    <v-btn v-if="storedGameState === 'ready'" @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>

    <div v-if="storedGameState === 'running'">
      <v-divider class="mb-4"></v-divider>

      <p class="mb-4">Jsem uvnitř? <span class="text-h4 text-indigo-lighten-4">{{ nameOfIntersectedArea }}</span></p>
      <h3 class="mb-3">Postup útoku</h3>
      <p v-if="!battleZones">Žádná data o útoku.</p>
      <div v-else>
        <div v-for="{ key, zoneName, guardians, assembledInvaders, assaultLadder } in battleZones" :key="key" class="mb-3">
        <h4 class="text-amber">{{ zoneName }}</h4>
          <p>strážce:
            <template v-if="!guardians.length">--</template>
            <template v-else>
              <span v-for="guardian in guardians" :key="guardian.name"  class="text-green">{{ guardian.name || '--' }}</span>
            </template>
          </p>
          <p>Shromáždění útočníci:
            <v-icon v-for="n in assembledInvaders" :key="n" icon="mdi-sword"></v-icon>
          </p>
          <p>Žebřik <v-icon icon="mdi-arrow-right-bold-outline"></v-icon></p>
          <ClimbingLadder :climbingInvaders="assaultLadder" />
        </div>
      </div>
    </div>

    <div v-else-if="storedGameState === 'lost' || storedGameState === 'won'">
      <h4 class="text-h4 mb-4" :class="[storedGameState === 'won' ? 'text-green' : 'text-red']">
        {{ storedGameState === 'won' ? 'Vítězství' : 'Prohráli jste' }}
      </h4>
      <v-btn @click="restartAttack" rounded="xs" class="mb-6">Znovu na ně!</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// IMPORTS
import {onMounted, onUnmounted, computed, watch} from 'vue';
import type {PlayerData, BattleZone} from "~/types/CustomTypes";
import * as CONST from "~/constants";
import {useState} from "nuxt/app";

// CONSTANTS
const testerPlayerName = '';
const intervalRunAttack = ref<NodeJS.Timeout | null>(null);

// STATE INITIAL VALUES
const storedGeolocationWatcher = useStoredGeolocationWatcher();
const battleZones: BattleZone[] = useState<BattleZone[]>(CONST.STORE_BATTLE_ZONES).value;
const storedGameState = useGameState();
const currentPlayer = useStoredCurrentPlayer();

// DATA
const keyOfIntersectedArea = computed(() => useIntersectedAreaKey(currentPlayer.value?.location));
const nameOfIntersectedArea = computed(() => {
  if (keyOfIntersectedArea.value.length > 0) {
    return battleZones.find((zone: BattleZone) => zone.key === keyOfIntersectedArea.value);
  } else {
    return '--';
  }
});
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
  intervalRunAttack.value = useRunAttack();
};
const restartAttack = (): void => {
  // TODO: send request to server to clear game stats, set game state to "setting" and allow connection for others, etc.
}
const updateAreasOfCurrentPlayer = ():void => {
  if (keyOfIntersectedArea.value.length > 0) {
    battleZones.forEach((zone: BattleZone) => {
      if (zone.key === keyOfIntersectedArea.value) {
        zone.guardians.push(currentPlayer.value);
      }
    })
  } else if (keyOfIntersectedArea.value === '') {
    battleZones.forEach((area: BattleZone) => {
      const index = area.guardians.findIndex((guardian: PlayerData) => guardian.name === currentPlayer.value.name);
      area.guardians.splice(index, 1);
    })
  }
}

// WATCHERS
watch(keyOfIntersectedArea, (): void => {
  if (battleZones) {
    updateAreasOfCurrentPlayer()
  }
});
watch(useState(CONST.STORE_GAME_STATE), (newValue): void => {
  if (newValue === 'lost' || newValue === 'won') {
    if (intervalRunAttack.value !== null) {
      clearInterval(intervalRunAttack.value);
      intervalRunAttack.value = null;
    }
    setTimeout(useReleaseWakeLockScreen, 5000);
  }
})

// LIFECYCLE HOOKS
onMounted(() => {
  currentPlayer.value.name = testerPlayerName;
  useInitializePlayerGeolocationWatcher();
});

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
  if (intervalRunAttack.value !== null) {
    clearInterval(intervalRunAttack.value);
  }
  useReleaseWakeLockScreen();
});
</script>