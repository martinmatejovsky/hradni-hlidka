<template>
<h1>Game</h1>
</template>

<script setup lang="ts">
import {onBeforeUnmount} from "vue";
import io from 'socket.io-client';

const runtimeConfig = useRuntimeConfig()
const socket = io(runtimeConfig.public.socketIoUrl as string, { transports: ['websocket'] });

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