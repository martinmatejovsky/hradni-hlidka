<template>
  <div class="my-4">
    <v-container>
      <div v-if="dataLoading">
        <v-icon icon="mdi-loading" class="hh-icon-loading"></v-icon>
        načítám data...
      </div>
      <div v-else>
        <v-row>
          <v-col cols="6" md="4">
            <v-form :fast-fail="true" @submit.prevent="submitForm">
              <v-text-field :clearable="true" v-model="selectedPlayerName" required label="Jméno"></v-text-field>
              <v-btn type="submit" class="mb-2" :block="true" :disabled="!isFormValid" rounded="xs">Přidat se</v-btn>
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

// PROPS
const props = defineProps<{gameId: string}>();

// DATA
const emit = defineEmits(['@form-submitted'])
const isFormValid = computed(() => {
  return selectedPlayerName.value
})
const selectedPlayerName = ref<string>('Test Beolf')
const dataLoading = ref<boolean>(false);
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);

// METHODS
const submitForm = async () => {
  currentPlayer.value.name = selectedPlayerName.value;
  currentPlayer.value.key = selectedPlayerName.value + '123456';

  const socket = useSocket();
  if (!socket.connected) {
    socket.connect();
    socket.emit('joinGame', {gameId: props.gameId, player: currentPlayer.value});
  }
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