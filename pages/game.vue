<template>
<h1>Game</h1>
</template>

<script setup lang="ts">
import {onBeforeUnmount} from "vue";
import io from 'socket.io-client';
const socket = io("http://localhost:4000", { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Socket connected');
});

onBeforeMount(() => {
  socket.emit('join', 'game');
});

onBeforeUnmount(() => {
  if (socket) {
    socket.close();
  }
});
</script>