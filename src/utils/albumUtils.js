import { authApi } from './authUtils';
import { transformApiSong } from './apiUtils';

const BASE_URL = '/api/albums';

const transformAlbum = (album) => {
  if (!album) return album;
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
