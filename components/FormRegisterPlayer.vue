<script setup lang="ts">
import type {PlayerData} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_CURRENT_PLAYER} from "~/constants";
import type {Socket} from 'socket.io-client'

// PROPS
const props = defineProps<{gameId: string, socket: Socket}>();

// DATA
const emit = defineEmits(['@form-submitted'])
const isFormValid = computed(() => {
  return selectedPlayerName.value
})
const selectedPlayerName = ref<string>('Test Beolf')
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);

// METHODS
const submitForm = async () => {
  currentPlayer.value.name = selectedPlayerName.value;
  currentPlayer.value.key = props.socket.id as string;

  props.socket.emit('joinGame', {gameId: props.gameId, player: currentPlayer.value});
}
</script>

<template>
  <div class="my-4">
    <v-container>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-form :fast-fail="true" @submit.prevent="submitForm">
            <v-text-field :clearable="true" v-model="selectedPlayerName" required label="Jméno"></v-text-field>
            <v-btn type="submit" class="mb-2" :block="true" :disabled="!isFormValid" rounded="xs">Přidat se</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>