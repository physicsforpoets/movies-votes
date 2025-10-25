<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useFavoritesStore } from '../stores/favorites';
import { useListStore } from '../stores/list';
import { useVotesStore } from '../stores/votes';

import config from '../config.json';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import MovieCard from '../components/MovieCard.vue';

// Store mapping
const favoritesStore = useFavoritesStore();
const { getMyFavorites } = favoritesStore;
const { myFavorites } = storeToRefs(favoritesStore);

// Assume 'list' fetched by parent/app
const listStore = useListStore();
const { votingRound } = storeToRefs(listStore);

const votesStore = useVotesStore();
const { addVotes } = votesStore;

// Component state
const maxVotes = config.maxVotesPerRound;
const selectedMovies = ref([]);
const loading = ref(true);
const hasFavorites = computed(() => myFavorites.value.length > 0);

const isMovieSelected = computed(() => {
  return (movieId) => selectedMovies.value.find(movie => movie.id === movieId);
});

const hasSelectedMovies = computed(() => {
  return selectedMovies.value.length > 0;
});

const unwatchedFavorites = computed(() => {
  return myFavorites.value.filter(movie => !movie.roundWatched);
});

// Event handlers
function onMovieClick(movie) {
  if (selectedMovies.value.find(movieCheck => movieCheck.id === movie.id)) {
    selectedMovies.value = selectedMovies.value.filter(movieCheck => movieCheck.id !== movie.id);
  } else {
    selectedMovies.value = [movie, ...selectedMovies.value];
  }
}

function onSubmit() {
  loading.value = true;
  addVotes(selectedMovies.value.map(movie => {
    return {
      round: votingRound.value,
      movieId: movie.id,
      movie,
    };
  }));
  loading.value = false;
}

onMounted(async () => {
  loading.value = true;
  await getMyFavorites(config.listId);
  loading.value = false;
});
</script>

<template>
  <div class="vote-form">
    <LoadingSpinner v-if="loading" class="loading-spinner" />
    <template v-else>
      <h2 class="no-fav-text" v-if="!hasFavorites">
        Select some favorites from the <RouterLink class="link" :to="{ name: 'list' }">Movies List</RouterLink> vote.
      </h2>
      <div class="grid-wrapper" v-else>
        <h2>Select up to {{ maxVotes }} movies and vote below:</h2>
        <ul class="movies-grid">
          <li v-for="movie in unwatchedFavorites" :key="movie.id">
            <MovieCard :movie="movie" @detail-click="onMovieClick(movie)" hide-details
              :class="{ selected: isMovieSelected(movie.id)} " />
          </li>
        </ul>
        <button class="btn-submit" :disabled="!hasSelectedMovies" @click="onSubmit">
          Submit {{ selectedMovies.length }}/{{ maxVotes }} Votes for Round {{ votingRound }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
section {
  padding: 16px 0;
}

h2 {
  margin-bottom: 16px;
  text-align: center;
}

.grid-wrapper {
  padding: 0 24px;
  position: relative;
}

.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}

ul.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 0.33fr));
  grid-gap: 1.25rem 1rem;
  list-style: none;
  margin: 0;
  padding: 0 0 200px;
}

ul.movies-grid>li {
  margin: 0;
  padding: 0;
}

.movie-card :deep(.poster-img) {
  border-radius: 5px;
}

.movie-card.selected :deep(.poster-img) {
  border: 2px solid green;
  border-radius: 5px;
}

.btn-submit {
  appearance: none;
  border: none;
  border-radius: 16px;
  bottom: 96px;
  box-shadow: none;
  font-size: 1.5em;
  font-weight: bold;
  margin: 0 24px;
  left: 0;
  padding: 16px;
  position: fixed;
  width: calc(100% - 48px);
}

.btn-submit:not(:disabled) {
  background-color: red;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  color: white;
}
</style>