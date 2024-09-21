<script setup lang="ts">
// IMPORTS
import {computed, type ComputedRef} from 'vue';
import type {GameLocation, PlayerData, GameState, Settings} from "~/types/CustomTypes";
import {STORE_APPLICATION_ERROR, STORE_CURRENT_PLAYER} from "~/constants";
import {useState} from "nuxt/app";

// DATA
const tab = ref<string>('join');
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const runtimeConfig = useRuntimeConfig()
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
const selectedLocationKey = ref<string | null>('Loket Sportovní')
const selectedGameTempo = ref<number | null>(5000)
const selectedLadderLength = ref<number | null>(20)
const selectedGameLength = ref<number | null>(10)
const selectWaveVolume = ref<number | null>(4)
const selectAssemblyCountdown = ref<number | null>(1)
const selectWavesDelay = ref<number | null>(5)
const selectDefendersHitStrength = ref<number | null>(1)
const selectSmithyUpgradeWaiting = ref<number>(5000)
const selectSmithyUpgradeDuration = ref<number>(2)
const dataLoading = ref<boolean>(false);
const pageError = useState(STORE_APPLICATION_ERROR);
let gameLocations: GameLocation[]
const gameAlreadyCreated = ref(false)
const gameNotYetCreated = ref(false)

// COMPUTED
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null && selectedGameTempo.value !== null && selectedLadderLength.value !== null;
})
const locationOptions: ComputedRef<string[]> = computed(() => {
  if (gameLocations) {
    return gameLocations.map(location => location.locationName);
  } else {
    return [];
  }
});
const selectedGameLocation = computed(() => {
  return gameLocations?.find(location => location.locationName === selectedLocationKey.value) ?? null;
});
const gameTemposOptions: ComputedRef<number[]> = computed(() => {
  return selectedGameLocation.value?.speedChoices ?? [];
});
const ladderLengthOptions: ComputedRef<number[]> = computed(() => {
  return selectedGameLocation.value?.ladderLengthChoices ?? [];
});
// TODO: should be defined on server, but after testing. Testing will show if it should be configurable at all.
const waveVolumeOptions: ComputedRef<number[]> = computed(() => {
  return [4, 8, 12];
});
const gameLengthOptions: ComputedRef<number[]> = computed(() => {
  return [10, 20, 30];
});
const assemblyCountdown: ComputedRef<number[]> = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
});
const wavesDelay: ComputedRef<number[]> = computed(() => {
  return [5, 10, 15, 20, 25, 30];
});
const defendersStrength: ComputedRef<number[]> = computed(() => {
  return [1, 2, 3, 4];
});
const smithyUpgradeStrength: ComputedRef<number[]> = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7];
});

// METHODS
const checkGameCreated = async (): Promise<boolean> => {
  try {
    const response = await $fetch(`${runtimeConfig.public.serverUrl}/api/game/checkGameStatus`, {
      method: 'GET',
    });

    const gameStatusResponse = response as { gameStatus: GameState };

    if (gameStatusResponse.gameStatus !== "ready") {
      gameNotYetCreated.value = true;
      return false;
    } else {
      gameNotYetCreated.value = false;
      return true;
    }
  } catch (error) {
    pageError.value = 'Nepodařilo se spojit se serverem <br />' + error;
    return false;
  }
}

const joinGame = async () => {
  const alreadyCreated = await checkGameCreated();

  if (alreadyCreated) {
    navigateTo('/game');
  }
}

