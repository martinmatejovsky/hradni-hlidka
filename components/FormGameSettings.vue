<template>
  <div class="my-4">
    <v-container>
      <div v-if="dataLoading">
        <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
        loading data from server...
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
            </v-form>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import type {GameLocation, PlayerData} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_GAME_LOCATIONS, STORE_CURRENT_PLAYER} from "~/constants";
import type {ComputedRef} from "vue";

// DATA
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null && selectedPlayerName.value
})
const selectedLocationKey = ref<string | null>(null)
const selectedPlayerName = ref<string | null>('Test Beolf')
const gameLocations = useState<GameLocation[]>(STORE_GAME_LOCATIONS);
const dataLoading = ref<boolean>(false);

// COMPUTED
const locationOptions: ComputedRef<string[]> = computed(() => gameLocations.value.map(location => location.locationName))

// METHODS
const fetchGameLocations = async () => {
  dataLoading.value = true;
  await $fetch('/api/game-locations')
      .then(response => {
        useStoredGameLocations(response);
      })
      .catch(error => console.error(error))
      .finally(() => dataLoading.value = false);
}
const submitForm = async () => {
  dataLoading.value = true;
  const selectedGameLocation = gameLocations.value.find(location => location.locationName === selectedLocationKey.value)
  if (selectedGameLocation && selectedPlayerName.value) {
    let newPlayer: PlayerData = useState<PlayerData>(STORE_CURRENT_PLAYER).value;
    newPlayer.name = selectedPlayerName.value;

    await $fetch('/api/game-instances', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameLocation: selectedGameLocation,
        hostingPlayer: newPlayer
      })
    }).then(response => {
      if ('error' in response.body) {
        console.error(response.body.error);
      } else {
        useStoredGameInstance(response.body);
        navigateTo('/battle')
      }
    }).catch(error => console.error(error))

  } else {
    console.error('Selected battle zone not found')
  }

  dataLoading.value = true;
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