import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import { deleteAlbumAPI } from '../../utils/albumUtils';
import { useToast } from '../common/Toast';

const PlaylistCard = ({ playlist, showStatus = false, isAlbum = false, isEditMode = false, onEditClick }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const getCoverUrl = (cover) => {
    if (!cover || cover === 'No Cover') return 'https://placehold.co/200x200/2a2a2a/ffffff?text=Playlist';
    if (cover.startsWith('http')) return cover;
    return `${API_BASE}${cover.startsWith('/') ? '' : '/'}${cover}`;
  };
  const imageUrl = getCoverUrl(playlist.cover);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (isAlbum) {
        await deleteAlbumAPI(playlist._id || playlist.id);
        showSuccessToast('Album deleted successfully');
        window.dispatchEvent(new CustomEvent('songUploaded'));
      } else {
        // Fallback or handle playlist deletion later if needed
        showErrorToast('Playlist deletion not implemented here');
      }
    } catch (error) {
      console.error('Failed to delete', error);
      showErrorToast(error.response?.data?.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const CardWrapper = isEditMode ? 'div' : Link;
  const wrapperProps = isEditMode 
    ? { className: "group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative cursor-default" } 
    : { 
        to: isAlbum ? `/album/${playlist._id || playlist.id}` : `/playlist/${playlist._id || playlist.id}`,
        className: "group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative"
      };

  return (
    <>
      <CardWrapper {...wrapperProps}>
      <div className="relative aspect-square">
        <img 
          src={imageUrl} 
          alt={playlist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        {showStatus && playlist.status && (
          <div className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded-sm shadow-md text-[10px] font-bold text-white z-10 ${
              playlist.status === 'approved' ? 'bg-emerald-500' :
              playlist.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-500 text-yellow-900'
          }`}>
              {playlist.status.charAt(0).toUpperCase() + playlist.status.slice(1)}
          </div>
        )}
        {!isEditMode && (
          <div className="absolute bottom-2 right-2 bg-purple-600 rounded-full p-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {isEditMode && (
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-20">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditClick(); }}
              className="bg-purple-500 hover:bg-purple-600 text-white p-2.5 rounded-full shadow-lg transition-colors"
              title="Edit album"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition-colors"
              title="Delete album"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {playlist.owner?.name || 'Unknown User'} • {playlist.audio?.length || playlist.songs?.length || 0} tracks
        </p>
      </div>
      </CardWrapper>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Album"
        message={`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </>
  );
};

export default PlaylistCard;
