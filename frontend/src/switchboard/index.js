// Get API base URL from environment variable, with fallbacks for different environments
const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://movies-votes-production.up.railway.app/api' : 'http://localhost:3000/api');

// TODO: Try/Catch, Error Handling

const getSessionId = () => {
  const deviceId = window.localStorage.getItem('deviceId');
  
  if(!deviceId) {
    const newId = Date.now();
    window.localStorage.setItem('deviceId', newId);
    return newId;
  } 
  
  return deviceId;
}

const fetcher = (url, options = {}) => {
  const deviceId = getSessionId();
  const optionsToSend = {
    ...options,
    credentials: 'include',
    headers: {
      ...options?.headers,
      'X-STAT-deviceId': deviceId,
    },
  };

  return fetch(`${BASE_URL}${url}`, optionsToSend);
};

// Lists

const getList = async (id) => {
  const url = `/lists/${id}`;
  const response = await fetcher(url);
  const list = await response.json();
  return list;
};

const getLists = async () => {
  const url = `/lists`;
  const response = await fetcher(url);
  const lists = await response.json();
  return lists;
};

// Favorites

const getMyFavorites = async (listId) => {
  const url = `/favorites/list/${listId}/mine`;
  const response = await fetcher(url);
  const favs = await response.json();
  return favs;
};

const addFavorite = async (movieId) => {
  const url = '/favorites';
  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movieId }),
  });
  const favorite = await response.json();
  return favorite;
}

const removeFavorite = async (movieId) => {
  const url = `/favorites/movie-id/${movieId}`;
  const response = await fetcher(url, { method: 'DELETE' });
  const result = await response.json();
  return result;
}

// Movie Services

const getServices = async () => {
  const url = `/services`;
  const response = await fetcher(url);
  const services = await response.json();
  return services;
};

// Movie Lookup

const searchMovie = async (query) => {
  const url = `/lookup/search/movie?query=${query}`;
  const response = await fetcher(url);
  const results = await response.json();
  return results;
};

const addMovie = async (movie) => {
  const url = `/movies`;
  const response = await fetcher(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(movie),
  });

  if (response.ok) {
    const result = await response.json();
    return result;
  } else {
    const error = await response.json();
    throw error;
  }
};

// Voting
const getMyVotes = async (listId) => {
  const url = `/votes/list/${listId}/mine`;
  const response = await fetcher(url);
  const votes = await response.json();
  return votes;
};

const addVotes = async (movieIds) => {
  const url = `/votes/round/active`;
  const response = await fetcher(url, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ movieIds }),
  });
  const votes = await response.json();
  return votes;
};

const getResults = async (listId) => {
  const url = `/votes/list/${listId}/results`;
  const response = await fetcher(url);
  const results = await response.json();
  return results;
};

const setWatched = async (movieId, watched = true) => {
  const url = `/movies/${movieId}/watched`;
  const response = await fetcher(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ watched }),
  });
  const movie = await response.json();
  return movie;
};

const lookupMovie = async (movieId) => {
  const url = `/lookup/movie/${movieId}/?append=videos,reviews`;
  const response = await fetcher(url);
  const movie = await response.json();
  return movie;
}

export {
  addMovie,
  addVotes,
  getList,  
  getLists,
  getMyFavorites,
  addFavorite,
  removeFavorite,
  getMyVotes,
  getResults,
  getServices,
  lookupMovie,
  searchMovie,
  setWatched,
}
