<script setup lang="ts">
import {STORE_APPLICATION_ERROR} from "~/constants";
import type {BattleZone, LastWaveNotice, PlayerData, UtilityZone} from "~/types/CustomTypes";
import {computed, watch} from "vue";
import {useState} from "nuxt/app";
import {useReleaseWakeLockScreen, useRequestWakeLockScreen} from "~/composables/useWakeLockScreen";
import type {Socket} from "socket.io-client";
import Map from "~/components/Map.vue";
import {useIntersectedAreaKey} from "~/composables/useIntersectedAreaKey";
import {useListenBus} from "~/composables/useEventBus";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";

// Pinia store
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();

// DATA
const runtimeConfig = useRuntimeConfig()
const intervalRunAttack = ref<NodeJS.Timeout | null>(null);
const dataLoading = ref<boolean>(false);
const applicationError = useState(STORE_APPLICATION_ERROR);
let socket: Socket;
const lastWaveIncomingWarning = ref<LastWaveNotice>('none');
const leafletIsFullscreen = ref<boolean>(false);
const smithyOfferOpened = ref<boolean>(false);

const zoneTimer = ref<NodeJS.Timeout | null>(null);

// COMPUTED
const currentPlayerIsLeader = computed(() => {
  return storeGameInstance.gameInstance?.players[0]?.key === storeCurrentPlayer.currentPlayer.key;
});
const gameSettings = computed(() => storeGameInstance.gameSettings);
const gameState = computed((): string => storeGameInstance.gameInstance.gameState);
const currentPlayer = computed((): PlayerData => storeCurrentPlayer.currentPlayer);
const connectedPlayers = computed((): PlayerData[] => storeGameInstance.gameInstance.players);
const battleZones = computed((): BattleZone[] => storeGameInstance.gameInstance.battleZones);
const utilityZones = computed((): UtilityZone[] => storeGameInstance.gameInstance.utilityZones);

// METHODS
const getBack = (): void => {
  navigateTo('/');
}

const useEnsureSocketDisconnect = async () => {
  if (socket.connected) {
    // await to prevent closing socket connection before 'leaveGame' is for sure sent. Or else it sometimes disconnects before custom event 'leaveGame'
    await new Promise<void>((resolve) => {
      socket.emit('leaveGame', {gameId: storeGameInstance.gameInstance.id, player: currentPlayer.value}, () => {
        resolve();
      });
    });
  }
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
      gameId: storeGameInstance.gameInstance.id
    })
  }).catch((error) => {
    applicationError.value = 'Nepodařilo se zahájit útok.<br />' + error
  });
};

const geolocationWarning = computed(() => {
  if (!currentPlayer?.value.location.lat) {
    return 'Pozice hráče není k dispozici. Máte zapnutou geolokaci ve vašem zařízení?';
  } else if (!battleZones) {
    return 'Herní zóna není k dispozici';
  } else {
    return '';
  }
})

const keyOfIntersectedArea = computed((): string => {
  if (currentPlayer?.value.location && battleZones) {
    return useIntersectedAreaKey(currentPlayer.value.location);
  } else {
    return '';
  }
})
const nameOfIntersectedArea = computed((): string => {
  if (battleZones) {
    const allAreas = [...battleZones.value, ...utilityZones.value];
    const area = allAreas.find(zone => zone.key === keyOfIntersectedArea.value);
    return area?.zoneName || '';
  } else {
    return '';
  }
})

const currentPlayerMark = ((player: PlayerData) => {
  return currentPlayer.value?.key === player.key ? '(Já)' : '';
})

const gameStateReady = computed(() => gameState.value === 'ready')
const gameStateRunning = computed(() => gameState.value === 'running')
const gameStateLost = computed(() => gameState.value === 'lost')
const gameStateWon = computed(() => gameState.value === 'won')

const isSmithyArea = (key: string): boolean => {
  const area = utilityZones.value.find(zone => zone.key === key);
  return area?.polygonType === 'smithy';
}

const startZoneTimer = () => {
  if (zoneTimer.value !== null) {
    clearTimeout(zoneTimer.value);
  }

  zoneTimer.value = setTimeout(() => {
    smithyOfferOpened.value = true;
  }, gameSettings.value.smithyUpgradeWaiting);
}

// Function to stop the timer
const clearZoneTimer = () => {
  if (zoneTimer.value !== null) {
    clearTimeout(zoneTimer.value);
    zoneTimer.value = null;
  }
}

