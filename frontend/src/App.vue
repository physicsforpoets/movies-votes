<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import { useListStore } from './stores/list';
import { useFavoritesStore } from './stores/favorites';
import { useSocket } from './composables/useSocket';
import GridIcon from './components/icons/GridIcon.vue';
import ListIcon from './components/icons/ListIcon.vue';
import FullScreenLoader from './components/FullScreenLoader.vue';
import VotingStartedModal from './components/VotingStartedModal.vue';
import VotingEndedModal from './components/VotingEndedModal.vue';
import config from './config.json';

const listStore = useListStore();
const favoritesStore = useFavoritesStore();
const { joinList, leaveList, onEvent } = useSocket();
const isPending = ref(false);
const listId = config.listId;

const votingStartedDetails = ref(null);
const votingEndedDetails = ref(null);

const setScrollLock = (locked = true) => {
  const $scrollEl = document.getElementById('app-container');

  if (!$scrollEl) {
    throw new Error('Window container not found.');
  }

  if (locked) {
    $scrollEl.style.setProperty('overflow-y', 'hidden');
  } else {
    $scrollEl.style.removeProperty('overflow-y');
  }
}

const onVotingStartedModalClose = () => {
  votingStartedDetails.value = null;
  setScrollLock(false);
}

const onVotingEndedModalClose = () => {
  votingEndedDetails.value = null;
  setScrollLock(false);
}

// Store cleanup functions
let cleanupFunctions = [];

onMounted(async () => {
  // Cleanup any existing listeners first (in case of HMR re-mount)
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions = [];

  isPending.value = true;

  // Load initial data
  await Promise.all([
    listStore.getList(listId),
    listStore.getListMovies(listId),
  ]);

  // Load favorites
  await favoritesStore.getMyFavorites(listId);

  isPending.value = false;

  // Join the list room for real-time updates AFTER data is loaded
  joinList(listId);

  // Listen for voting-started event
  const cleanup1 = onEvent('voting-started', (data) => {
    console.log('Voting started event received:', data);

    // Update list store if it exists
    if (listStore.list && data.listId === listId) {
      listStore.updateVotingRound(data.round);
      listStore.setVotingActive(true);
      setScrollLock(true);
      votingStartedDetails.value = data;
    }
  });

  // Listen for voting-ended event
  const cleanup2 = onEvent('voting-ended', (data) => {
    console.log('Voting ended event received:', data);

    // Update list store if it exists
    if (listStore.list && data.listId === listId) {
      listStore.updateVotingRound(data.round);
      listStore.setVotingActive(false);
      setScrollLock(true);
      votingEndedDetails.value = data;
    }
  });

  // Store cleanup functions
  cleanupFunctions = [cleanup1, cleanup2];
});

onUnmounted(() => {
  // Cleanup event listeners
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions = [];

  // Leave the list room when app unmounts
  leaveList(listId);
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

    <VotingStartedModal :details="votingStartedDetails" @close="onVotingStartedModalClose" />
    <VotingEndedModal :details="votingEndedDetails" @close="onVotingEndedModalClose" />

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
