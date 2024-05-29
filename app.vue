<script setup lang="ts">
const pageError = useStoredApplicationError()

// STATE INITIAL VALUES
const storedGeolocationWatcher = useStoredGeolocationWatcher();

// LIFECYCLE HOOKS
onBeforeMount(() => {
  useStoredCurrentPlayer()
  useInitializePlayerGeolocationWatcher();
})

onUnmounted(() => {
  if (storedGeolocationWatcher.value) {
    navigator.geolocation.clearWatch(storedGeolocationWatcher.value);
  }
});
</script>

<template>
  <v-app>
    <v-container class="bg-surface-variant mb-6">
      <v-app-bar title="Hradní hlídka"></v-app-bar>
      <v-main>
        <div v-if="pageError">
          <v-alert type="error" class="mb-4" dismissible v-html="pageError"></v-alert>
        </div>

        <NuxtPage/>
      </v-main>
    </v-container>
  </v-app>
</template>