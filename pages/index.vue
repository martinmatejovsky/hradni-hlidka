<script setup lang="ts">
// IMPORTS
import {computed, type ComputedRef} from 'vue';
import type {GameLocation, PlayerData} from "~/types/CustomTypes";
import {STORE_APPLICATION_ERROR, STORE_CURRENT_PLAYER} from "~/constants";

// DATA
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
const selectedLocationKey = ref<string | null>(null)
const dataLoading = ref<boolean>(false);
const pageError = useState(STORE_APPLICATION_ERROR);
let gameLocations: GameLocation[]

// COMPUTED
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null
})
const locationOptions: ComputedRef<string[]> = computed(() => {
  if (gameLocations) {
    return gameLocations.map(location => location.locationName);
  } else {
    return [];
  }
});

// METHODS
const openTestGame = () => {
  navigateTo('/game?id=1')
}
const createNewBattle = async () => {
  dataLoading.value = true;
  await $fetch( `${runtimeConfig.public.serverUrl}/api/game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameLocation: gameLocations.find(location => location.locationName === selectedLocationKey.value),
    })
  }).then((response) => {
    const gameInstance = response as {id: string};
    navigateTo('/game?id=' + gameInstance.id)
  }).catch((error) => {
    pageError.value = 'Nepodařilo se spojit se serverem <br />' + error
  }).finally(() => dataLoading.value = false);
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
  <div class="my-4">
    <v-container>
      <div v-if="dataLoading">
        <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
        načítám data...
      </div>
      <v-row v-else>
        <v-col cols="12" sm="6" md="4">
          <v-form :fast-fail="true" @submit.prevent="createNewBattle">
            <v-select
                v-model="selectedLocationKey"
                :items="locationOptions"
                class="mb-2"
                label="Vyberte bitevní pole"
                required
            ></v-select>
            <v-btn type="submit" :disabled="!isFormValid" :block="true" rounded="xs" class="mb-2">Založit novou bitvu</v-btn>
            <v-btn @click="openTestGame" type="button" :block="true" :disabled="!isFormValid" rounded="xs">testovací hra /1</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-container>

    <p>Souřadnice: {{ currentPlayer?.location.latitude }} {{ currentPlayer?.location.longitude }}</p>
    <p>Přesnost: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
  </div>
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