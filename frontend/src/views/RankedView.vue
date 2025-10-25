<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useListStore } from '../stores/list';

import appHeroUrl from '@/assets/img/app-hero.png';
import appTitleUrl from '@/assets/img/app-title.png';

import config from '../config.json';
const listId = config.listId;

// Page Status
const loading = ref(true);
const isReady = ref(false);

// Store mapping
const listStore = useListStore();
const { movies } = storeToRefs(listStore);
const { getList } = listStore;

onMounted(async () => {
  loading.value = true;
  await getList(listId);
  loading.value = false;
  isReady.value = true;
});

const rankedMovies = computed(() => {
  const ranked = movies.value.filter(movie => !movie.watched).filter(movie => movie._count?.votes > 0);
  return ranked.sort((a, b) => {
    return b._count.votes - a._count.votes;
  });
});

const watchedMovies = computed(() => {
  return movies.value.filter(movie => movie.watched);
});
</script>

<template>
  <div class="ranked-view">
    <img :src="appHeroUrl" alt="" class="hero-bg" />
    <div class="view-header">
      <img :src="appTitleUrl" alt="" />
    </div>

    <!-- Ranked by Votes -->
    <section>
      <h3>Standings</h3>
      <p v-if="!rankedMovies.length" class="empty">
        No movies have been voted for.
      </p>
      <table v-else class="ranking-table">
        <thead>
          <th>Movie</th>
          <th class="count">Votes</th>
        </thead>
        <tbody>
          <tr v-for="movie in rankedMovies" :key="movie.id">
            <td>{{ movie.title }}</td>
            <td class="count">{{ movie._count.votes }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Watched -->
    <section>
      <h3>Watched Movies</h3>
      <p v-if="!watchedMovies.length" class="empty">
        No movies have been watched.
      </p>
      <table v-else class="ranking-table">
        <thead>
          <th>Movie</th>
        </thead>
        <tbody>
          <tr v-for="movie in watchedMovies" :key="movie.id">
            <td>{{ movie.title }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <!-- No Votes -->
  </div>
</template>

<style scoped>
.ranked-view {
  padding: 0 16px 80px;
  position: relative;
}

.hero-bg {
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

section {
  padding: 16px 0;
}

section h3 {
  font-size: 24px;
  font-weight: var(--mv-fw-semibold);
  margin-bottom: 8px;
}

table {
  border-spacing: 0;
  font-size: 14px;
  margin: 0;
  padding: 0;
  width: 100%;
}

table,
table th,
table td {
  margin: 0;
  text-align: left;
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

.view-header {
  padding: 24px 0 16px;
}

.view-header img {
  display: block;
  margin: 0 auto;
  max-width: 380px;
  width: 60%;
}
</style>