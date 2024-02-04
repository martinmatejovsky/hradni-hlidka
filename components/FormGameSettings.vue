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
import {useStoredGameLocations, useStoredBattleZone} from "~/composables/states";
import type {GameLocation, GameState} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import * as CONST from "~/constants";
import type {ComputedRef} from "vue";

// DATA
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null && selectedPlayerName.value
})
const selectedLocationKey = ref<string | null>(null)
const selectedPlayerName = ref<string | null>('Test Beolf')
const gameLocations = useState<GameLocation[]>(CONST.STORE_GAME_LOCATIONS);
const dataLoading = ref<boolean>(false);

// COMPUTED
const locationOptions: ComputedRef<string[]> = computed(() => gameLocations.value.map(zone => zone.name))

// METHODS
const fetchGameLocations = async () => {
  dataLoading.value = true;
  await $fetch('/api/battle-zones')
      .then(response => {
        useStoredGameLocations(response);
      })
      .catch(error => console.error(error))
      .finally(() => dataLoading.value = false);
}
const submitForm = async () => {
  const selectedGameLocation = gameLocations.value.find(zone => zone.name === selectedLocationKey.value)
  if (selectedGameLocation) {
    console.log('Selected game location:', selectedGameLocation);
    try {
      await $fetch('/api/game-instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameLocation: selectedGameLocation,
          hostingPlayer: selectedPlayerName.value
        })
      })
    } catch (error) {
      console.error(error)
    }
    useStoredBattleZone(selectedGameLocation);
    useState<GameState>(CONST.STORE_GAME_STATE).value = 'ready';
  } else {
    console.error('Selected battle zone not found')
  }
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