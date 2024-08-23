<script setup lang="ts">
import {STORE_GAME_INSTANCE, STORE_CURRENT_PLAYER, STORE_APPLICATION_ERROR, STORE_GAME_SETTINGS} from "~/constants";
import type {GameInstance, PlayerData, Settings} from "~/types/CustomTypes";
import {computed, watch} from "vue";
import {useState} from "nuxt/app";
import {useGetterCurrentPlayerIsLeader, useGetterGameState} from "~/composables/getters";
import {useStoredGameInstance, useStoredGameSettings} from "~/composables/states";
import {useReleaseWakeLockScreen, useRequestWakeLockScreen} from "~/composables/useWakeLockScreen";
import type {Socket} from "socket.io-client";
import Map from "~/components/Map.vue";
import {useFilterInvadersAssembled, useFilterInvadersOnLadder} from "~/composables/useUtilsFilterZone";
import {useIntersectedAreaKey} from "~/composables/useIntersectedAreaKey";

// DATA
const runtimeConfig = useRuntimeConfig()
const intervalRunAttack = ref<NodeJS.Timeout | null>(null);
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const currentGame = useState<GameInstance>(STORE_GAME_INSTANCE)
const gameState = useGetterGameState;
const getterBattleZones = useGetterBattleZones;
const currentPlayerIsLeader = useGetterCurrentPlayerIsLeader
const dataLoading = ref<boolean>(false);
const applicationError = useState(STORE_APPLICATION_ERROR)
let socket: Socket;

// COMPUTED
const connectedPlayers = computed((): PlayerData[] => {
  return [...currentGame.value?.players];
});

// METHODS
const getBack = (): void => {
  navigateTo('/');
}
const startAttack = async (): Promise<void> => {
  await useRequestWakeLockScreen();

  // TODO: send to server that game has started. After response start also the game on client side,
  // like for example with intervalRunAttack.value = useRunAttack();

  await $fetch(`${runtimeConfig.public.serverUrl}/api/game/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameId: currentGame.value.id
    })
  }).catch((error) => {
    applicationError.value = 'Nepodařilo se zahájit útok.<br />' + error
  });
};
const geolocationWarning = computed(() => {
  if (!currentPlayer?.value.location) {
    return 'Pozice hráče není k dispozici';
  } else if (!useGetterBattleZones.value) {
    return 'Herní zóna není k dispozici';
  } else {
    return '';
  }
})
const keyOfIntersectedArea = computed((): string => {
  if (currentPlayer?.value.location && useGetterBattleZones.value) {
    return useIntersectedAreaKey(currentPlayer.value.location);
  } else {
    return '';
  }
})
const currentPlayerMark = ((player: PlayerData) => {
  return currentPlayer.value?.key === player.key ? '(Já)' : '';
})

// WATCHERS
watch(keyOfIntersectedArea, (): void => {
  if (getterBattleZones && currentPlayer.value.key) {
    currentPlayer.value.insideZone = keyOfIntersectedArea.value;
    socket.emit('playerRelocatedToZone', {gameId: currentGame.value.id, player: currentPlayer.value})
  }
});
watch(gameState, (newValue): void => {
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

  try {
    const [gameResponse, settingsResponse] = await Promise.all([
      $fetch(`${runtimeConfig.public.serverUrl}/api/game`, {
        method: 'GET',
      }),
      $fetch(`${runtimeConfig.public.serverUrl}/api/game/settings`, {
        method: 'GET',
      })
    ]);

    useStoredGameInstance(gameResponse as GameInstance);
    useStoredGameSettings(settingsResponse as Settings);
    socket = useSocket(currentGame.value.id);

    if (intervalRunAttack.value !== null) {
      clearInterval(intervalRunAttack.value);
    }
  } catch (error) {
    applicationError.value = 'Nepodařilo se načíst bitvu s tímto ID.<br />' + error
  } finally {dataLoading.value = false}

  currentPlayer.value.insideZone = keyOfIntersectedArea.value; // manually setting zone where player is when opening the game lobby
  await useReleaseWakeLockScreen();
})

onBeforeUnmount(async () => {
  currentPlayer.value.insideZone = '';
  // await to prevent closing socket connection before 'leaveGame' is for sure sent. Or else it sometimes disconnects before custom event 'leaveGame'
  await new Promise<void>((resolve) => {
    socket.emit('leaveGame', { gameId: currentGame.value.id, player: currentPlayer.value }, () => {
      resolve();
    });
  });
  socket.disconnect();
  currentPlayer.value.name = '';
  currentPlayer.value.key = '';
  clearNuxtState(STORE_GAME_INSTANCE);
})
</script>

<template>
  <h1 class="mb-4">Bitva</h1>

  <v-alert v-if="geolocationWarning" type="warning" class="mb-4" dismissible>{{geolocationWarning}}</v-alert>

  <template v-if="!applicationError">
    <p>Místo: {{ currentGame?.gameLocation?.locationName }}</p>
    <p>V zóně: {{ currentPlayer.insideZone || '--'}}</p>

    <div v-if="dataLoading">
      <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
      načítám data...
    </div>

    <!-- REGISTER PLAYER -->
    <div v-else-if="!currentPlayer?.key">
      <FormRegisterPlayer :socket="socket" />
    </div>

    <template v-else>
      <!-- READY? -->
      <div v-if="gameState === 'ready'">
        <h2>Ke hře připraveni:</h2>
        <p v-if="connectedPlayers.length === 0">Nikdo se zatím nepřipojil.</p>
        <ul v-else>
          <li v-for="player in connectedPlayers" :key="player.key" class="text-green">{{ player.name }} {{ currentPlayerMark(player) }}</li>
        </ul>
        <v-btn v-if="currentPlayerIsLeader" @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>
        <p v-else>Útok může zahájit první hráč seznamu.</p>
      </div>

      <!-- RUNNING -->
      <div v-else-if="gameState === 'running'">
        <p v-if="!getterBattleZones">Žádná data o útoku.</p>

        <div v-else>
          <div v-for="{ key, zoneName, guardians, invaders } in getterBattleZones" :key="key" class="mb-3">
            <h4 class="text-amber">{{ zoneName }}</h4>
            <p>strážce:
              <template v-if="!guardians.length">--</template>
              <template v-else>
                <span v-for="guardian in guardians" :key="guardian.name"  class="text-green mr-2">{{ guardian.name || '--' }}</span>
              </template>
            </p>
            <p>Shromáždění útočníci:
              <v-icon v-for="invader in useFilterInvadersAssembled(invaders)" :key="invader.id" icon="mdi-sword"></v-icon>
            </p>
            <p>Na příčce žebřiku <v-icon icon="mdi-arrow-right-bold-outline"></v-icon>
              <span v-for="(invader) in useFilterInvadersOnLadder(invaders)" :key="invader.id">
                {{ invader.ladderStep}} ({{invader.health}} živ.),
              </span>
            </p>
          </div>
        </div>

        <Map :connectedPlayers="connectedPlayers"></Map>
      </div>

      <!-- LOST OR WON-->
      <div v-else-if="gameState === 'lost' || gameState === 'won'">
        <h4 class="text-h4 mb-4" :class="[gameState === 'won' ? 'text-green' : 'text-red']">
          {{ gameState === 'won' ? 'Vítězství' : 'Prohráli jste' }}
        </h4>
      </div>
    </template>

    <v-btn @click="getBack" size="small" rounded="xs" class="mt-3 mr-4 mb-3">Zpět</v-btn>
  </template>
</template>

<style scoped>
.hh-icon-loading {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform:rotate(0deg); }
  100% { transform:rotate(360deg); }
}
</style>
