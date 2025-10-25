<script setup>
import LoadingSpinner from './LoadingSpinner.vue';
</script>

<template>
  <div class="full-screen-loader">
    <LoadingSpinner />
  </div>
</template>

<style scoped>
.full-screen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 6000;
}
</style>