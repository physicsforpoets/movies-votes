// TODO: Get this entire URL from an environment var?
const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://movies-votes-production.up.railway.app/api' : 'http://localhost:3000/api';

// TODO: Try/Catch, Error Handling

const defaultOptions = {
  credentials: 'include',
};

const getList = async (id) => {
  const url = `${BASE_URL}/lists/${id}`;
  const response = await fetch(url, defaultOptions);
  const list = await response.json();
  return list;
};

const getLists = async () => {
  const url = `${BASE_URL}/lists`;
  const response = await fetch(url, defaultOptions);
  const lists = await response.json();
  return lists;
};

const getServices = async () => {
  const url = `${BASE_URL}/services`;
  const response = await fetch(url, defaultOptions);
  const services = await response.json();
  return services;
};

const getSessionId = () => {
  const deviceId = window.localStorage.getItem('deviceId');
  
  if(!deviceId) {
    const newId = Date.now();
    window.localStorage.setItem('deviceId', newId);
    return newId;
  } 
  
  return deviceId;
}

const searchMovie = async (query) => {
  const url = `${BASE_URL}/lookup/search/movie?query=${query}`;
  const response = await fetch(url, defaultOptions);
  const results = await response.json();
  return results;
};

const addMovie = async (movie) => {
  const url = `${BASE_URL}/movies`;
  const response = await fetch(url, {
    ...defaultOptions,
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

const getMyVotes = async () => {
  const url = `${BASE_URL}/votes/mine`;
  const deviceId = getSessionId();
  const response = await fetch(url, { ...defaultOptions, headers: {
    'X-STAT-deviceId': deviceId
  }});
  const votes = await response.json();
  return votes;
};

const addVote = async (movieId) => {
  // NOTE:
  // Should this be POST /votes with { movieId } payload?
  const deviceId = getSessionId();
  const url = `${BASE_URL}/votes/${movieId}`;
  const response = await fetch(url, { 
    ...defaultOptions,
    method: 'POST',
    headers: {
      'X-STAT-deviceId': deviceId
    }
  });
  const votes = await response.json();
  return votes;
};

const removeVote = async (movieId) => {
  const deviceId = getSessionId();
  const url = `${BASE_URL}/votes/${movieId}`;
  const response = await fetch(url, { 
    ...defaultOptions,
    method: 'DELETE',
    headers: {
      'X-STAT-deviceId': deviceId
    }
  });
  const result = await response.json();
  return result;
};

const setWatched = async (movieId, watched = true) => {
  const url = `${BASE_URL}/movies/${movieId}/watched`;
  const response = await fetch(url, {
    ...defaultOptions,
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
  const url = `${BASE_URL}/lookup/movie/${movieId}/?append=videos,reviews`;
  const response = await fetch(url);
  const movie = await response.json();
  return movie;
}

export {
  addMovie,
  addVote,
  getList,  
  getLists,
  getMyVotes,
  getServices,
  lookupMovie,
  removeVote,
  searchMovie,
  setWatched,
}
