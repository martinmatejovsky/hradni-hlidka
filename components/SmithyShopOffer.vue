<script setup lang="ts">
import {computed} from "vue";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import type {Socket} from "socket.io-client";
import type {PlayerData} from "~/types/CustomTypes";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";
import {Perks} from "~/types/CustomTypes"; // to enable enum to be defined at runtime it must be imported without "type" prefix
import cauldronFullIcon from "assets/icons/cauldron-full.svg";
const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();

// PROPS
const props = defineProps<{socket: Socket | undefined}>();

const emit = defineEmits(['perkChosen'])
const currentPlayer = computed((): PlayerData => storeCurrentPlayer.currentPlayer);
const gameSettings = computed(() => storeGameInstance.gameSettings);
const currentSmithy = computed(() => storeGameInstance.gameInstance.utilityZones.find(zone => {
  return zone.key === currentPlayer.value.insideZone;
}));

const boilingOilIsReady = computed(() => {
  const oilStats = currentSmithy.value?.boilingOil;
  return oilStats ? oilStats.readiness === oilStats.readyAt : false
});

const activatePerkSharpSword = () => {
  props.socket.emit('smithyUpgradeAchieved', {
    gameId: storeGameInstance.gameInstance.id,
    player: currentPlayer.value,
    perk: Perks.sharpSword,
    perkValue: gameSettings.value.smithyUpgradeStrength});

  emit('perkChosen')
}

const activatePerkBoilingOil = (smithyKey: string) => {
  props.socket.emit('smithyUpgradeAchieved', {
    gameId: storeGameInstance.gameInstance.id,
    player: currentPlayer.value,
    perk: Perks.boilingOil,
    perkValue: smithyKey});

  emit('perkChosen')
}
</script>

<template>
  <div class="hh-smithy-shop-offer pa-3">
    <h3 class="hh-smithy-shop-offer__heading mb-2 text-black">Zvolte vylepšení z kovárny:</h3>

    <div class="d-flex justify-center align-center ga-5">
      <v-btn
        variant="outlined"
        icon="mdi-sword"
        @click="activatePerkSharpSword"
        density="compact"
        size="large"
      >
      </v-btn>

      <v-btn
        :disabled="!boilingOilIsReady || storeCurrentPlayer.playerAlreadyCarriesOilPot"
        variant="outlined"
        @click="activatePerkBoilingOil(currentSmithy?.key)"
      >
        <img
          :src="cauldronFullIcon"
          alt="Cauldron"
          class="custom-icon"
          width="32px"
          height="32px"/>
      </v-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.v-btn {
  min-width: 0;
  width: 48px;
  height: 48px;
}
</style>