<script setup>
import { ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useListStore } from './stores/list';
import GridIcon from './components/icons/GridIcon.vue';
import ListIcon from './components/icons/ListIcon.vue';
import FullScreenLoader from './components/FullScreenLoader.vue';
import config from './config.json';

const listStore = useListStore();
const isPending = ref(false);

onMounted(async () => {
  isPending.value = true;
  await Promise.all([
    listStore.getList(config.listId),
    listStore.getListMovies(config.listId),
  ]);
  isPending.value = false;
});
</script>

<template>
  <div class="app" id="app-container">
    <RouterView class="app-body" />
    <nav class="app-nav">
      <ul>
        <li>
          <RouterLink class="link" :to="{ name: 'list' }">
            <GridIcon />
            <span>Browse</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink class="link" :to="{ name: 'voting' }">
            <ListIcon />
            <span>Voting</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
    <Transition name="loader">
      <FullScreenLoader v-if="isPending" />
    </Transition>
  </div>
</template>

<style scoped>
.app {
  height: 100dvh;
  overflow-y: auto;
  padding-bottom: 88px;
}

.app-nav {
  bottom: 0;
  left: 0;
  padding: 0 24px min(calc(env(safe-area-inset-bottom) + 24px), 24px);
  position: fixed;
  width: 100%;
  z-index: 800;
}

.app-nav .link {
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  background: none;
  border: none;
  border-radius: 0;
  align-items: center;
  color: white;
  display: flex;
  gap: 4px;
  font-size: 14px;
  font-family: var(--mv-ff-sans-serif);
  font-weight: var(--mv-fw-bold);
  opacity: 0.6;
  padding: 0;
  text-decoration: none;
  transition: opacity 300ms ease-in-out;
}

.app-nav .link.router-link-active {
  opacity: 1;
}

.app-nav ul {
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px) grayscale(80%);
  border-radius: 16px;
  box-shadow: inset 0 0 32px rgba(0, 0, 0, .8);
  color: white;
  display: flex;
  justify-content: space-around;
  list-style: none;
  margin: 0;
  overflow: hidden;
  padding: 16px 0;
}

.app-nav ul>li {
  margin: 0;
  padding: 0;
}

.app-nav svg {
  height: 18px;
  width: 18px;
}

.loader-enter-active,
.loader-leave-active {
  transition: opacity 300ms ease-in-out;
}

.loader-enter-from,
.loader-leave-to {
  opacity: 0;
}
</style>
