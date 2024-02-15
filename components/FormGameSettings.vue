<template>
  <div class="my-4">
    <v-container>
      <div v-if="componentError">
        <v-alert type="error" class="mb-4" dismissible v-html="componentError"></v-alert>
      </div>
      <div v-if="dataLoading">
        <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
        načítám data...
      </div>
      <div v-else>
        <v-row>
          <v-col cols="6" md="4">
            <v-form :fast-fail="true" @submit.prevent="submitForm">
              <v-select
                  v-model="selectedLocationKey"
                  :items="locationOptions"
                  class="mb-2"
                  label="Vyberte bitevní pole"
                  required
              ></v-select>
              <v-text-field :clearable="true" v-model="selectedPlayerName" required label="Label"></v-text-field>
              <v-btn type="submit" class="mb-2" :block="true" :disabled="!isFormValid" rounded="xs">Založit novou bitvu</v-btn>
              <v-btn @click="openTestGame" type="button" class="mb-2" :block="true" :disabled="!isFormValid" rounded="xs">testovací hra /1</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type {GameLocation, PlayerData} from "~/types/CustomTypes";
import type {ComputedRef} from "vue";
import {useState} from "nuxt/app";
import {STORE_CURRENT_PLAYER} from "~/constants";

const templateServerErrorMessage = 'Nepodařilo se spojit se serverem';

// DATA
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null && selectedPlayerName.value
})
const selectedLocationKey = ref<string | null>(null)
const selectedPlayerName = ref<string>('Test Beolf')
let gameLocations: GameLocation[]
const dataLoading = ref<boolean>(false);
const componentError = ref<string | null>(null);
const runtimeConfig = useRuntimeConfig()

// COMPUTED
const locationOptions: ComputedRef<string[]> = computed(() => gameLocations.map(location => location.locationName))

// METHODS
const fetchGameLocations = async () => {
  dataLoading.value = true;
  await $fetch(runtimeConfig.public.serverUrl + '/api/game-locations')
      .then(response => {
        gameLocations = response as GameLocation[];
      })
      .catch(error => {
        console.error(error)
        componentError.value = 'Nepodařilo se načíst seznam bitevních míst'
      })
      .finally(() => dataLoading.value = false);
}
const openTestGame = () => {
  useState<PlayerData>(STORE_CURRENT_PLAYER).value.name = selectedPlayerName.value;
  useState<PlayerData>(STORE_CURRENT_PLAYER).value.key = selectedPlayerName.value + '123456';
  navigateTo('/game/1')
}
const submitForm = async () => {
  dataLoading.value = true;
  componentError.value = null;
  useState<PlayerData>(STORE_CURRENT_PLAYER).value.name = selectedPlayerName.value;
  useState<PlayerData>(STORE_CURRENT_PLAYER).value.key = selectedPlayerName.value + '123456';

  await $fetch( runtimeConfig.public.serverUrl + '/api/game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameLocation: gameLocations.find(location => location.locationName === selectedLocationKey.value),
      hostingPlayer: useState<PlayerData>(STORE_CURRENT_PLAYER).value
    })
  }).then((response) => {
    const gameInstance = response as {id: string};

    if (!gameInstance.id) {
      componentError.value = templateServerErrorMessage
    } else {
      const newUrl = '/game/' + gameInstance.id
      navigateTo(newUrl)
    }
  }).catch((error) => {
    componentError.value = templateServerErrorMessage + '<br />' + error
  })

  dataLoading.value = false;
}

// LIFE CYCLE HOOKS
onBeforeMount(() => {
  fetchGameLocations();
});
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