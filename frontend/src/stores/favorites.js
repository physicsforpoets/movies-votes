import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getMyFavorites as sbGetMyFavorites,
  addFavorite as sbAddFavorite,
  removeFavorite as sbRemoveFavorite,
} from '../switchboard';

export const useFavoritesStore = defineStore('favorite', () => {
  const myFavorites = ref([]);

  const myFavoriteIDs = computed(() => {
    return myFavorites.value.map(favorite => favorite.id);
  });

  async function getMyFavorites (listId) {
    const favs = await sbGetMyFavorites(listId);
    myFavorites.value = favs;
  }

  function addFavorite (movie) {
    if (myFavoriteIDs.value.indexOf(movie.id) < 0) {
      myFavorites.value = [movie, ...myFavorites.value];
      // Assume API success
      sbAddFavorite(movie.id);
    } else {
      console.warn('Movie was already in myFavorites');
    }
  }

  function removeFavorite (movieId) {
    if (myFavoriteIDs.value.indexOf(movieId) > -1) {
      myFavorites.value = myFavorites.value.filter(movie => movie.id !== movieId);
      // Assume API success
      sbRemoveFavorite(movieId);
    } else {
      console.warn('Movie was not in myVotes');
    }
  }

  return {
    myFavorites,
    myFavoriteIDs,
    getMyFavorites,
    addFavorite,
    removeFavorite,
  }
});

