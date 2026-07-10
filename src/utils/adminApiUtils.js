import { authApi } from './authUtils';

export const fetchAdminUsers = async (search = '', page = 1, limit = 10, userType = 'users') => {
  try {
    const params = new URLSearchParams({ search, page, limit, userType });
    const response = await authApi.get(`/api/admin/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteAdminUser = async (username) => {
  try {
    const response = await authApi.delete(`/api/admin/users/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const fetchAdminAudios = async () => {
  try {
    const response = await authApi.get('/api/admin/audios');
    return response.data;
  } catch (error) {
    console.error('Error fetching audios:', error);
    throw error;
  }
};

export const deleteAdminAudio = async (id) => {
  try {
    const response = await authApi.delete(`/api/admin/audios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting audio:', error);
    throw error;
  }
};

export const updateAdminUserBan = async (username, durationHours) => {
  try {
    const response = await authApi.put(`/api/admin/users/${username}/ban`, { durationHours });
    return response.data;
  } catch (error) {
    console.error('Error updating user ban:', error);
    throw error;
  }
};

export const updateAdminUserRole = async (username, role) => {
  try {
    const response = await authApi.put(`/api/admin/users/${username}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const fetchPendingAudios = async () => {
  try {
    const response = await authApi.get('/api/moderation/audios/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending audios:', error);
    throw error;
  }
};

export const updateAudioStatus = async (id, status) => {
  try {
    const response = await authApi.put(`/api/moderation/audios/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating audio status:', error);
    throw error;
  }
};

export const fetchPendingAlbums = async () => {
  try {
    const response = await authApi.get('/api/admin/albums/pending');
    if (response.data.albums) {
      const { transformAlbum } = await import('./albumUtils');
      response.data.albums = response.data.albums.map(transformAlbum);
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching pending albums:', error);
    throw error;
  }
};

export const updateAlbumStatus = async (id, status) => {
  try {
    const action = status === 'approved' ? 'approve' : 'reject';
    const response = await authApi.patch(`/api/admin/album/${id}/${action}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating album status (${status}):`, error);
    throw error;
  }
};
