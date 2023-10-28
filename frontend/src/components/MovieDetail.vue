<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useVotesStore } from '../stores/votes';
import { useListStore } from '../stores/list';
import { lookupMovie } from '../switchboard';

import LoadingSpinner from './LoadingSpinner.vue';
import HeartOff from '../components/icons/HeartOff.vue';
import HeartOn from '../components/icons/HeartOn.vue';
import EyeOff from '../components/icons/EyeOff.vue';
import EyeOn from '../components/icons/EyeOn.vue';
import ScarySkull from '../components/icons/ScarySkull.vue';
import CloseIcon from './icons/CloseIcon.vue';

const RATINGS = {
  NR: 'NR',
  G: 'G',
  PG: 'PG',
  PG13: 'PG-13',
  R: 'R',
  NC17: 'NC-17',
};

const props = defineProps({
  movie: { type: Object, required: true },
});
const emit = defineEmits(['close']);
const container = ref(null);
const scrollPosition = ref(null);

// Store bindings

// Assume 'getMyVotes' called by parent/app
const votesStore = useVotesStore();
const { myVotes } = storeToRefs(votesStore);
const { addVote, removeVote } = votesStore;

const listStore = useListStore();
const { setWatched } = listStore;

// Data
const isReady = ref(false);
const lookupData = ref(null);

// Computeds

