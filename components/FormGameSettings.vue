<template>
  <div class="my-4">
    <v-container>
      <v-form @submit.prevent="submitForm">
        <v-row>
          <v-col
              cols="6"
              md="4"
          >
            <v-select
                v-model="selectedOption"
                :items="options"
                label="Vyberte bitevní pole"
                required
                :rules="selectRules"
            ></v-select>
          </v-col>
        </v-row>
        <v-btn type="submit" :disabled="!isFormValid" rounded="xs">Spustit bitvu</v-btn>
      </v-form>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const isFormValid = computed(() => selectedOption.value !== null)
const selectedOption = ref<string | null>(null)
const options: string[] = ['pole A', 'pole B', 'pole C']
const selectRules = [
  (value: string | null) => !!value || 'Vyberte prosím hodnotu'
];
const submitForm = () => {
  console.log('Form submitted');
};

</script>