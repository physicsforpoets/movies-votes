<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useListStore } from '../stores/list';
import { useVotesStore } from '../stores/votes';

import LoadingSpinner from '../components/LoadingSpinner.vue';
import VoteForm from '../components/VoteForm.vue';
import ResultsList from '../components/ResultsList.vue';

import config from '../config.json';
const listId = config.listId;

// Store mapping
const votesStore = useVotesStore();
const { getMyVotes } = votesStore;
const { myVotesForRound } = storeToRefs(votesStore);

const listStore = useListStore();
const { getList } = listStore;
const { votingActive, votingRound } = storeToRefs(listStore);

// Component State
const loading = ref(true);
const canUserVote = computed(() => {
  return votingActive.value && !myVotesForRound.value(votingRound.value).length;
});

onMounted(async () => {
  loading.value = true;
  await getList(listId);
  await getMyVotes(listId);
  loading.value = false;
});
</script>

<template>
  <article class="voting-view">
    <div class="view-header">
      <img src="/img/app-title.png" alt="" />
    </div>
    <LoadingSpinner v-if="loading" class="loading-spinner" />
    <template v-else>
      <VoteForm v-if="canUserVote" />
      <ResultsList v-else />
    </template>
  </article>
</template>

<style scoped>
.view-header {
  padding: 24px 0 16px;
}

.view-header img {
  display: block;
  margin: 0 auto;
  max-width: 380px;
  width: 60%;
}

.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
