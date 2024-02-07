<template>
  <!-- READY? -->
<!--  <div v-if="gameState === 'ready'">-->
<!--    <h2>Ke hře připraveni:</h2>-->
<!--    <p v-if="connectedPlayers.length === 0">Nikdo se zatím nepřipojil.</p>-->
<!--    <p v-else>-->
<!--      <span v-for="player in connectedPlayers" :key="player" class="text-green">{{ player }}</span>-->
<!--    </p>-->
<!--    <v-btn @click="startAttack" rounded="xs" class="mt-3 mb-3">Zahájit útok</v-btn>-->
<!--    <nuxt-link to="/">-->
<!--      <v-btn rounded="xs" class="mt-3 mb-3">Zpět</v-btn>-->
<!--    </nuxt-link>-->
<!--  </div>-->

<!--  &lt;!&ndash; RUNNING &ndash;&gt;-->
<!--  <div v-else-if="gameState === 'running'">-->
<!--    <p class="mb-4">Jsem uvnitř? <span class="text-h4 text-indigo-lighten-4">{{ nameOfIntersectedArea }}</span></p>-->
<!--    <h3 class="mb-3">Postup útoku</h3>-->
<!--    <p v-if="!battleZones">Žádná data o útoku.</p>-->
<!--    <div v-else>-->
<!--      <div v-for="{ key, zoneName, guardians, assembledInvaders, assaultLadder } in battleZones" :key="key" class="mb-3">-->
<!--        <h4 class="text-amber">{{ zoneName }}</h4>-->
<!--        <p>strážce:-->
<!--          <template v-if="!guardians.length">&#45;&#45;</template>-->
<!--          <template v-else>-->
<!--            <span v-for="guardian in guardians" :key="guardian.name"  class="text-green">{{ guardian.name || '&#45;&#45;' }}</span>-->
<!--          </template>-->
<!--        </p>-->
<!--        <p>Shromáždění útočníci:-->
<!--          <v-icon v-for="n in assembledInvaders" :key="n" icon="mdi-sword"></v-icon>-->
<!--        </p>-->
<!--        <p>Žebřik <v-icon icon="mdi-arrow-right-bold-outline"></v-icon></p>-->
<!--        <ClimbingLadder :climbingInvaders="assaultLadder" />-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

<!--  &lt;!&ndash; LOST OR WON&ndash;&gt;-->
<!--  <div v-else-if="gameState === 'lost' || gameState === 'won'">-->
<!--    <h4 class="text-h4 mb-4" :class="[gameState === 'won' ? 'text-green' : 'text-red']">-->
<!--      {{ gameState === 'won' ? 'Vítězství' : 'Prohráli jste' }}-->
<!--    </h4>-->
<!--    <v-btn @click="restartAttack" rounded="xs" class="mb-6">Znovu na ně!</v-btn>-->
<!--  </div>-->
</template>

<!--<script setup lang="ts">-->
<!--import {STORE_GAME_INSTANCE, STORE_CURRENT_PLAYER} from "~/constants";-->
<!--import type {BattleZone, GameInstance, PlayerData} from "~/types/CustomTypes";-->
<!--import {computed, watch} from "vue";-->
<!--import {useState} from "nuxt/app";-->
<!--import * as CONST from "~/constants";-->

<!--// DATA-->
<!--const intervalRunAttack = ref<NodeJS.Timeout | null>(null);-->
<!--const currentPlayer = useState<PlayerData>(STORE_CURRENT_PLAYER);-->
<!--const gameState: string = useGetterGameState();-->
<!--const battleZones: BattleZone[] = useGetterBattleZones();-->
<!--const connectedPlayers: string[] = useState<GameInstance>(STORE_GAME_INSTANCE).value.players.map(player => player.name);-->
<!--// METHODS-->
<!--const restartAttack = (): void => {-->
<!--  // TODO: send request to server to clear game stats, set game state to "setting" and allow connection for others, etc.-->
<!--}-->
<!--const startAttack = () => {-->
<!--  useRequestWakeLockScreen();-->
<!--  // TODO: send to server that game has started. On response start the game also on client side-->
<!--  // like for example with intervalRunAttack.value = useRunAttack();-->
<!--};-->
<!--const keyOfIntersectedArea = computed(() => useIntersectedAreaKey(currentPlayer.value?.location));-->
<!--const nameOfIntersectedArea = computed(() => {-->
<!--  if (keyOfIntersectedArea.value.length > 0) {-->
<!--    return battleZones.find((zone: BattleZone) => zone.key === keyOfIntersectedArea.value);-->
<!--  } else {-->
<!--    return '&#45;&#45;';-->
<!--  }-->
<!--});-->
<!--const updateAreasOfCurrentPlayer = ():void => {-->
<!--  if (keyOfIntersectedArea.value.length > 0) {-->
<!--    battleZones.forEach((zone: BattleZone) => {-->
<!--      if (zone.key === keyOfIntersectedArea.value) {-->
<!--        zone.guardians.push(currentPlayer.value);-->
<!--      }-->
<!--    })-->
<!--  } else if (keyOfIntersectedArea.value === '') {-->
<!--    battleZones.forEach((area: BattleZone) => {-->
<!--      const index = area.guardians.findIndex((guardian: PlayerData) => guardian.name === currentPlayer.value.name);-->
<!--      area.guardians.splice(index, 1);-->
<!--    })-->
<!--  }-->
<!--}-->

<!--// WATCHERS-->
<!--watch(keyOfIntersectedArea, (): void => {-->
<!--  if (battleZones) {-->
<!--    updateAreasOfCurrentPlayer()-->
<!--  }-->
<!--});-->
<!--watch(useState(CONST.STORE_GAME_STATE), (newValue): void => {-->
<!--  if (newValue === 'lost' || newValue === 'won') {-->
<!--    if (intervalRunAttack.value !== null) {-->
<!--      clearInterval(intervalRunAttack.value);-->
<!--      intervalRunAttack.value = null;-->
<!--    }-->
<!--    setTimeout(useReleaseWakeLockScreen, 5000);-->
<!--  }-->
<!--})-->

<!--// LIFECYCLE HOOKS-->
<!--onMounted(() => {-->
<!--  if (intervalRunAttack.value !== null) {-->
<!--    clearInterval(intervalRunAttack.value);-->
<!--  }-->
<!--  useReleaseWakeLockScreen();-->
<!--})-->
<!--</script>-->