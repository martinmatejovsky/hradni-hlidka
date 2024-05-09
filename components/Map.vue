<script setup lang="ts">
import {useState} from "nuxt/app";
import type {Invader, PlayerData} from "~/types/CustomTypes";
import {STORE_CURRENT_PLAYER} from "~/constants";
import horseRiderIcon from '~/assets/icons/horse-rider.svg';

const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);
const otherPlayers = ref<PlayerData[]>([]);
const zoom = ref(11)

defineProps({
  connectedPlayers: {
    type: Array as PropType<PlayerData[]>,
    required: true
  },
});
</script>

<template>
  <p>connected players count: {{connectedPlayers?.length}}</p>

  <div style="height:70vh; width:100%">
    <LMap
        ref="map"
        :zoom="zoom"
        :center="[50.1912094, 12.7429419]"
    >
      <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
          layer-type="base"
          name="OpenStreetMap"
      />
      <LTileLayer
          url="/map-layers/{z}/{x}/{y}.png"
          attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> + copy; Martin Matějovský bejby contributors"
          layer-type="base"
          name="OpenStreetMap"
      />

      <template v-for="(player) in connectedPlayers" :key="player.key">
        <l-marker :lat-lng="[player.location.latitude, player.location.longitude]">
          {{ player.name }}
          <l-icon :iconUrl="horseRiderIcon" :icon-size="[25, 25]" alt="player.name" title="player.name"/>
        </l-marker>
      </template>
    </LMap>
  </div>
</template>

<style>
.leaflet-marker-icon {
  transition: all 0.3s;
}
</style>
