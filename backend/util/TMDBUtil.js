import NodeCache from 'node-cache';
const myCache = new NodeCache();

export default class TMDBUtil {
  constructor (apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.defaultQueryParams = { language: 'en-US', api_key: this.apiKey };
  }

  #getUrl (apiUrl, queryParams = {}) {
    const params = new URLSearchParams({
      ...this.defaultQueryParams,
      ...queryParams,
    });
    return `${this.baseUrl}${apiUrl}?${params.toString()}`;
  }

  async #getConfig () {
    let config = myCache.get('tmdbConfig');
    if (config === undefined) {
      const url = this.#getUrl('/configuration');
      // TODO: Try/Catch
      const response = await fetch(url);
      const config = await response.json();
      myCache.set('tmdbConfig', config, 10000);
      return config;
    } else {
      return config;
    }
  }

  async searchMovie (query) {
    const url = this.#getUrl('/search/movie', { query });
    const config = await this.#getConfig();
    const baseUrl = config?.images?.base_url;
    const secureBaseUrl = config?.images?.secure_base_url;
    const posterSize = 'w500'; // TODO: Pull/Validate from config
    
    // TODO: Try/Catch
    const response = await fetch(url);
    const results = await response.json();

    // Make some tweaks to result json
    const parsed = results && results.results.map(result => {
      return {
        ...result,
        poster_url: result.poster_path && `${baseUrl}${posterSize}${result.poster_path}`,
        secure_poster_url: result.poster_path && `${secureBaseUrl}${posterSize}${result.poster_path}`,
      }
    });

    return {
      ...results,
      results: parsed,
    };
  }

  async getMovie (id, opts) {
    const config = await this.#getConfig();
    const params = {};
    if (opts?.append) {
      params.append_to_response = opts.append.split(',');
    }
    const url = this.#getUrl(`/movie/${id}`, params);

    // TODO: Try/Catch
    const response = await fetch(url);
    const movie = await response.json();
    movie.backdropUrl = `${config.images.base_url}w1280${movie.backdrop_path}`;
    movie.secureBackdropUrl = `${config.images.secure_base_url}w1280${movie.backdrop_path}`;

    // TODO: Parse in full poster URLs, pick out trailers, etc.
    return movie;
  }
}