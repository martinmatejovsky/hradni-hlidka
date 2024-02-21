<template>
<!--  TODO: put here a condition to check if player entering this page as in local Store currentPlayer filled and-->
<!--  if this object has a unique id from useSocket.io. If not, show him component FormGameSettings.-->
  <h1 class="mb-4">Bitva</h1>
  <template v-if="!applicationError">
    <p>Místo: {{currentGameLocation?.gameLocation.locationName}}</p>

    <div v-if="dataLoading">
      <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
      načítám data...
    </div>

    <!-- REGISTER PLAYER -->
    <div v-else-if="!currentPlayer?.key">
      <FormRegisterPlayer :gameId="gameId" :socket="socket" />
    </div>

    <template v-else>
      <!-- READY? -->
      <div v-if="gameState === 'ready'">
        <h2>Ke hře připraveni:</h2>
        <p v-if="connectedPlayers.length === 0">Nikdo se zatím nepřipojil.</p>
        <ul v-else>
          <li v-for="player in connectedPlayers" :key="player.key" class="text-green">{{ player.name }}</li>
        </ul>
        <v-btn @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>
      </div>

      <!-- RUNNING -->
      <div v-else-if="gameState === 'running'">
        <p class="mb-4">Jsem uvnitř? <span class="text-h4 text-indigo-lighten-4">{{ nameOfIntersectedArea }}</span></p>
        <h3 class="mb-3">Postup útoku</h3>
        <p v-if="!getterBattleZones">Žádná data o útoku.</p>
        <div v-else>
          <div v-for="{ key, zoneName, guardians, assembledInvaders, assaultLadder } in getterBattleZones" :key="key" class="mb-3">
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

      <!-- LOST OR WON-->
      <div v-else-if="gameState === 'lost' || gameState === 'won'">
        <h4 class="text-h4 mb-4" :class="[gameState === 'won' ? 'text-green' : 'text-red']">
          {{ gameState === 'won' ? 'Vítězství' : 'Prohráli jste' }}
        </h4>
        <v-btn rounded="xs" class="mb-6">Znovu na ně!</v-btn>
      </div>
    </template>

    <v-btn @click="getBack" size="small" rounded="xs" class="mt-3 mr-4 mb-3">Zpět</v-btn>
  </template>
</template>

<script setup lang="ts">
import {STORE_GAME_INSTANCE, STORE_CURRENT_PLAYER} from "~/constants";
import type {BattleZone, GameInstance, PlayerData} from "~/types/CustomTypes";
import {computed, watch} from "vue";
import {useState} from "nuxt/app";
import * as CONST from "~/constants";

// DATA
const runtimeConfig = useRuntimeConfig()
const intervalRunAttack = ref<NodeJS.Timeout | null>(null);
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const currentGameLocation = useState<GameInstance>(CONST.STORE_GAME_INSTANCE)
const gameState = useGetterGameState;
const route = useRoute()
const gameId: string = route.params.gameId[0]
const dataLoading = ref<boolean>(false);
const applicationError = useState(CONST.STORE_APPLICATION_ERROR)
const socket = useSocket(gameId);
const getterBattleZones = useGetterBattleZones;

// COMPUTED
const connectedPlayers = computed((): PlayerData[] => {
  return [...useState<GameInstance>(STORE_GAME_INSTANCE).value?.players];
});

// METHODS
const getBack = (): void => {
  currentPlayer.value.name = '';
  currentPlayer.value.key = '';
  navigateTo('/');
}
const startAttack = (): void => {
  useRequestWakeLockScreen();
  // TODO: send to server that game has started. On response start the game also on client side
  // like for example with intervalRunAttack.value = useRunAttack();
};
const keyOfIntersectedArea = computed(() => useIntersectedAreaKey(currentPlayer.value?.location));
const nameOfIntersectedArea = computed(() => {
  if (keyOfIntersectedArea.value.length > 0) {
    return getterBattleZones.value.find((zone: BattleZone) => zone.key === keyOfIntersectedArea.value)?.zoneName;
  } else {
    return '--';
  }
});
const updateAreasOfCurrentPlayer = (): void => {
  if (keyOfIntersectedArea.value.length > 0) {
    getterBattleZones.value.forEach((zone: BattleZone) => {
      if (zone.key === keyOfIntersectedArea.value) {
        zone.guardians.push(currentPlayer.value);
      }
    })
  } else if (keyOfIntersectedArea.value === '') {
    getterBattleZones.value.forEach((area: BattleZone) => {
      const index = area.guardians.findIndex((guardian: PlayerData) => guardian.name === currentPlayer.value.name);
      area.guardians.splice(index, 1);
    })
  }
}

// WATCHERS
watch(keyOfIntersectedArea, (): void => {
  if (getterBattleZones) {
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
onMounted(async () => {
  dataLoading.value = true;
  applicationError.value = null;

  await $fetch(`${runtimeConfig.public.serverUrl}/api/game/${gameId}`)
      .then(response => {
        useStoredGameInstance(response as GameInstance);
      })
      .catch(error => {
        applicationError.value = 'Nepodařilo se načíst bitvu s tímto ID.<br />' + error
      })
      .finally(() => dataLoading.value = false);
  if (intervalRunAttack.value !== null) {
    clearInterval(intervalRunAttack.value);
  }
  await useReleaseWakeLockScreen();
})

onBeforeUnmount(() => {
  if (useSocketState.connected) {
    socket.emit('leaveGame', {gameId});
    socket.disconnect();
  }
})
</script>

<style scoped>
.hh-icon-loading {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform:rotate(0deg); }
  100% { transform:rotate(360deg); }
}
</style>