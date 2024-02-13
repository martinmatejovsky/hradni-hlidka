<template>
<h1>Game</h1>
</template>

<script setup lang="ts">
import {onBeforeUnmount} from "vue";
import io from 'socket.io-client';
const socket = io();

socket.on('connect', () => {
  console.log('Socket connected');
});

const closeSocket = () => {
  if (socket) {
    socket.close();
  }
};

onBeforeUnmount(closeSocket);
</script>