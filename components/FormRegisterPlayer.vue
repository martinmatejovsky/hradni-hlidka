<script setup lang="ts">
import type {GameInstance, PlayerData} from "~/types/CustomTypes";
import {useState} from "nuxt/app";
import {STORE_APPLICATION_ERROR, STORE_CURRENT_PLAYER, STORE_GAME_INSTANCE} from "~/constants";
import type {Socket} from 'socket.io-client'

// PROPS
const props = defineProps<{socket: Socket | undefined}>();

// DATA
const pageError = useState(STORE_APPLICATION_ERROR);
const emit = defineEmits(['@form-submitted'])
const isFormValid = computed(() => {
  return selectedPlayerName.value
})
const selectedPlayerName = ref<string>('Test Beolf')
const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const currentGame = useState<GameInstance>(STORE_GAME_INSTANCE);

// METHODS
const submitForm = async () => {
  if (!props.socket) {
    pageError.value = 'Nepodařilo se připojit k serveru'
    return
  }

  currentPlayer.value.name = selectedPlayerName.value;
  currentPlayer.value.key = props.socket.id as string;

  props.socket.emit('joinGame', {gameId: currentGame.value.id, player: currentPlayer.value}, (response: string) => {
    if (response === 'ok') {
      emit('@form-submitted')
    } else {
      pageError.value = 'Nepodařilo se připojit ke hře'
      console.error('Failed to join game', response)
    }
  })
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