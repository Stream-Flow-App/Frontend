import React, { useState, useEffect } from 'react';
import { fetchAdminAudios, deleteAdminAudio } from '../../utils/adminApiUtils';
import { Trash2, AlertTriangle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { useToast } from '../common/Toast';
import { useMusic } from '../../context/MusicContext';

export default function AdminAudioList() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingAudio, setDeletingAudio] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { playSong } = useMusic();
  const { showErrorToast, showSuccessToast } = useToast();

  useEffect(() => {
    loadAudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAudios = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminAudios();
      setAudios(data.audios || []);
    } catch {
      showErrorToast('Failed to load audio tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAudio) return;
    try {
      await deleteAdminAudio(deletingAudio._id);
      showSuccessToast('Audio deleted successfully');
      setAudios(audios.filter((a) => a._id !== deletingAudio._id));
    } catch {
      showErrorToast('Failed to delete audio');
    } finally {
      setDeletingAudio(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PuffLoader color="#8b5cf6" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Audio Tracks</h2>
        <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/20">
          {audios.length} Tracks Total
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Singer</th>
              <th className="px-6 py-4">Genre</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {audios.slice((page - 1) * limit, page * limit).map((audio) => (
              <tr key={audio._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                <td className="px-6 py-4 flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                    <img
                      src={audio.coverImageUrl ? (audio.coverImageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${audio.coverImageUrl}` : audio.coverImageUrl) : '/assets/images/default-cover.jpg'}
                      alt={audio.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => playSong({ id: audio._id, ...audio })}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PlayCircle className="text-white" size={20} />
                    </button>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{audio.title}</span>
                </td>
                <td className="px-6 py-4">{audio.singer}</td>
                <td className="px-6 py-4 capitalize">{audio.genre}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium w-fit ${
                        audio.isPrivate
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}
                    >
                      {audio.isPrivate ? 'Private' : 'Public'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium w-fit ${
                        audio.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : audio.status === 'rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {audio.status ? audio.status.charAt(0).toUpperCase() + audio.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setDeletingAudio(audio)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete Audio"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Math.ceil(audios.length / limit) > 1 && (
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing Page {page} of {Math.ceil(audios.length / limit)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(audios.length / limit)))}
              disabled={page === Math.ceil(audios.length / limit)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center space-x-3 text-red-500 dark:text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Audio Track</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{deletingAudio.title}</span>? This action is permanent and will remove it from all user playlists.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeletingAudio(null)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
