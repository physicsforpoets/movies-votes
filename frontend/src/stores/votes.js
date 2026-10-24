import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getMyVotes as sbGetMyVotes, 
  addVotes as sbAddVotes,
  getResults as sbGetResults,
} from '../switchboard';

export const useVotesStore = defineStore('votes', () => {
  const myVotes = ref([]);
  const results = ref([]);

  const myVotesForRound = computed(() => {
    // return (round) => myVotes.value.filter(vote => vote.round === round);
    return (round) => myVotes.value.filter(vote => vote.round === round);
  });

  async function getMyVotes (listId) {
    // TODO: Try/Catch
    const votes = await sbGetMyVotes(listId);
    myVotes.value = votes;
  }

  async function addVotes (movieIds) {
    const votes = await sbAddVotes(movieIds);
    const isNewVote = (vote) => !votes.some(v => v.movieId === vote.movieId && v.round === vote.round);
    myVotes.value = [...votes, ...myVotes.value.filter(isNewVote)];
  }

  async function getResults (listId) {
    const response = await sbGetResults(listId);
    results.value = response;
  }

  return {
    myVotes,
    myVotesForRound,
    results,
    addVotes,
    getMyVotes,
    getResults,
  };
});
