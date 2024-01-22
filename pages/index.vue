<template>
  <h2>Základní výpočet, jestli je uživatel v herním polygonu</h2>
  <p v-if="errorMessage" class="text-red">{{ errorMessage }}</p>
  <p>Lat, lon:</p>
  <p>
    {{ playerLocation?.latitude || 'zařízení nerozpoznává polohu' }} {{ playerLocation?.longitude }}</p>
  <p>Accuracy: <span :class="[accuracyClass, 'font-weight-bold']">{{ playerAccuracy }}</span> m</p>
  <p>Is inside?</p>
  <p class="text-h2 text-red">{{ nameOfIntersectedArea }}</p>

  <v-dialog v-model="showPermissionDialog" :scrim="false"
  transition="dialog-bottom-transition">
    <template v-slot:default="showPermissionDialog">
      <v-card title="Dialog">
        <v-card-text>
          Chcete povolit aplikaci přístup k poloze? Je to nutné pro puštění hry.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
              text="Povolit"
              @click="grantPermission"
          ></v-btn>
          <v-btn
              text="Zamítnout"
              @click="denyPermission"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import type { PlayerCoordinates } from '~/types/CustomTypes'
import { useIntersectedAreaName } from '~/composables/useIntersectedAreaName'
import { usePlayerLocationAccuracy } from '~/composables/usePlayerLocationAccuracy'

const errorMessage = ref(null as string | null)
const showPermissionDialog = ref(false as boolean)
const playerLocation = ref<PlayerCoordinates | null>(null)
const playerAccuracy = computed(() => usePlayerLocationAccuracy(playerLocation.value))
const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
}
const nameOfIntersectedArea = computed(() => useIntersectedAreaName(playerLocation.value))
const accuracyClass = computed(() => {
  if (playerAccuracy.value < 6) {
    return 'text-green'
  } else if (playerAccuracy.value < 20) {
    return 'text-yellow'
  } else {
    return 'text-red'
  }
})

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.permissions.query({name: 'geolocation'}).then(permissionStatus => {
      if (permissionStatus.state === 'granted') {
        navigator.geolocation.watchPosition(position => {
          playerLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }, function(error) {
          errorMessage.value = error.message
        }, geolocationOptions);
      } else if (permissionStatus.state === 'prompt') {
        showPermissionDialog.value = true;
      } else {
        errorMessage.value = 'Geolokace není povolena.'
      }
    });
  } else {
    console.error('Geolokace není podporována.')
  }
})

const grantPermission = () => {
  showPermissionDialog.value = false;
  navigator.geolocation.watchPosition(
      position => {
        playerLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      },
      error => {
        errorMessage.value = error.message;
      },
      geolocationOptions
  );
};

const denyPermission = () => {
  showPermissionDialog.value = false;
  errorMessage.value = 'Geolokace není povolena.';
};
</script>