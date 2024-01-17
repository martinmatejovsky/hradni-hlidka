<template>
  <v-app class="pa-4">
    <v-container>
      <v-sheet class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4" height="250"
               elevation="2"
               rounded
               max-width="800"
               width="100%">
        <div>
          <h1 class="text-h2 font-weight-black text-orange mb-12">Chyba {{ error.statusCode }}</h1>
          <p class="mb-10">{{ error.message }}</p>
          <v-btn color="primary" @click="handleClearError">Zpět na hlavní stránku</v-btn>
        </div>
      </v-sheet>
    </v-container>
  </v-app>
</template>

<script setup>
defineProps(['error'])
const handleClearError = () => {
  clearError({redirect: '/'})
}
</script>