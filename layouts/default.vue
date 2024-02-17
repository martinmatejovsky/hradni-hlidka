<template>
  <v-app>
    <v-container class="bg-surface-variant mb-6">
      <v-app-bar title="Hradní hlídka"></v-app-bar>
      <v-main>
        <div v-if="pageError">
          <v-alert type="error" class="mb-4" dismissible v-html="pageError"></v-alert>
        </div>
        <slot></slot>
      </v-main>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
const pageError = useStoredApplicationError()
</script>