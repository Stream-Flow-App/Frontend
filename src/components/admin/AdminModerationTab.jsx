import React, { useState, useEffect } from 'react';
import { fetchPendingAudios, updateAudioStatus, fetchPendingAlbums, updateAlbumStatus } from '../../utils/adminApiUtils';
import { CheckCircle, XCircle, Clock, PlayCircle, Edit2 } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { useToast } from '../common/Toast';
import { useMusic } from '../../context/MusicContext';
import UploadModal from '../uploads/UploadModal';
import EditAlbumModal from '../uploads/EditAlbumModal';

export default function AdminModerationTab() {
  const [pendingAudios, setPendingAudios] = useState([]);
  const [pendingAlbums, setPendingAlbums] = useState([]);
  const [view, setView] = useState('audio'); // 'audio' or 'album'
  const [loading, setLoading] = useState(true);
  const [editingSong, setEditingSong] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
  const { showErrorToast, showSuccessToast } = useToast();
  const { playSong } = useMusic();

  useEffect(() => {
    loadPendingContent();

    window.addEventListener('songUploaded', loadPendingContent);
    return () => window.removeEventListener('songUploaded', loadPendingContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPendingContent = async () => {
    try {
      setLoading(true);
      const [audioData, albumData] = await Promise.all([
        fetchPendingAudios().catch(() => ({ audios: [] })),
        fetchPendingAlbums().catch(() => ({ albums: [] }))
      ]);
      setPendingAudios(audioData.audios || []);
      setPendingAlbums(albumData.albums || []);
    } catch {
      showErrorToast('Failed to load pending content');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioStatusUpdate = async (id, status) => {
    try {
      await updateAudioStatus(id, status);
      showSuccessToast(`Audio ${status} successfully`);
      setPendingAudios((prev) => prev.filter((audio) => audio._id !== id));
    } catch {
      showErrorToast(`Failed to ${status} audio`);
    }
  };

  const handleAlbumStatusUpdate = async (id, status) => {
    try {
      await updateAlbumStatus(id, status);
      showSuccessToast(`Album ${status} successfully`);
      setPendingAlbums((prev) => prev.filter((album) => album._id !== id));
    } catch {
      showErrorToast(`Failed to ${status} album`);
    }
  };

  const handleEditClick = (song) => {
    setEditingSong(song);
    setShowUploadModal(true);
  };

  const handleEditAlbumClick = (album) => {
    setEditingAlbum(album);
    setShowEditAlbumModal(true);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
    setEditingSong(null);
    loadPendingContent(); // Reload to get updated metadata
  };

  const handleEditAlbumClose = () => {
    setShowEditAlbumModal(false);
    setEditingAlbum(null);
    loadPendingContent(); // Reload to get updated metadata
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PuffLoader color="#8b5cf6" size={40} />
      </div>
    );
  }

  const currentItems = view === 'audio' ? pendingAudios : pendingAlbums;
  const isAudioView = view === 'audio';

  const getCoverImageUrl = (url) => {
    if (!url || url === 'No Cover') return '/assets/images/default-cover.jpg';
    if (url.startsWith('http')) return url;
    let path = url;
    if (path.includes('uploads/')) {
      path = '/uploads/' + path.split('uploads/')[1];
    } else if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${path}`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Moderation Queue</h2>
        <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setView('audio')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isAudioView ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Audio Tracks ({pendingAudios.length})
          </button>
          <button
            onClick={() => setView('album')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              !isAudioView ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Albums ({pendingAlbums.length})
          </button>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500/50 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400">There are no pending {isAudioView ? 'audio tracks' : 'albums'} to review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {currentItems.map((item) => (
            <div key={item._id} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                <img
                  src={getCoverImageUrl(isAudioView ? item.coverImageUrl : item.cover)}
                  alt={item.title || item.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{item.title || item.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
                    Uploaded by: <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {isAudioView ? (item.uploadedBy?.username || 'Unknown') : (item.owner?.username || 'Unknown')}
                    </span>
                  </p>
                  {isAudioView && (
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{item.genre}</span>
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{item.category}</span>
                    </div>
                  )}
                  {!isAudioView && (
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">Album</span>
                      <span className="text-gray-500 dark:text-gray-400">{item.audio?.length || 0} tracks</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto flex-shrink-0 mt-2 sm:mt-0">
                {isAudioView ? (
                  <>
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                      title="Edit Info"
                    >
                      <Edit2 size={18} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => playSong({ id: item._id, ...item })}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                      title="Listen"
                    >
                      <PlayCircle size={18} />
                      <span className="hidden sm:inline">Listen</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditAlbumClick(item)}
                    className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Edit Album"
                  >
                    <Edit2 size={18} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
                <button
                  onClick={() => isAudioView ? handleAudioStatusUpdate(item._id, 'approved') : handleAlbumStatusUpdate(item._id, 'approved')}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Approve"
                >
                  <CheckCircle size={18} />
                  <span className="hidden sm:inline">Approve</span>
                </button>
                <button
                  onClick={() => isAudioView ? handleAudioStatusUpdate(item._id, 'rejected') : handleAlbumStatusUpdate(item._id, 'rejected')}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Reject"
                >
                  <XCircle size={18} />
                  <span className="hidden sm:inline">Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={handleUploadModalClose}
          editSong={editingSong}
        />
      )}

      {showEditAlbumModal && (
        <EditAlbumModal
          onClose={handleEditAlbumClose}
          editAlbum={editingAlbum}
        />
      )}
    </div>
  );
}
