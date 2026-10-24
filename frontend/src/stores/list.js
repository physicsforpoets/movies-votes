import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getList as sbGetList,
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
