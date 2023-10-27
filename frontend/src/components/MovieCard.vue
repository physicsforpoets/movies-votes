<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useVotesStore } from '../stores/votes';
import { useListStore } from '../stores/list';

import HeartOff from '../components/icons/HeartOff.vue';
import HeartOn from '../components/icons/HeartOn.vue';
import SkullBanner from '../components/icons/SkullBanner.vue';

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

const emit = defineEmits(['detailClick']);

// Assume 'getMyVotes' called by parent/app
const votesStore = useVotesStore();
const { myVotes } = storeToRefs(votesStore);
const { addVote, removeVote } = votesStore;

const listStore = useListStore();
const { setWatched } = listStore;

const hasVote = computed(() => {
  return myVotes.value.indexOf(props.movie.id) > -1;
});

const releaseYear = computed(() => {
  const d = new Date(props.movie.releaseDate);
  return d.getFullYear();
});

const onVoteClick = () => {
  if (props.movie.watched) {
    return;
  }

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
</script>

<template>
  <div class="movie-card">
    <div class="poster-wrapper" @click="emit('detailClick')">
      <img 
        v-if="movie.securePosterUrl"
        class="poster-img"
        :src="movie.securePosterUrl"
        alt=""
      />
      <div v-else class="poster-text">{{ movie.name }}</div>
      <SkullBanner v-if="movie.scary" class="scary-skull" />
    </div>
    <div class="details">
      <div class="meta">
        <span class="release-year">{{ releaseYear }}</span>
        <span class="rating">{{ RATINGS[movie.rating] }}</span>
      </div>
      <div class="actions">
        <button v-if="hasVote" @click="onVoteClick"><HeartOn /></button>
        <button v-else @click="onVoteClick"><HeartOff /></button>
      </div>
    </div>
    <div class="watched-wrapper" v-if="false">
      <button v-if="movie.watched" @click="onWatchedClick">MARK UNWATCHED</button>
      <button v-else @click="onWatchedClick">MARK WATCHED</button>
    </div>
  </div>
</template>

<style scoped>
  .movie-card {
    position: relative;  
  }

  .poster-wrapper {
    aspect-ratio: 2 / 3;
    background: #333;
    border-radius: 3px;
    box-shadow: 0 0 12px rgba(0,0,0,1);
    position: relative;
    width: 100%;
  }

  .poster-img {
    border-radius: 5px 5px 0 0;
    display: block;
    height: 100%;
    margin: 0;
    object-fit: cover;
    object-position: center center;
    width: 100%;
  }

  .poster-wrapper::after {
    border-radius: 3px;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .scary-skull {
    height: 40px;
    position: absolute;
    right: 2px;
    top: 0;
    width: 40px;
  }

  .details {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 6px 2px;
    position: relative;
  }

  .meta {
    font-family: var(--mv-ff-serif);
    font-size: 15px;
    line-height: 1;
  }
  .rating {
    border: 1px solid rgba(255, 255, 255, 0.75);
    border-radius: 2px;
    display: inline-block;
    font-size: 11px;
    font-weight: var(--mv-fw-bold);
    margin-left: 4px;
    line-height: 1;
    padding: 1px 2px;
    transform: translateY(-1px);
  }

  .actions button {
    appearance: none;
    background: none;
    border: none;
    border-radius: 0;
  }

  .actions button svg {
    display: inline-block;
    height: 24px;
    width: 24px;
  }
</style>