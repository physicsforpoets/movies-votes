<script setup>
// TODO: Break form into its own component
// TODO: Break search into its own component

import { computed, onMounted, ref } from 'vue';
import { addMovie, getLists, getServices, searchMovie } from '../switchboard';
import MoviesHeader from './../components/MoviesHeader.vue';

const RATINGS = {
  NR: 'Not Rated',
  G: 'G',
  PG: 'PG',
  PG13: 'PG-13',
  R: 'R',
  NC17: 'NC-17'
};

// Page Status
const isReady = ref(false);

// Form Data
const title = ref('');
const tmdbId = ref(null);
const posterUrl = ref('');
const securePosterUrl = ref('');
const trailerUrl = ref('');
const rating = ref('NR');
const scary = ref(false);
const releaseDate = ref('');
const description = ref('');
const services = ref([]);
const listId = ref('');

// Data dependencies
const servicesList = ref([]);
const listsList = ref([]);

// Search, TMDB
const searchLoading = ref(false);
const searchResults = ref([]);

// API payload
const payload = computed(() => ({
  title: title.value,
  tmdbId: tmdbId.value,
  posterUrl: posterUrl.value,
  securePosterUrl: securePosterUrl.value,
  rating: rating.value,
  scary: scary.value,
  releaseDate: releaseDate.value,
  description: description.value,
  services: services.value,
  listId: listId.value,
}));

onMounted(async () => {
  // TODO: try/catch
  listsList.value = await getLists();
  servicesList.value = await getServices();
  isReady.value = true;
});

const onSearchClick = async () => {
  // TODO: try/catch
  searchLoading.value = true;
  searchResults.value = await searchMovie(title.value);
  searchLoading.value = false;
};

const onResultClick = async (result) => {
  title.value = result.title;
  tmdbId.value = result.id;
  posterUrl.value = result.poster_url;
  securePosterUrl.value = result.secure_poster_url;
  releaseDate.value = result.release_date;
  description.value = result.overview;
  searchResults.value = [];
};

/**
 * Handles Form Submit
 */
const onSubmit = async () => {
  try {
    await addMovie(payload.value);

    // Reset form data on success...
    title.value = '';
    tmdbId.value = null;
    posterUrl.value = '';
    securePosterUrl.value = '';
    rating.value = 'NR';
    scary.value = false;
    releaseDate.value = '';
    description.value = '';
    services.value = [];
    listId.value = '';
  } catch (error) {
    console.error('Error posting movie', error);
  }
};
</script>

<template>
  <div class="movie-add-view">
    <MoviesHeader />
    <div v-if="!isReady">Loading...</div>
    <form v-else @submit.prevent="onSubmit" novalidate>
      <fieldset>
        <legend>Add a Movie</legend>
        <p>
          <label for="title">Title: <span aria-label="required">*</span></label>
          <input id="title" type="text" name="title" v-model="title" required> 
          <button type="button" @click="onSearchClick">SEARCH</button>
        </p>
        <p>
          <label for="tmdbId">TMDB ID:</label>
          <input id="tmdbId" type="text" name="tmdbId" v-model="tmdbId">
        </p>
        <p v-if="searchLoading">Searching...</p>
        <template v-else-if="searchResults">
          <ul>
            <li v-for="result in searchResults.results" :key="`result-${result.id}`">
              {{ result.title }} - {{ result.release_date }} 
              <button type="button" @click="onResultClick(result)">This One</button>
            </li>
          </ul>
          <p></p>
        </template>
        <p>
          <label for="posterUrl">Poster URL:</label>
          <input id="posterUrl" type="text" name="posterUrl" v-model="posterUrl">
        </p>
        <p>
          <label for="securePosterUrl">Secure Poster URL:</label>
          <input id="securePosterUrl" type="text" name="securePosterUrl" v-model="securePosterUrl">
        </p>        
        <p>
          <label for="trailerUrl">Trailer URL:</label>
          <input id="trailerUrl" type="text" name="trailerUrl" v-model="trailerUrl">
        </p>
        <p>
          <label for="rating">Rating: <span aria-label="required">*</span></label>
          <select name="rating" id="rating" v-model="rating">
            <option v-for="(label, value) in RATINGS" :value="value" :key="value">{{ label }}</option>
          </select>
        </p>
        <p>
          <label for="scary">
            <input type="checkbox" v-model="scary" id="scary" name="scary"> Scary
          </label>
        </p>
        <p>
          <label for="releaseDate">Release Date: <span aria-label="required">*</span></label>
          <input id="releaseDate" type="date" name="releaseDate" v-model="releaseDate" required>
        </p>
        <p>
          <label for="description">Description: <span aria-label="required">*</span></label>
          <textarea id="description" name="description" v-model="description" required></textarea>
        </p>
        <p>
          <label>Services:</label>
          <ul>
            <li v-for="service in servicesList" :key="service.id">
              <label :for="`service-${service.id}`">
                <input type="checkbox" :id="`service-${service.id}`" :name="`service-${service.id}`" :value="service.id" v-model="services"> 
                {{ service.name }}
              </label>
            </li>
          </ul>
        </p>
        <p>
          <label for="listId">Add to List:</label>
          <select name="listId" id="listId" v-model="listId">
            <option v-for="list in listsList" :key="list.id" :value="list.id">{{ list.name }}</option>
          </select>
        </p>
        <p>
          <button type="submit">Add Movie</button>
        </p>
      </fieldset>
    </form>
  </div>
</template>

<style scoped>
</style>