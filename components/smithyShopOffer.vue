<script setup lang="ts">
import {computed} from "vue";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import type {Socket} from "socket.io-client";
import type {PlayerData} from "~/types/CustomTypes";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
const storeGameInstance = useGameInstanceStore();
let socket: Socket;
const storeCurrentPlayer = useCurrentPlayerStore();
import {Perks} from "~/types/CustomTypes"; // to enable enum to be defined at runtime it must be imported without "type" prefix

const currentPlayer = computed((): PlayerData => storeCurrentPlayer.currentPlayer);
const gameSettings = computed(() => storeGameInstance.gameSettings);

const activatePerkSharpSword = () => {
  socket.emit('smithyUpgradeAchieved', {
    gameId: storeGameInstance.gameInstance.id,
    player: currentPlayer.value,
    perk: Perks.sharpSword,
    perkValue: gameSettings.value.smithyUpgradeStrength});
}
</script>

<template>
  <div class="hh-smithy-shop-offer pa-3 d-flex">
    <v-btn
        rounded="sm"
        size="small"
        @click="activatePerkSharpSword"
    >
      <v-icon icon="mdi-sword" color="black"></v-icon>
    </v-btn>
  </div>
</template>

<style scoped lang="scss">

</style>