import { authApi } from './authUtils';
import { transformApiSong } from './apiUtils';

const BASE_URL = '/api/albums';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const transformAlbum = (album) => {
  if (!album) return album;
  
  if (album.cover && album.cover !== 'No Cover' && !album.cover.startsWith('http')) {
    let coverPath = album.cover;
    if (coverPath.includes('/uploads/')) {
      coverPath = '/uploads/' + coverPath.split('/uploads/')[1];
    } else if (!coverPath.startsWith('/')) {
      coverPath = '/' + coverPath;
    }
    album.cover = `${API_BASE_URL}${coverPath}`;
  }

  if (Array.isArray(album.audio)) {
    album.audio = album.audio.map(song => 
      typeof song === 'object' && song !== null && song._id ? transformApiSong(song) : song
    );
  }
  return album;
};

export const fetchUserAlbums = async () => {
  try {
    const response = await authApi.get(`${BASE_URL}/me`);
    if (response.data.albums) {
      response.data.albums = response.data.albums.map(transformAlbum);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user albums:', error);
    throw error;
  }
};

export const fetchAlbumById = async (id) => {
  try {
    const response = await authApi.get(`${BASE_URL}/${id}`);
    if (response.data.album) {
      response.data.album = transformAlbum(response.data.album);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
};

export const deleteAlbumAPI = async (id) => {
  try {
    const response = await authApi.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
};
