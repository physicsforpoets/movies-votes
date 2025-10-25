<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useListStore } from '../stores/list';
import { useFavoritesStore } from '../stores/favorites';

import MovieDetail from '../components/MovieDetail.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

import appHeroUrl from '@/assets/img/app-hero.png';
import appTitleUrl from '@/assets/img/app-title.png';

import config from '../config.json';

// Icons
import MovieCard from '../components/MovieCard.vue';
import DownArrow from '../components/icons/DownArrow.vue';
import DateSort from '../components/icons/DateSort.vue';
import TextSort from '../components/icons/TextSort.vue';

defineProps({
  showRankings: { type: Boolean, default: false },
});

const listId = config.listId;

// Page Status
const loading = ref(true);

// Store mapping
const listStore = useListStore();
const { movies } = storeToRefs(listStore);
const { getList } = listStore;

const favoritesStore = useFavoritesStore();
const { getMyFavorites } = favoritesStore;

// Sorting
const sortBy = ref('title'); // title or release date
const sortOrder = ref('asc');

// Detail View
const movieDetail = ref(null);

const setScrollLock = (locked = true) => {
  const $elements = document.querySelectorAll('body');
  if (!$elements || !$elements.length) {
    throw new Error('Window container not found.');
  }

  if (locked) {
    $elements.forEach(($el) => {
      $el.style.setProperty('overflow-y', 'hidden');
    });
  } else {
    $elements.forEach(($el) => {
      $el.style.removeProperty('overflow-y');
    });
  }
}

const onMovieDetailClick = (movie) => {
  setScrollLock(true);
  movieDetail.value = movie;
};

const oonMovieDetailClose = () => {
  movieDetail.value = null;
  setScrollLock(false);
};

/**
 * Handles sort control clicks
 * @param {String} field 
 */
const setSortBy = (field) => {
  if (field === sortBy.value) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field === 'title' ? 'title' : 'date';
    sortOrder.value = 'asc';
  }
}

/**
 * Dynamic Sorted Movie List
 */
const sortedMovies = computed(() => {
  return [...movies.value].sort((a, b) => {
    const reverseOrder = sortOrder.value === 'asc' ? 1 : -1;
    if (sortBy.value === 'title') {
      return a.sortTitle.localeCompare(b.sortTitle) * reverseOrder;
    } else {
      // Default to Release Date
      return (Date.parse(a.releaseDate) - Date.parse(b.releaseDate)) * reverseOrder;
    }
  });
});

onMounted(async () => {
  loading.value = true;
  await getList(listId);
  await getMyFavorites(listId);

  // setTimeout(() => {
  //   console.log('opening movie');
  //   onMovieDetailClick(movies.value[0]);
  // }, 5000);

  loading.value = false;
});
</script>

<template>
  <article class="grid-view">
    <img :src="appHeroUrl" alt="" class="hero-bg" />
    <div class="app-hero">
      <img :src="appTitleUrl" alt="" />
    </div>
    <LoadingSpinner v-if="loading" class="loading-spinner" />
    <template v-else>
      <div class="grid-wrapper">
        <div class="grid-header">
          <div class="grid-controls">
            <div class="label">Sort By</div>
            <button @click="setSortBy('title')" :class="{ active: sortBy === 'title' }">
              <TextSort class="sort-icon" />
              <template v-if="sortBy === 'title'">
                <DownArrow class="carat" :class="{ desc: sortOrder === 'desc', asc: sortOrder === 'asc'  }" />
              </template>
            </button>
            <button @click="setSortBy('date')" :class="{ active: sortBy === 'date' }">
              <DateSort class="sort-icon" />
              <template v-if="sortBy === 'date'">
                <DownArrow class="carat" :class="{ desc: sortOrder === 'desc', asc: sortOrder === 'asc'  }" />
              </template>
            </button>
          </div>
        </div>

        <ul class="movies-grid">
          <li v-for="movie in sortedMovies" :key="movie.id">
            <MovieCard :movie="movie" @detail-click="onMovieDetailClick(movie)"
              :class="{ watched: !!movie.roundWatched }" />
          </li>
        </ul>
      </div>

      <Transition name="movie-detail">
        <MovieDetail v-if="movieDetail" :movie="movieDetail" @close="oonMovieDetailClose" />
      </Transition>
    </template>
  </article>
</template>

<style scoped>
.grid-view {
  padding-bottom: 80px;
  position: relative;
}

.grid-wrapper {
  padding: 0 16px;
  position: relative;
}

ul.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  grid-gap: 1.25rem 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

ul.movies-grid>li {
  margin: 0;
  padding: 0;
}

/* TODO: Move watched styles into MovieCard, use prop or movie.watched */

.movie-card {
  transition: opacity 300ms;
}

.movie-card.watched {
  opacity: 0.35;
}

.grid-header {
  display: flex;
  justify-content: flex-end;
}

.grid-controls {
  align-items: center;
  display: flex;
  gap: 8px;
  padding-bottom: 16px;
}

.grid-controls .label {
  color: white;
  font-size: 16px;
  font-weight: var(--mv-fw-semibold);
  text-transform: uppercase;
}

.grid-controls button {
  appearance: none;
  align-items: center;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 3px;
  display: flex;
  padding: 2px;
}

.grid-controls button.active {
  border-bottom: 2px solid white;
}

.grid-controls .sort-icon {
  height: 24px;
  width: 24px;
}

.grid-controls .carat {
  height: 10px;
  width: 10px;
}

.grid-controls .carat.asc {
  transform: scaleY(-1);
}

.hero-bg {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.app-hero {
  display: flex;
  height: 130vw;
  align-items: flex-end;
  padding-bottom: 24px;
  position: relative;
}

.app-hero img {
  display: block;
  margin: 0 auto;
  max-width: 380px;
  width: 80%;
}

.loading-spinner {
  left: 50%;
  opacity: 0.75;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);
}

.movie-detail-enter-active,
.movie-detail-leave-active {
  transition: opacity 150ms;
}

.movie-detail-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>