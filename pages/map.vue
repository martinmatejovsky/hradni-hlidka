<script setup lang="ts">
useHead({
  script: [ { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', defer: true, integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=", crossorigin: "" } ],
  link: [{ href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=", crossorigin: "" }]
})
</script>

<template>
<h1>Mapa</h1>

<p>https://leafletjs.com/examples/quick-start/</p>

<div id="map"></div>
</template>

<style scoped>
#map {
  height: 60vh;
  width: 60%;
}
</style>
