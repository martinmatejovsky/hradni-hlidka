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
import type {PlayerData} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_CURRENT_PLAYER} from "~/constants";

const templateServerErrorMessage = 'Nepodařilo se spojit se serverem';

// DATA
const isFormValid = computed(() => {
  return selectedLocationKey.value !== null && selectedPlayerName.value
})
const selectedLocationKey = ref<string | null>(null)
const selectedPlayerName = ref<string>('Test Beolf')
const dataLoading = ref<boolean>(false);
const componentError = ref<string | null>(null);
const runtimeConfig = useRuntimeConfig()

// METHODS
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