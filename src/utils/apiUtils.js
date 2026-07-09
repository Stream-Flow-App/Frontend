
// utils/apiUtils.js
import axios from 'axios'
import { authApi } from './authUtils'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response from ${response.config.url}:`, response.status)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

/**
 * Transform API song data to match app's expected format
 */
export const transformApiSong = (apiSong) => {
  if (!apiSong) return null;
  
  return {
    id: apiSong._id,
    title: apiSong.title || 'Unknown Title',
    artist: apiSong.singer || 'Unknown Artist',
    album: apiSong.album || '',
    duration: formatDurationFromMs(apiSong.duration),
    cover: (() => {
      let coverPath = apiSong.coverImageUrl;
      if (!coverPath) return "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover";
      if (coverPath.startsWith('http')) return coverPath;
      if (coverPath.includes('/uploads/audio/')) {
        coverPath = '/uploads/audio/' + coverPath.split('/uploads/audio/')[1];
      }
      return `${API_BASE_URL}${coverPath}`;
    })(),
    url: `${API_BASE_URL}/audios/stream/${apiSong._id}`,
    genre: apiSong.genre || '',
    category: apiSong.category || '',
    isPrivate: apiSong.isPrivate || false,
    uploadedBy: apiSong.uploadedBy,
    createdAt: apiSong.createdAt,
    isUploaded: false, // This distinguishes API songs from user uploads
    // Keep original API fields for reference
    _originalApiData: {
      _id: apiSong._id,
      singer: apiSong.singer,
      audioUrl: apiSong.audioUrl,
      coverImageUrl: apiSong.coverImageUrl,
      duration: apiSong.duration // original milliseconds
    }
  };
};

/**
 * Transform multiple API songs
 */
export const transformApiSongs = (apiSongs) => {
  if (!Array.isArray(apiSongs)) return [];
  return apiSongs.map(transformApiSong).filter(Boolean);
};

/**
 * Format duration correctly handling both seconds and milliseconds
 */
export const formatDurationFromMs = (timeValue) => {
  if (!timeValue || isNaN(timeValue)) return "0:00";
  
  // If value is very large (e.g. > 10000), it's likely milliseconds. Otherwise, seconds.
  const numericValue = typeof timeValue === 'number' ? timeValue : parseFloat(timeValue);
  const totalSeconds = numericValue > 10000 ? Math.floor(numericValue / 1000) : Math.floor(numericValue);
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Convert MM:SS format to milliseconds
 */
export const parseDurationToMs = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  return (minutes * 60 + seconds) * 1000;
};

/**
 * Fetch all songs from API with pagination and filters
 */
export const fetchSongs = async (params = { page: 1, limit: 50, genre: 'all', category: 'all', artist: 'all', album: 'all' }) => {
  try {
    const response = await api.get('/audios', { params })
    
    // Handle different response structures
    const songsData = response.data?.audios || response.data?.data?.audios || []
    
    if (!Array.isArray(songsData)) {
      throw new Error('Invalid response format: expected array of songs')
    }
    
    const transformedSongs = transformApiSongs(songsData)
    console.log(`Successfully fetched ${transformedSongs.length} songs`)
    
    return {
      songs: transformedSongs,
      totalCount: response.data?.totalCount || songsData.length,
      totalPages: response.data?.totalPages || 1,
      currentPage: response.data?.currentPage || 1
    }
  } catch (error) {
    console.error('Error fetching songs:', error)
    
    // Provide more specific error messages
    if (error.response) {
      if (error.response.status === 404) throw new Error('Songs API endpoint not found')
      if (error.response.status === 500) throw new Error('Server error while fetching songs')
    }
    throw error
  }
}

/**
 * Fetch songs with retry logic
 */
export const fetchSongsWithRetry = async (maxRetries = 3, delay = 1000, params = { page: 1, limit: 50, genre: 'all', category: 'all', artist: 'all', album: 'all' }) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchSongs(params)
    } catch (error) {
      console.log(`Fetch attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

/**
 * Fetch artist's own uploaded songs
 */
export const fetchMyUploads = async () => {
  try {
    const response = await authApi.get('/audios/mine')
    const songsData = response.data?.audios || []
    
    const transformedSongs = transformApiSongs(songsData)
    return {
      songs: transformedSongs,
      totalCount: response.data?.count || transformedSongs.length
    }
  } catch (error) {
    console.error('Error fetching my uploads:', error)
    throw error
  }
}

/**
 * Fetch a specific song by ID
 */