const formattedReleaseDate = computed(() => {
  if (!props.movie.releaseDate) {
    return '';
  }

  const d = new Date(props.movie.releaseDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
});

const formattedRuntime = computed(() => {
  if (!lookupData.value.runtime) {
    return '';
  }
  
  const totalMins = lookupData.value.runtime;
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return `${hours} hr ${minutes} min`;
});

const hasVote = computed(() => {
  return myVotes.value.indexOf(props.movie.id) > -1;
});

const trailers = computed(() => {
  return lookupData.value.videos?.results .filter(video => video.site === 'YouTube' && video.type === 'Trailer') || null;
});

const reviews = computed(() => {
  const maxChars = 300;
  const maxReviews = 3;
  // TODO: Pull random
  return lookupData.value.reviews?.results.slice(0, maxReviews).map(review => ({
    id: review.id,
    url: review.url,
    author: review.author,
    content: review.content.length > maxChars ? `${review.content.slice(0, maxChars)}...` : review.content,
  })) || null;
});

// Methods

const onVoteClick = () => {
  if (hasVote.value) {
    removeVote(props.movie.id);
  } else {
    addVote(props.movie.id);
  }
};

const onWatchedClick = () => {
  let watched = true;
  if (props.movie.watched) {
    watched = false;
  }
  setWatched(props.movie.id, watched);
}

// Lifecycle

onMounted(async () => {
  // Lock scrolling
  const $body = document.querySelector('body');
  scrollPosition.value = window.pageYOffset;
  $body.style.overflow = 'hidden';
  $body.style.position = 'fixed';
  $body.style.top = `-${scrollPosition.value}px`;
  $body.style.width = '100%';
  
  // Does not work on iOS
  // document.body.style.overflowY = 'hidden';
  // document.documentElement.style.overflowY = 'hidden';

  // Get TMDB data
  lookupData.value = await lookupMovie(props.movie.tmdbId);
  isReady.value = true;
});

onBeforeUnmount(() => {
  const $body = document.querySelector('body');
  $body.style.removeProperty('overflow');
  $body.style.removeProperty('position');
  $body.style.removeProperty('top');
  $body.style.removeProperty('width');
  window.scrollTo(0, scrollPosition.value);

  // Does not work on iOS
  // document.body.style.overflowY = 'auto';
  // document.documentElement.style.overflowY = 'auto';
});
</script>

<template>
  <div class="movie-detail">
    <div class="protection" ref="container"></div>
    <LoadingSpinner v-if="!isReady" class="loading-spinner" />
    <div v-else class="modal">
      <div class="hero">
        <img class="backdrop" :src="lookupData.secureBackdropUrl" alt="" />
        <div class="details-container">
          <div class="details">
            <h2 class="title">
              {{ movie.title }}
              <ScarySkull v-if="movie.scary" class="scary-skull" />
            </h2>
            <ul class="meta">
              <li>{{ formattedReleaseDate }}</li>
              <li><span class="rating">{{ RATINGS[movie.rating] }}</span></li>
              <li>{{ formattedRuntime }}</li>
            </ul>
          </div>
        </div>
        <button class="btn-close" @click="emit('close')"><CloseIcon /></button>
        <ul class="actions">
          <li class="vote">
            <button v-if="hasVote" @click="onVoteClick"><HeartOn /></button>
            <button v-else @click="onVoteClick"><HeartOff /></button>
          </li>
        </ul>
      </div>
      <section class="description">
        <p>{{ movie.description }}</p>
        <div class="watch">
          <div class="services">
            Available On:
            <ul class="service-list">
              <li v-for="service in movie.services" :key="service.id">
                <img :src="`/img/services/${service.logoUrl}`" alt="" />
              </li>
            </ul>
          </div>
          <button v-if="movie.watched" class="mark-watched" @click="onWatchedClick"><EyeOn /> Mark Unwatched</button>
          <button v-else class="mark-watched" @click="onWatchedClick"><EyeOff /> Mark Watched</button>
        </div>
      </section>
      <section v-if="trailers && trailers.length" class="trailers">
        <h3>Trailers</h3>
        <iframe 
          v-for="trailer in trailers"
          :key="trailer.key"
          :src="`https://www.youtube.com/embed/${trailer.key}`"
        ></iframe>
      </section>
      <section v-if="reviews && reviews.length" class="reviews">
        <h3>Reviews</h3>
        <ul class="review-list">
          <li v-for="review in reviews" :key="`review-${review.id}`">
            <a :href="review.url" target="_blank" ref="noreferrer noopener">
              <p class="content">&ldquo;{{ review.content }}&rdquo;</p>
              <div class="author">{{ review.author }}</div>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
  .movie-detail,
  .protection {
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
  }

  .movie-detail {
    overflow-x: hidden;
    overflow-y: auto;
    padding: 16px 16px 80px;
  }

  .protection {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.5);
  }

  .loading-spinner {
    left: 50%;
    opacity: 0.75;
    position: fixed;
    top: 50%;
    transform: translate(-50%,-50%);
  }

  .modal {
    background: #191919;
    border-radius: 10px;
    padding: 0 0 8px;
    position: relative;
  }

  .hero,
  img.backdrop {
    aspect-ratio: 1280 / 720;
    border-radius: 10px 10px 0 0;
    margin: 0;
    display: block;
  }

  .hero {
    background: #333;
    position: relative;
  }

  img.backdrop {
    left: 0;
    object-fit: contain;
    object-position: center center;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .btn-close {
    appearance: none;
    background: none;
    border: none;
    border-radius: 0;
    display: block;
    height: 28px;
    left: 12px;
    padding: 0;
    position: absolute;
    top: 12px;
    width: 28px;
  }

  .btn-close svg {
    display: block;
    height: 100%;
    width: 100%;
  }

  .details-container {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    width: 100%;
  }

  .details {
    background: linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,0) 100%);
    color: white;
    padding: 14px 14px 0;
    text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.4);
  }

  .title {
    font-size: 28px;
    font-weight: var(--mv-fw-semibold);
    line-height: 1.1;
  }

  .title .scary-skull {
    height: 24px;
    width: 24px;
    transform: translateY(-3px);
  }

  .meta {
    color: white;
    display: flex;
    font-family: var(--mv-ff-serif);
    font-size: 15px;
    gap: 8px;
    line-height: 1;
    list-style: none;
    margin: 4px 0 0;
    padding: 0;
  }

  .meta > li {
    margin: 0;
    padding: 0;
  }

  .rating {
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 2px;
    display: inline-block;
    font-size: 11px;
    font-weight: var(--mv-fw-bold);
    line-height: 1;
    padding: 1px 2px;
    transform: translateY(-1px);
  }

  section {
    padding: 8px 14px;
  }

  section.description {
    background: #282828;
    padding-top: 0;
    font-size: 12px;
    text-wrap: balance;
  }

  section.description p {
    padding-top: 12px;
  }

  .actions {
    align-items: center;
    background: rgb(0, 0, 0, 0.75);
    border-radius: 5px;
    display: flex;
    gap: 8px;
    list-style: none;
    padding: 4px 8px;
    position: absolute;
    right: 12px;
    top: 12px;
  }

  .actions > li {
    margin: 0;
    padding: 0;
  }

  .actions button {
    appearance: none;
    background: none;
    border: none;
    border-radius: 0;
    padding: 0;
  }

  .actions svg {
    height: 28px;
    width: 28px;
  }

  .actions .vote svg {
    height: 22px;
    width: 22px;
  }

  button.mark-watched {
    align-items: center;
    appearance: none;
    background: none;
    border: none;
    border-radius: 0;
    color: inherit;
    display: flex;
    font-family: var(--mv-ff-sans-serif);
    font-size: inherit;
    font-weight: var(--mv-fw-semibold);
    gap: 8px;
    line-height: 1;
    padding: 0;
  }

  button.mark-watched svg {
    height: 16px;
    width: 16px;
  }

  .watch {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-bottom: 8px;
  }

  .service-list {
    display: flex;
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 2px 0 0;
  }

  .service-list > li {
    margin: 0;
    padding: 0;
  }

  .service-list img {
    display: block;
    height: 24px;
    margin: 0;
    width: 24px;
  }

  section h3 {
    font-size: 24px;
    font-weight: var(--mv-fw-semibold);
    margin-bottom: 8px;
  }

  section.trailers {
    background: #191919;
  }

  section.trailers iframe {
    aspect-ratio: 16 / 9;
    border: 0;
    margin-bottom: 16px;
    width: 100%;
  }

  .review-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .review-list > li {
    margin: 0 0 16px;
    padding: 0;
  }

  .review-list a {
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5px;
    color: var(--mv-grey-medium);
    display: block;
    font-size: 12px;
    padding: 14px 16px;
    text-decoration: none;
  }

  .review-list a p {
    font-family: var(--mv-ff-serif);
    font-weight: var(--mv-fw-regular);
    font-style: italic;
  }

  .review-list .author {
    font-weight: var(--mv-fw-semibold);
    margin-top: 8px;
  }
</style>