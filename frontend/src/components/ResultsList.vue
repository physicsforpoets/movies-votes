<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVotesStore } from '../stores/votes';
import { useListStore } from '../stores/list';

import LoadingSpinner from '../components/LoadingSpinner.vue';
import MovieCard from '../components/MovieCard.vue';

import config from '../config.json';
const listId = config.listId;

// Store mapping
const votesStore = useVotesStore();
const { getResults } = votesStore;
const { results, myVotes } = storeToRefs(votesStore);

// getList is called by parent
const listStore = useListStore();
const { list } = storeToRefs(listStore);

// Component State
const loading = ref(true);

const myVotesForRound = computed(() => {
  return (round) => myVotes.value.filter(vote => vote.round === round);
});

onMounted(async () => {
  loading.value = true;
  await getResults(listId);
  loading.value = false;
});
</script>

<template>
  <section class="results-list">
    <LoadingSpinner v-if="loading" class="loading-spinner" />
    <template v-else>
      <div v-for="resultsRound in results" :key="`round-${resultsRound.round}`" class="results-round">
        <MovieCard v-if="resultsRound.watchedMovie" class="watched-movie" :movie="resultsRound.watchedMovie"
          hide-details />
        <h3>Round {{ resultsRound.round }}</h3>
        <span class="voting-active" v-if="resultsRound.round === list.votingRound && list.votingActive">
          Still Voting
        </span>
        <table v-if="resultsRound.votes.length">
          <tr v-for="voteRow in resultsRound.votes" :key="`round-${resultsRound.round}-${voteRow.movie.id}`" :class="{
              watched: resultsRound.watchedMovie && resultsRound.watchedMovie.id === voteRow.movie.id
            }">
            <td>{{ voteRow.movie.title }}</td>
            <td class="count">{{ voteRow.votes }}</td>
          </tr>
        </table>
        <div class="my-votes">
          <h4>My Votes</h4>
          <ul v-if="myVotesForRound(resultsRound.round)" class="movies-grid">
            <li v-for="vote in myVotesForRound(resultsRound.round)"
              :key="`round-${resultsRound.round}-my-${vote.movie.id}`">
              <MovieCard :movie="vote.movie" hide-details />
            </li>
          </ul>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}

.results-list {
  padding: 0 16px 90px;
}

.results-round {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
  padding-bottom: 24px;
  position: relative;
}

h3 {
  font-size: 2em;
}

.voting-active {
  background: white;
  border-radius: 3px;
  color: black;
  font-size: 0.75em;
  font-weight: bold;
  padding: 3px;
  position: absolute;
  right: 0;
  text-transform: uppercase;
  top: 8px;
}

table,
table th,
table td {
  margin: 0;
  text-align: left;
}

table {
  border-spacing: 0;
  clear: both;
  font-size: 14px;
  margin: 8px 0 0;
  padding: 0;
  width: 100%;
}

table th {
  font-weight: var(--mv-fw-semibold);
  border-bottom: 2px solid var(--mv-text-light);
  padding: 0 6px 4px 0;
}

table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 6px 6px 0;
}

table th.count,
table td.count {
  text-align: center;
  width: 15%;
}

table tr.watched td {
  color: red;
  font-weight: bold;
}

.my-votes {
  margin-top: 16px;
}

.my-votes h4 {
  text-transform: uppercase;
}

.my-votes ul.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 0.15fr));
  grid-gap: 1.25rem 1rem;
  list-style: none;
  margin: 8px 0;
  padding: 0;
}

.my-votes ul.movies-grid>li {
  margin: 0;
  padding: 0;
}

.watched-movie {
  float: right;
  margin: 4px auto 16px;
  width: 33%;
}

.watched-movie :deep(.poster-img),
.my-votes :deep(.poster-img) {
  border-radius: 3px;
}
</style>
