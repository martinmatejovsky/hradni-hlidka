<script setup lang="ts">
import {computed} from "vue";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import type {Socket} from "socket.io-client";
import type {PlayerData} from "~/types/CustomTypes";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();
import {Perks} from "~/types/CustomTypes"; // to enable enum to be defined at runtime it must be imported without "type" prefix

// PROPS
const props = defineProps<{socket: Socket | undefined}>();

const emit = defineEmits(['perkChosen'])
const currentPlayer = computed((): PlayerData => storeCurrentPlayer.currentPlayer);
const gameSettings = computed(() => storeGameInstance.gameSettings);

const activatePerkSharpSword = () => {
  props.socket.emit('smithyUpgradeAchieved', {
    gameId: storeGameInstance.gameInstance.id,
    player: currentPlayer.value,
    perk: Perks.sharpSword,
    perkValue: gameSettings.value.smithyUpgradeStrength});

  emit('perkChosen')
}
</script>

<template>
  <div class="hh-smithy-shop-offer pa-3">
    <h3 class="hh-smithy-shop-offer__heading mb-2 text-black">Zvolte vylepšení z kovárny:</h3>

    <div class="d-flex justify-center align-center">
      <v-btn
          variant="outlined"
          icon="mdi-sword"
          @click="activatePerkSharpSword"
      >
      </v-btn>
    </div>
  </div>
</template>
