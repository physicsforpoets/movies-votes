import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getList as sbGetList,
  setWatched as sbSetWatched,
  getListMovies as sbGetListMovies,
 } from '../switchboard';

export const useListStore = defineStore('list', () => {
  const list = ref(null);
  const movies = ref([]);

  async function getList (id) {
    list.value = await sbGetList(id);
  }

  async function getListMovies (id) {
    movies.value = await sbGetListMovies(id);
  }

  function setWatched (movieId, watched = true) {
   let targetMovie = movies.value.find(movie => movie.id === movieId);
   if (targetMovie) {
    // Assume API success
    targetMovie.watched = watched;
    const updatedMovies = [
      ...movies.value.filter(movie => movie.id !== targetMovie.id),
      targetMovie,
    ];
    movies.value = updatedMovies;
    sbSetWatched(movieId, watched);
   } else {
    console.warn('Movie not found in store.');
   }  
  }

  function updateVotingRound(round) {
    if (list.value) {
      list.value.votingRound = round;
    }
  }

  function setVotingActive(active) {
    if (list.value) {
      list.value.votingActive = active;
    }
  }

  return {
    list,
    movies,
    getList,
    getListMovies,
    setWatched,
    updateVotingRound,
    setVotingActive,
  };
});
