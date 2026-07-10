import React, { useState, useEffect } from 'react';
import { X, Music, Upload, CheckCircle, Loader2, Search } from 'lucide-react';
import { authApi } from '../../utils/authUtils';
import { useToast } from '../common/Toast';

import { createPortal } from 'react-dom';
import ConfirmModal from '../common/ConfirmModal';
import { deleteAlbumAPI } from '../../utils/albumUtils';

export default function EditAlbumModal({ onClose, editAlbum }) {
  const [formData, setFormData] = useState({ 
    name: editAlbum?.name || '', 
    description: editAlbum?.description || '' 
  });
  const [existingTracks, setExistingTracks] = useState(editAlbum?.audio || []);
  const [selectedExistingTrackIds, setSelectedExistingTrackIds] = useState(
    (editAlbum?.audio || []).map(t => (t._id || t.id)?.toString()).filter(Boolean)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedCover, setSelectedCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(editAlbum?.cover && editAlbum.cover !== 'No Cover' ? editAlbum.cover : null);
  const coverInputRef = React.useRef(null);
  const { showErrorToast, showSuccessToast } = useToast();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // For editing an album, we just show the tracks that are already in it.
    // If the admin is editing, we don't necessarily want to pull all the artist's tracks,
    // just let them remove existing ones.
    setExistingTracks(editAlbum?.audio || []);
  }, [editAlbum]);

  const filteredTracks = existingTracks.filter(track => 
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExistingTrack = (id) => {
    const strId = id?.toString();
    setSelectedExistingTrackIds(prev =>
      prev.includes(strId) ? prev.filter(tid => tid !== strId) : [...prev, strId]
    );
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedCover(file);
        setCoverPreview(URL.createObjectURL(file));
      } else {
        showErrorToast("Please select a valid image file");
      }
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      return showErrorToast("Album name is required.");
    }
    if (selectedExistingTrackIds.length === 0) {
      return showErrorToast("Please select at least one track.");
    }

    setIsSubmitting(true);
    try {
      let allTrackIds = selectedExistingTrackIds.map(id => id?.toString()).filter(Boolean);

      setStatusText('Updating album...');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || 'Album');
      allTrackIds.forEach(id => data.append('audio', id));
      
      if (selectedCover instanceof File) {
         data.append('cover', selectedCover);
      } else if (!selectedCover && (!editAlbum?.cover || editAlbum.cover === 'No Cover')) {
         const lastSong = existingTracks.find(t => t.id === allTrackIds[allTrackIds.length - 1] || t._id === allTrackIds[allTrackIds.length - 1]);
         if (lastSong && lastSong.cover) {
           data.append('coverUrl', lastSong.cover);
         }
      }

      await authApi.put(`/api/albums/${editAlbum._id}`, data);

      showSuccessToast("Album updated successfully!");
      // Dispatch an event to refresh the UI
      window.dispatchEvent(new CustomEvent('songUploaded'));
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast(error.response?.data?.message || 'Failed to update album');
    } finally {
      setIsSubmitting(false);
      setStatusText('');
    }
  };

  const handleDelete = async () => {
    if (!editAlbum || !editAlbum._id) return;
    setIsDeleting(true);
    try {
      await deleteAlbumAPI(editAlbum._id);
      showSuccessToast('Album deleted successfully');
      window.dispatchEvent(new CustomEvent('songUploaded'));
      onClose();
    } catch (error) {
      console.error('Failed to delete album', error);
      showErrorToast(error.response?.data?.message || 'Failed to delete album');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Album</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update album details or remove tracks.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Album Cover (Optional)</label>
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all relative overflow-hidden group"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white mb-2" />
                      <span className="text-white text-sm font-medium">Change Cover</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-2 sm:mb-3 group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                      Upload Album Cover
                    </span>
                    <span className="text-xs text-gray-500 mt-1">If empty, we'll use the last track's cover</span>
                  </>
                )}
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Album Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500"
                placeholder="Album Title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                placeholder="About this album..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Select Tracks for Album *</label>
                <div className="relative w-1/2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your tracks..."
                    className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Choose from your existing uploaded tracks.</p>
              
              {existingTracks.length === 0 ? (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 text-sm text-center">
                  You haven't uploaded any tracks yet. Please use the "Upload Song" button first.
                </div>
              ) : filteredTracks.length === 0 ? (
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-500 text-sm text-center">
                  No tracks match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                  {filteredTracks.map(track => (
                    <div 
                      key={track.id} 
                      onClick={() => !isSubmitting && toggleExistingTrack(track.id)}
                      className={`relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-colors border ${
                        selectedExistingTrackIds.includes(track.id)
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border flex items-center justify-center z-10 ${
                        selectedExistingTrackIds.includes(track.id)
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white/50'
                      }`}>
                        {selectedExistingTrackIds.includes(track.id) && <CheckCircle size={14} />}
                      </div>
                      
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 relative">
                         <img src={track.cover || '/default-cover.png'} alt="" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="w-full text-center">
                        <p className="font-semibold text-sm truncate w-full" title={track.title}>{track.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{track.genre}</p>
                      </div>
                      
                      {track.status === 'pending' && (
                        <div className="absolute top-2 left-2">
                           <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center space-x-4">
          <div>
            {editAlbum && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting || isDeleting}
                className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete Album
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={
                !formData.name || 
                selectedExistingTrackIds.length === 0 || 
                isSubmitting ||
                isDeleting
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusText || 'Saving...'}</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Album"
        message={`Are you sure you want to delete the album "${formData.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>,
    document.body
  );
}
