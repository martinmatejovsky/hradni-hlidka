<script setup lang="ts">
import {STORE_APPLICATION_ERROR} from "~/constants";
import type {BattleZone, LastWaveNotice, PlayerData, UtilityZone} from "~/types/CustomTypes";
import {computed, watch} from "vue";
import {useState} from "nuxt/app";
import {useReleaseWakeLockScreen, useRequestWakeLockScreen} from "~/composables/useWakeLockScreen";
import type {Socket} from "socket.io-client";
import MapLeaflet from "~/components/MapLeaflet.vue";
import {useListenBus} from "~/composables/useEventBus";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
import {useZoneIntersectionStore} from "~/stores/zoneIntersectionStore";

// Pinia stores
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();
const storeZoneIntersection = useZoneIntersectionStore();

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

const keyOfIntersectedArea = computed((): string => storeZoneIntersection.keyOfIntersectedArea);
const nameOfIntersectedArea = computed((): string => storeZoneIntersection.nameOfIntersectedArea);

// METHODS
const onMapReady = () => {
  startCannonLoading();
}

const startCannonLoading = () => {
  console.log("__ Cannon loading...");
  if (cannonLoadingInterval) return;

  cannonLoadingInterval = setInterval(() => {
    if (cannonLoadingTime.value < storeGameInstance.gameSettings.canonLoadingTime) {
      cannonLoadingTime.value++;
      console.log("__ Cannon ++");
    } else {
      clearInterval(cannonLoadingInterval as NodeJS.Timeout);
      cannonLoadingInterval = null;
      console.log("__ Cannon is fully loaded!");
    }
  }, 1000);
};

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

const currentPlayerMark = ((player: PlayerData) => {
  return currentPlayer.value?.key === player.key ? '(Já)' : '';
})

const gameStateReady = computed(() => gameState.value === 'ready')
const gameStateRunning = computed(() => gameState.value === 'running')
const gameStateLost = computed(() => gameState.value === 'lost')
const gameStateWon = computed(() => gameState.value === 'won')

const isSmithyArea = computed(() => storeZoneIntersection.isInSmithyArea);

const enterZoneTimer = () => {
  if (zoneTimer.value !== null) {
    clearTimeout(zoneTimer.value);
  }
  zoneTimer.value = setTimeout(() => {
    smithyOfferOpened.value = true;
  }, gameSettings.value.smithyUpgradeWaiting);
}

const leaveZoneTimer = () => {
  if (zoneTimer.value !== null) {
    clearTimeout(zoneTimer.value);
  }
  zoneTimer.value = setTimeout(() => {
    smithyOfferOpened.value = false;
    dropUnsupportedOilPot();
  }, gameSettings.value.smithyUpgradeWaiting);
}

const dropUnsupportedOilPot = () => {
  if (!currentPlayer.value.perks.boilingOil) return;

  socket.emit('dropUnsupportedOilPot', {gameId: storeGameInstance.gameInstance.id, player: currentPlayer.value})
};

// WATCHERS
watch(keyOfIntersectedArea, (): void => {
  storeZoneIntersection.updatePlayerZone();

  if (battleZones && currentPlayer.value.key) {
    socket.emit('playerRelocatedToZone', {gameId: storeGameInstance.gameInstance.id, player: currentPlayer.value});
  }

  if (isSmithyArea.value) {
    enterZoneTimer();
  } else {
    leaveZoneTimer();
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

  // Set initial zone
  storeZoneIntersection.updatePlayerZone();
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
    boilingOil: false,
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

          <MapLeaflet
            :socket="socket"
            :connectedPlayers="connectedPlayers"
            :mapCenter="storeGameInstance.gameInstance.gameLocation.mapCenter"
            :nameOfIntersectedArea="nameOfIntersectedArea">
            @leafletMapLoaded="onMapReady()"
          </MapLeaflet>

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