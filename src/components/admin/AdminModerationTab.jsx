import React, { useState, useEffect } from 'react';
import { fetchPendingAudios, updateAudioStatus } from '../../utils/adminApiUtils';
import { CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { useToast } from '../common/Toast';
import { useMusic } from '../../context/MusicContext';

export default function AdminModerationTab() {
  const [pendingAudios, setPendingAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showErrorToast, showSuccessToast } = useToast();
  const { playSong } = useMusic();

  useEffect(() => {
    loadPendingAudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPendingAudios = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingAudios();
      setPendingAudios(data.audios || []);
    } catch {
      showErrorToast('Failed to load pending audios');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAudioStatus(id, status);
      showSuccessToast(`Audio ${status} successfully`);
      setPendingAudios((prev) => prev.filter((audio) => audio._id !== id));
    } catch {
      showErrorToast(`Failed to ${status} audio`);
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
        <h2 className="text-2xl font-semibold text-white">Audio Moderation Queue</h2>
        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-medium border border-yellow-500/20 flex items-center gap-2">
          <Clock size={16} />
          {pendingAudios.length} Pending
        </span>
      </div>

      {pendingAudios.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-800">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500/50 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
          <p className="text-gray-400">There are no pending audio tracks to review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingAudios.map((audio) => (
            <div key={audio._id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={audio.coverImageUrl ? (audio.coverImageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${audio.coverImageUrl}` : audio.coverImageUrl) : '/assets/images/default-cover.jpg'}
                  alt={audio.title}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-700 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white truncate">{audio.title}</h3>
                  <p className="text-gray-400 text-sm truncate">
                    Uploaded by: <span className="text-gray-300 font-medium">{audio.uploadedBy?.username || 'Unknown'}</span>
                  </p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">{audio.genre}</span>
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">{audio.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => playSong({ id: audio._id, ...audio })}
                  className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Listen"
                >
                  <PlayCircle size={18} />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(audio._id, 'approved')}
                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Approve"
                >
                  <CheckCircle size={18} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(audio._id, 'rejected')}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Reject"
                >
                  <XCircle size={18} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
