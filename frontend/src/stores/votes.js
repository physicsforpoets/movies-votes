import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getMyVotes as sbGetMyVotes, 
  addVote as sbAddVote,
  removeVote as sbRemoveVote,
} from '../switchboard';

export const useVotesStore = defineStore('votes', () => {
  const myVotes = ref([]);

  async function getMyVotes () {
    // TODO: Try/Catch
    const votes = await sbGetMyVotes();
    myVotes.value = votes.votes;
  }

  function addVote (movieId) {
    if (myVotes.value.indexOf(movieId) < 0) {
      myVotes.value = [movieId, ...myVotes.value];
      // Assume API success
      sbAddVote(movieId);
    } else {
      console.warn('Movie was already in myVotes');
    }
  }

  function removeVote (movieId) {
    if (myVotes.value.indexOf(movieId) > -1) {
      myVotes.value = myVotes.value.filter(voteId => voteId !== movieId);
      // Assume API success
      sbRemoveVote(movieId);
    } else {
      console.warn('Movie was not in myVotes');
    }
  }

  return {
    myVotes,
    addVote,
    getMyVotes,
    removeVote,
  };
});
