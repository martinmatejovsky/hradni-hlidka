<script setup lang="ts">
import type {Invader} from "~/types/CustomTypes";

defineProps({
    climbingInvaders: {
      type: Array as PropType<(Invader | null)[]>,
      required: true
    }
});
</script>

<template>
<div class="climbing-ladder">
  <div v-for="(invader, index) in climbingInvaders" :key="index" class="climbing-ladder-step">
    <v-icon v-if="invader !== null" icon="mdi-sword" class="climbing-ladder-invader-icon"></v-icon>
  </div>
</div>
</template>

<style scoped lang="scss">
.climbing-ladder {
  display: flex;
  flex-basis: 100%;
}

.climbing-ladder-step {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 40px;
  border: 2px solid #E6E6E6;
}
.climbing-ladder-invader-icon {
  position: absolute;
}

</style>