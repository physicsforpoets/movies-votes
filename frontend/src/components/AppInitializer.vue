<script setup>
import { onMounted, ref } from 'vue';
import { useListStore } from '../stores/list';
import { useFavoritesStore } from '../stores/favorites';
import LoadingSpinner from './LoadingSpinner.vue';
import config from '../config.json';

const listId = config.listId;
const loading = ref(true);

const listStore = useListStore();
const favoritesStore = useFavoritesStore();

onMounted(async () => {
  // Only load if we don't already have data
  if (!listStore.movies.length) {
    await listStore.getList(listId);
  }

  // Always reload favorites since they can change during the session
  await favoritesStore.getMyFavorites(listId);

  loading.value = false;
});
</script>

<template>
  <LoadingSpinner v-if="loading" class="loading-spinner" />
  <slot v-else />
</template>

<style scoped>
.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
