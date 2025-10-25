<script setup>
import { ref, onMounted, watch } from 'vue';
import { getLists, startNextVotingRound, pickWinner, resetVoting } from '../switchboard';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const lists = ref([]);
const isPending = ref(true);

const listId = ref(null);
const list = ref(null);
const error = ref(null);
const winner = ref(null);

watch(listId, async () => {
  const selectedList = lists.value.find(list => list.id === listId.value) || null;
  if (selectedList) {
    list.value = { ...selectedList };
  } else {
    list.value = null;
  }
});

const onResetClick = async () => {
  if (confirm('Are you sure you want to reset voting?')) {
    try {
      error.value = null;
      isPending.value = true;
      list.value = await resetVoting(listId.value);
    } catch (err) {
      error.value = err.message;
    } finally {
      isPending.value = false;
    }
  }
}

const onPickWinnerClick = async () => {
  try {
    error.value = null;
    isPending.value = true;
    const { list, movie } = await pickWinner(listId.value);
    list.value = list;
    winner.value = movie;
  } catch (err) {
    error.value = err.message;
  } finally {
    isPending.value = false;
  }
}

const onStartClick = async () => {
  try {
    error.value = null;
    isPending.value = true;
    list.value = await startNextVotingRound(listId.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    isPending.value = false;
  }
}

onMounted(async () => {
  lists.value = await getLists();
  isPending.value = false;
});
</script>

<template>
  <div class="manage-list-view">
    <p>
      <select v-model="listId">
        <option v-for="lst in lists" :key="lst.id" :value="lst.id">{{ lst.name }}</option>
      </select>
    </p>
    <p v-if="error" class="error">{{ error }}</p>
    <template v-if="list">
      <h1>{{ list.name }}</h1>
      <p>
        Voting Round: <strong>{{ list.votingRound }}</strong>
      </p>
      <p>
        Voting Active: <strong>{{ list.votingActive ? 'Active' : 'Inactive' }}</strong> |
        <button v-if="!list.votingActive" @click="onStartClick">Start Voting Round</button>
        <button v-if="list.votingActive" @click="onPickWinnerClick">Pick Winner</button>
      </p>
      <p v-if="winner">
        Last Winner: <strong>{{ winner?.title }}</strong>
      </p>
      <p>
        <button @click="onResetClick">Reset Voting</button>
      </p>
    </template>

    <LoadingSpinner class="loading-spinner" v-if="isPending" />
  </div>
</template>

<style scoped>
.manage-list-view {
  padding: 16px;
}

.error {
  color: red;
}

p {
  margin: .5em 0;
}

.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>