export const fetchSongById = async (songId) => {
  try {
    const response = await api.get(`/audios/${songId}`)
    const songData = response.data?.data || response.data
    
    return transformApiSong(songData)
  } catch (error) {
    console.error(`Error fetching song ${songId}:`, error)
    throw error
  }
}

/**
 * Increment song listen times
 */
export const incrementListenTimes = async (songId) => {
  try {
    const response = await api.post(`/audios/${songId}/listen`)
    return response.data
  } catch (error) {
    console.error(`Error incrementing listen times for ${songId}:`, error)
    // Non-critical, so don't throw
  }
}

/**
 * Search globally via the backend API (Songs & Playlists)
 */
export const searchSongs = async (query, params = { page: 1, limit: 50, genre: 'all', category: 'all', artist: 'all' }) => {
  try {
    if (!query || query.trim() === '') return { songs: [], playlists: [] };
    
    const response = await api.get(`/audios/search`, {
      params: { q: query, ...params }
    });
    
    const songs = response.data?.audios || [];
    const playlists = response.data?.playlists || [];
    const users = response.data?.users || [];
    const albums = response.data?.albums || [];
    
    return {
      songs: songs.map(transformApiSong),
      playlists: playlists, 
      users: users,
      albums: albums,
      totalSongs: response.data?.totalAudios || 0,
      totalPlaylists: response.data?.totalPlaylists || 0,
      totalUsers: response.data?.totalUsers || 0,
      totalAlbums: response.data?.totalAlbums || 0,
      currentPage: response.data?.currentPage || 1,
      totalPages: response.data?.totalPages || 1
    };
  } catch (error) {
    console.error('Error searching:', error)
    throw error
  }
}

/**
 * Filter songs by genre
 */
export const filterSongsByGenre = (songs, genre) => {
  if (!genre || genre === 'all') return songs;
  return songs.filter(song => 
    song.genre?.toLowerCase() === genre.toLowerCase()
  );
};

/**
 * Filter songs by category
 */
