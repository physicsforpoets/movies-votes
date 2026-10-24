import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getList as sbGetList,
  getListMovies as sbGetListMovies,
 } from '../switchboard';

export const useListStore = defineStore('list', () => {
  const list = ref(null);
  const movies = ref([]);

  // In-flight fetches, so concurrent callers (App + views) share one request
  let pendingList = null;
  let pendingMovies = null;

  function getList (id) {
    if (!pendingList) {
      pendingList = sbGetList(id)
        .then(result => { list.value = result; })
        .finally(() => { pendingList = null; });
    }
    return pendingList;
  }

  function getListMovies (id) {
    if (!pendingMovies) {
      pendingMovies = sbGetListMovies(id)
        .then(result => { movies.value = result; })
        .finally(() => { pendingMovies = null; });
    }
    return pendingMovies;
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
    updateVotingRound,
    setVotingActive,
  };
});
