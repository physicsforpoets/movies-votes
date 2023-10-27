import { ref } from 'vue';
import { defineStore } from 'pinia';
import { 
  getList as sbGetList,
  setWatched as sbSetWatched,
 } from '../switchboard';

export const useListStore = defineStore('list', () => {
const name = ref('');
  const movies = ref([]);

  async function getList (id) {
    // TODO: Try/Catch
    // TODO: Cache data for the session
    const list = await sbGetList(id);
    name.value = list.name;
    movies.value = list.movies;
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

  return {
    name,
    movies,
    getList,
    setWatched,
  };
});