export const filterSongsByCategory = (songs, category) => {
  if (!category || category === 'all') return songs;
  return songs.filter(song => 
    song.category?.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Fetch all public playlists
 */
export const fetchPublicPlaylistsAPI = async () => {
  try {
    const response = await api.get('/api/playlists/public');
    return response.data?.playlists || [];
  } catch (error) {
    console.error('Error fetching public playlists:', error);
    return [];
  }
};

const GENRE_IMAGE_MAP = {
  'pop': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607563/streamflow/genres/ebflgxx9ardxndymykwy.jpg',
  'alternative pop': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607563/streamflow/genres/ebflgxx9ardxndymykwy.jpg',
  'synth-pop': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607563/streamflow/genres/ebflgxx9ardxndymykwy.jpg',
  'hip-hop': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607565/streamflow/genres/buemb9st51niubfw1zvs.jpg',
  'rap': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607565/streamflow/genres/buemb9st51niubfw1zvs.jpg',
  'pop rap': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607565/streamflow/genres/buemb9st51niubfw1zvs.jpg',
  'r&b': 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607566/streamflow/genres/yktlp8rtezj11lqqsxqc.jpg',
};
const DEFAULT_GENRE_IMG = 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607563/streamflow/genres/ebflgxx9ardxndymykwy.jpg';
const DEFAULT_ARTIST_IMG = 'https://res.cloudinary.com/dfaylabxu/image/upload/v1783607567/streamflow/genres/wpedlqoypuwvuhmuotao.jpg';

/**
 * Get unique genres from songs as objects { name, image }
 */
export const getUniqueGenres = (songs) => {
  const formatGenre = (genre) => {
    if (!genre) return '';
    return genre.trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const uniqueGenreNames = songs
    .map(song => song.genre)
    .filter(Boolean)
    .map(formatGenre)
    .filter((genre, index, array) => array.indexOf(genre) === index)
    .sort();
  
  const allGenreObj = { name: 'all', image: DEFAULT_GENRE_IMG };
  const genreObjs = uniqueGenreNames.map(name => ({
    name,
    image: GENRE_IMAGE_MAP[name.toLowerCase()] || DEFAULT_GENRE_IMG
  }));

  return [allGenreObj, ...genreObjs];
}

/**
 * Get unique artists from songs as objects { name, image }
 */
export const getUniqueArtists = (songs) => {
  const formatArtist = (artist) => {
    if (!artist) return '';
    return artist.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const artistMap = new Map();

  songs.forEach(song => {
    const rawArtists = [];
    if (Array.isArray(song.singer)) rawArtists.push(...song.singer);
    else if (typeof song.artist === 'string') rawArtists.push(...song.artist.split(',').map(s => s.trim()));
    
    // Check uploadedBy to see if we have a user profile image for them
    const uploaderImage = song.uploadedBy?.profileImg && song.uploadedBy.profileImg !== 'No Profile Picture' ? song.uploadedBy.profileImg : null;

    rawArtists.forEach(a => {
      if (!a || a === 'Unknown Artist') return;
      const formattedName = formatArtist(a);
      if (!artistMap.has(formattedName)) {
        artistMap.set(formattedName, {
          name: formattedName,
          image: uploaderImage || DEFAULT_ARTIST_IMG
        });
      } else if (uploaderImage && artistMap.get(formattedName).image === DEFAULT_ARTIST_IMG) {
        // Upgrade to real image if found in another song
        artistMap.set(formattedName, { name: formattedName, image: uploaderImage });
      }
    });
  });

  const sortedArtists = Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  return [{ name: 'all', image: DEFAULT_ARTIST_IMG }, ...sortedArtists];
}

/**
 * Get unique categories from songs
 */
export const getUniqueCategories = (songs) => {
  const categories = songs
    .map(song => song.category)
    .filter(Boolean)
    .filter((category, index, array) => array.indexOf(category) === index)
    .sort()
  
  return ['all', ...categories]
}

/**
 * Get songs by uploader
 */
export const getSongsByUploader = (songs, uploaderId) => {
  return songs.filter(song => 
    song.uploadedBy?._id === uploaderId
  );
}

/**
 * Get random songs
 */
export const getRandomSongs = (songs, count = 10) => {
  const shuffled = [...songs].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Get featured songs (first N songs, or implement your own logic)
 */
export const getFeaturedSongs = (songs, count = 8) => {
  return songs.slice(0, count)
}

/**
 * Get trending songs (implement your own logic based on play count, etc.)
 */
export const getTrendingSongs = (songs, count = 6) => {
  // For now, return a random selection
  // In a real app, you might sort by play count, recent popularity, etc.
  return getRandomSongs(songs, count)
}

/**
 * API Health Check
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 })
    return response.status === 200
  } catch (error) {
    console.warn('API health check failed:', error.message)
    return false
  }
}

/**
 * Get API status and statistics
 */
export const getApiStatus = async () => {
  try {
    const [songsResponse] = await Promise.all([
      api.get('/audios')
    ])
    
    const songs = songsResponse.data?.data?.audios || songsResponse.data?.audios || []
    
    return {
      isHealthy: true,
      totalSongs: songs.length,
      genres: getUniqueGenres(transformApiSongs(songs)).length - 1, // -1 for 'all'
      categories: getUniqueCategories(transformApiSongs(songs)).length - 1,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message,
      lastChecked: new Date().toISOString()
    }
  }
}

// --- Authenticated Audio Endpoints ---

export const uploadAudioAPI = async (formData) => {
  try {
    const response = await api.post('/audios/upload', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

export const updateAudioAPI = async (id, formData) => {
  try {
    const response = await api.put(`/audios/${id}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating audio ${id}:`, error);
    throw error;
  }
};

export const deleteAudioAPI = async (id) => {
  try {
    const response = await api.delete(`/audios/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting audio ${id}:`, error);
    throw error;
  }
};

export const fetchMyAudiosAPI = async () => {
  try {
    const response = await api.get('/audios/mine', {
      withCredentials: true,
    });
    const songsData = response.data?.data?.audios || response.data?.audios || [];
    return transformApiSongs(songsData);
  } catch (error) {
    console.error('Error fetching user audios:', error);
    throw error;
  }
};

/**
 * Favorites API
 */
export const fetchFavoritesAPI = async () => {
  try {
    const response = await api.get('/api/users/favorites', { withCredentials: true });
    return {
      success: true,
      favorites: Array.isArray(response.data.favorites)
        ? response.data.favorites.map(transformApiSong)
        : []
    };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { success: false, message: 'Failed to load favorites', favorites: [] };
  }
};

export const toggleFavoriteAPI = async (songId) => {
  try {
    const response = await api.post(`/api/users/favorites/${songId}`, {}, { withCredentials: true });
    return {
      success: true,
      isFavorite: response.data.isFavorite,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, message: 'Failed to toggle favorite' };
  }
};