// WATCHERS
watch(keyOfIntersectedArea, (newKey): void => {
  if (battleZones && currentPlayer.value.key) {
    currentPlayer.value.insideZone = keyOfIntersectedArea.value;
    socket.emit('playerRelocatedToZone', {gameId: storeGameInstance.gameInstance.id, player: currentPlayer.value})
  }

  if (isSmithyArea(newKey)) {
    startZoneTimer();
  } else {
    clearZoneTimer();
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
onBeforeMount(async () => {
  dataLoading.value = true;
  applicationError.value = null;

  useListenBus('lastWaveNotice', (value: LastWaveNotice): void => {
    lastWaveIncomingWarning.value = value;
  });

  useListenBus('leafletFullscreen', (value: boolean): void => {
    leafletIsFullscreen.value = value;
  });

  try {
    await Promise.all([
      storeGameInstance.getGameInstance(),
      storeGameInstance.getGameSettings()
    ])
    .then(() => {
      socket = useSocket(storeGameInstance.gameInstance.id);
    });

    if (intervalRunAttack.value !== null) {
      clearInterval(intervalRunAttack.value);
    }
  } catch (error) {
    applicationError.value = 'Nepodařilo se načíst bitvu s tímto ID.<br />' + error
  } finally {dataLoading.value = false}

  // disconnection handled on Window object, but alo in onBeforeUnmount hook, to be sure
  window.addEventListener('beforeunload', () => {
    useEnsureSocketDisconnect();
  });

  currentPlayer.value.insideZone = keyOfIntersectedArea.value; // manually setting zone where player is when opening the game lobby
  await useReleaseWakeLockScreen();
})

onBeforeUnmount(() => {
  // disconnection handled on onBeforeUnmount hook, but also in Window object, to be sure
  useEnsureSocketDisconnect();
  socket.disconnect();
  currentPlayer.value.insideZone = '';
  currentPlayer.value.name = '';
  currentPlayer.value.key = '';
  currentPlayer.value.perks = {
    sharpSword: 0,
  };
})
</script>

<template>
  <h1>Bitva</h1>

  <v-alert v-if="geolocationWarning" type="warning" class="mb-4" dismissible>{{geolocationWarning}}</v-alert>

  <template v-if="!applicationError">
    <div v-if="dataLoading">
      <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
      načítám data...
    </div>

    <!-- REGISTER PLAYER -->
    <FormRegisterPlayer v-else-if="!currentPlayer?.key" :socket="socket" />

    <section v-else>
      <!-- READY? -->
      <template v-if="gameStateReady">
        <h2>Ke hře připraveni:</h2>
        <p v-if="connectedPlayers.length === 0">Nikdo se zatím nepřipojil.</p>
        <ul v-else>
          <li v-for="player in connectedPlayers" :key="player.key" class="text-green">{{ player.name }} {{ currentPlayerMark(player) }}</li>
        </ul>
        <v-btn v-if="currentPlayerIsLeader" @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>
        <p v-else>Útok může zahájit první hráč seznamu.</p>
      </template>

      <!-- RUNNING -->
      <template v-else-if="gameStateRunning">
        <p v-if="!battleZones">Žádná data o útoku.</p>

        <div v-else class="hh-leaflet-container position-relative" :class="leafletIsFullscreen ? 'is-full-screen' : 'is-minimized'">
          <div class="hh-alert-wave-container">
            <v-alert v-if="lastWaveIncomingWarning === 'incoming'" density="compact" variant="tonal" type="warning" title="Blíží se poslední vlna"></v-alert>
            <v-alert v-if="lastWaveIncomingWarning === 'running'" density="compact" variant="tonal" type="info" title="Poslední vlna"></v-alert>
          </div>

          <Map
            :connectedPlayers="connectedPlayers"
            :mapCenter="storeGameInstance.gameInstance.gameLocation.mapCenter"
            :nameOfIntersectedArea="nameOfIntersectedArea"></Map>

          <VFadeTransition>
            <smithy-shop-offer
              :socket="socket"
              v-if="smithyOfferOpened"
              @perkChosen="smithyOfferOpened = false"
            />
          </VFadeTransition>
        </div>
      </template>

      <!-- LOST OR WON-->
      <div v-else-if="gameStateLost || gameStateWon">
        <h4 class="text-h4 mb-4" :class="[gameStateWon ? 'text-green' : 'text-red']">
          {{ gameStateWon ? 'Vítězství' : 'Prohráli jste' }}
        </h4>
      </div>
    </section>

    <v-btn @click="getBack" size="small" rounded="xs" class="mt-3 mr-4 mb-3">
      {{ gameStateRunning ? 'Opustit bitvu' : 'Zpět' }}
    </v-btn>
  </template>
</template>
