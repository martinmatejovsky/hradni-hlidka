<script setup lang="ts">
import { ref } from 'vue'
const zoom = ref(20)
</script>

<template>
<h1>Mapa</h1>

<div style="height:70vh; width:70vw">
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
  </LMap>
</div>
</template>

<style scoped>
</style>
