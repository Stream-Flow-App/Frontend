import { authApi } from './authUtils';
import { transformApiSong } from './apiUtils';

const BASE_URL = '/api/playlists';

const transformPlaylist = (playlist) => {
  if (!playlist) return playlist;
  if (Array.isArray(playlist.audio)) {
    playlist.audio = playlist.audio.map(song => 
      typeof song === 'object' && song !== null && song._id ? transformApiSong(song) : song
    );
  }
  return playlist;
};

/**
 * Fetch all playlists for the authenticated user
 */
export const fetchUserPlaylists = async () => {
  try {
    const response = await authApi.get(`${BASE_URL}/me`);
    if (response.data.playlists) {
      response.data.playlists = response.data.playlists.map(transformPlaylist);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    throw error;
  }
};

/**
 * Get a specific playlist by ID
 * @param {string} id - The playlist ID
 */
export const fetchPlaylistById = async (id) => {
  try {
    const response = await authApi.get(`${BASE_URL}/${id}`);
    if (response.data.playlist) {
      response.data.playlist = transformPlaylist(response.data.playlist);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw error;
  }
};

/**
 * Create a new playlist
 * @param {Object} playlistData - The playlist data (name, description, etc.)
 */
export const createPlaylist = async (playlistData) => {
  try {
    const response = await authApi.post(BASE_URL, playlistData);
    if (response.data.playlist) {
      response.data.playlist = transformPlaylist(response.data.playlist);
    }
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

/**
 * Update an existing playlist
 * @param {string} id - The playlist ID
 * @param {Object} updateData - The data to update
 */
export const updatePlaylist = async (id, updateData) => {
  try {
    const response = await authApi.put(`${BASE_URL}/${id}`, updateData);
    if (response.data.playlist) {
      response.data.playlist = transformPlaylist(response.data.playlist);
    }
    return response.data;
  } catch (error) {
    console.error('Error updating playlist:', error);
    throw error;
  }
};

/**
 * Delete a playlist
 * @param {string} id - The playlist ID
 */
export const deletePlaylist = async (id) => {
  try {
    const response = await authApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};

/**
 * Add a song to a playlist
 * @param {string} playlistId - The playlist ID
 * @param {string} songId - The song ID to add
 */
export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const response = await authApi.post(`${BASE_URL}/${playlistId}/songs`, { songId });
    if (response.data.playlist) {
      response.data.playlist = transformPlaylist(response.data.playlist);
    }
    return response.data;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    throw error;
  }
};

/**
 * Remove a song from a playlist
 * @param {string} playlistId - The playlist ID
 * @param {string} songId - The song ID to remove
 */
export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const response = await authApi.delete(`${BASE_URL}/${playlistId}/songs/${songId}`);
    if (response.data.playlist) {
      response.data.playlist = transformPlaylist(response.data.playlist);
    }
    return response.data;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    throw error;
  }
};
