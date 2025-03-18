<script setup lang="ts">
import {useState} from "nuxt/app";
import {STORE_APPLICATION_ERROR} from "~/constants";
import type {Socket} from 'socket.io-client'
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {WeaponType, WeaponData} from "~/types/CustomTypes";

// Pinia store
const storeCurrentPlayer = useCurrentPlayerStore();
const storeGameInstance = useGameInstanceStore();

// PROPS
const props = defineProps<{socket: Socket | undefined}>();

// DATA
const pageError = useState(STORE_APPLICATION_ERROR);
const emit = defineEmits(['@form-submitted'])
const isFormValid = computed(() => {
  return selectedPlayerName.value
})
const selectedPlayerName = ref<string>('Test Beolf')
const weaponType = ref<string>(WeaponType.SWORD)

// COMPUTED
const weaponOptions = computed(() => Object.values(WeaponType).map(type => ({
  value: type,
  text: WeaponData[type].label
})));


// METHODS
const submitForm = async () => {
  if (!props.socket) {
    pageError.value = 'Nepodařilo se připojit k serveru'
    return
  }

  storeCurrentPlayer.currentPlayer.key = props.socket.id as string;
  storeCurrentPlayer.currentPlayer.strength = storeGameInstance.gameSettings.defendersHitStrength;

  props.socket.emit('joinGame', {gameId: storeGameInstance.gameInstance.id, player: storeCurrentPlayer.currentPlayer}, (response: string) => {
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
  <v-container class="my-4">
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-form :fast-fail="true" @submit.prevent="submitForm">
          <v-text-field
              :clearable="true"
              v-model="storeCurrentPlayer.currentPlayer.name"
              required
              label="Jméno"
          />

          <v-select
              v-model="storeCurrentPlayer.currentPlayer.weaponType"
              :items="weaponOptions"
              item-title="text"
              item-value="value"
              label="Zbraň"
          />

          <v-btn type="submit" class="mb-2" :block="true" :disabled="!isFormValid" rounded="xs">Přidat se</v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>