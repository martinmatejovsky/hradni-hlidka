<script setup lang="ts">
import type {Socket} from "socket.io-client";
import {useGameInstanceStore} from "~/stores/gameInstanceStore";
import {useLeafletMapUtilities} from "~/composables/useLeafletMapMethods";
import {useCurrentPlayerStore} from "~/stores/currentPlayerStore";

const {
  removeBombardingMarkerAnimation
} = useLeafletMapUtilities();

const storeGameInstance = useGameInstanceStore();
const storeCurrentPlayer = useCurrentPlayerStore();

// PROPS
const props = defineProps<{socket: Socket | undefined}>();

const nameOfSelectedBombardZone = computed(() => {
  return storeGameInstance.gameInstance.battleZones.find(zone => {
    return zone.key === storeGameInstance.cannonUsage.targetZoneId;
  })?.zoneName;
});

// METHODS
const fireCannon = () => {
  if (!props.socket) {
    console.error('Socket not connected. Firing cannon failed.');
    return;
  }

  const targetZoneKey = storeGameInstance.cannonUsage.targetZoneId;

  props.socket.emit('fireCannon',
    { targetZoneKey, firedBy: storeCurrentPlayer.currentPlayer.key },)

  removeBombardingMarkerAnimation();
  useEventBus('ownCannonFired', targetZoneKey);
};
</script>

<template>
<div class="hh-panel-fire-cannon pa-3">
  <h3 class="hh-panel-fire-cannon__heading text-center text-black">K palbě připraven!</h3>

  <div class="d-flex justify-center align-center font-weight-bold text-red ga-5">
    <span>Mířím na {{ nameOfSelectedBombardZone ?? '(klikni na mapě)' }}</span>

    <v-btn
      v-if="storeGameInstance.cannonUsage.targetZoneId"
      @click="fireCannon"
      color="red"
      class="ml-3"
    >
      BUM!
    </v-btn>
  </div>
</div>
</template>

<style scoped lang="scss">

</style>