const createNewBattle = async () => {
  dataLoading.value = true;
  const alreadyCreated = await checkGameCreated();

  try {
    if (alreadyCreated) {
      gameAlreadyCreated.value = true
      dataLoading.value = false;
      return
    }

    const data: Settings = {
      gameTempo: selectedGameTempo.value,
      gameLength: selectedGameLength.value,
      ladderLength: selectedLadderLength.value,
      assaultWaveVolume: selectWaveVolume.value,
      assemblyCountdown: selectAssemblyCountdown.value,
      wavesMinDelay: selectWavesDelay.value,
      defendersHitStrength: selectDefendersHitStrength.value,
      smithyUpgradeWaiting: selectSmithyUpgradeWaiting.value,
      smithyUpgradeStrength: selectSmithyUpgradeDuration.value
    }

    const response = await $fetch( `${runtimeConfig.public.serverUrl}/api/game/createGame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameLocation: gameLocations.find(location => location.locationName === selectedLocationKey.value),
        settings: data
      })
    })

    if (response.statusCode === 200) {
      gameAlreadyCreated.value = true
    } else if (response.statusCode === 201) {
      await navigateTo('/game')
    }
  }

  catch(error) {
    pageError.value = 'Nepodařilo se spojit se serverem <br />' + error
  }

  finally{ dataLoading.value = false }
}

const fetchGameLocations = async () => {
  dataLoading.value = true;
  pageError.value = null;
  await $fetch(`${runtimeConfig.public.serverUrl}/api/game-locations`)
    .then(response => {
      gameLocations = response as GameLocation[];
    })
    .catch((error) => {
      pageError.value = 'Nepodařilo se načíst seznam bitevních míst <br>' + error
    })
    .finally(() => dataLoading.value = false);
}

// LIFECYCLE HOOKS
onBeforeMount(() => {
  fetchGameLocations();
});
</script>

<template>
  <v-card class="my-4">
    <v-tabs
        v-model="tab"
    >
      <v-tab value="join">Přidat se</v-tab>
      <v-tab value="create">Založit novou</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="join">
          <v-alert v-if="gameNotYetCreated"
              class="mb-4"
              text="Hra ještě není založena"
              type="info"
          ></v-alert>
          <v-btn @click="joinGame" type="button" rounded="xs">Přidat se do bitvy</v-btn>
        </v-window-item>

        <v-window-item value="create">
          <div v-if="dataLoading">
            <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
            načítám data...
          </div>
          <v-row v-else-if="gameAlreadyCreated">
            <v-col cols="12" sm="6" md="4">
              <v-alert
                  class="mb-4"
                  text="Hra je již založena"
                  type="info"
              ></v-alert>
              <v-btn @click="joinGame" type="button" rounded="xs">Přidat se do bitvy</v-btn>
            </v-col>
          </v-row>
          <v-form v-else :fast-fail="true" @submit.prevent="createNewBattle">
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-select
                    v-model="selectedLocationKey"
                    :items="locationOptions"
                    class="mb-2"
                    label="Vyberte bitevní pole"
                    value="loketSportovni"
                    required
                ></v-select>
                <v-select
                    v-model="selectedGameTempo"
                    :items="gameTemposOptions"
                    class="mb-2"
                    label="Tempo hry"
                    value="5000"
                    required
                ></v-select>
                <v-select
                    v-model="selectedLadderLength"
                    :items="ladderLengthOptions"
                    class="mb-2"
                    label="Výška hradeb"
                    required
                ></v-select>
                <v-btn type="submit" :disabled="!isFormValid" :block="true" rounded="xs" class="mb-2">Založit novou bitvu</v-btn>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                Herní konstanty:
                <v-select
                    v-model="selectWaveVolume"
                    :items="waveVolumeOptions"
                    class="mb-2"
                    label="Početnost ve vlně"
                    required
                ></v-select>
                <v-select
                    v-model="selectedGameLength"
                    :items="gameLengthOptions"
                    class="mb-2"
                    label="Délka hry"
                    required
                ></v-select>
                <v-select
                    v-model="selectAssemblyCountdown"
                    :items="assemblyCountdown"
                    class="mb-2"
                    label="Čekání před žebříkem"
                    required
                ></v-select>
                <v-select
                    v-model="selectWavesDelay"
                    :items="wavesDelay"
                    class="mb-2"
                    label="Pauza mezi vlnami"
                    required
                ></v-select>
                <v-select
                    v-model="selectDefendersHitStrength"
                    :items="defendersStrength"
                    class="mb-2"
                    label="ÚČ obránce"
                    required
                ></v-select>
                <v-select
                    v-model="selectSmithyUpgradeDuration"
                    :items="smithyUpgradeStrength"
                    class="mb-2"
                    label="Výdrž vylepšení kovárny"
                    required
                ></v-select>
                <v-select
                    v-model="selectSmithyUpgradeWaiting"
                    :items="[selectSmithyUpgradeWaiting]"
                    class="mb-2 readonly"
                    label="Čekání na vylepšení kovárny"
                    readonly
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>

  <p>Souřadnice: {{ currentPlayer?.location.lat}} {{ currentPlayer?.location.lng }}</p>
  <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
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
