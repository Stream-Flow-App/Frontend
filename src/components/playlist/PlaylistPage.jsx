import { ListMusic, Edit2, Trash2, X, Search, Globe, Lock, Share2, Copy, Check, Save } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"
import { useAuth } from "../../context/AuthContext"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import * as playlistUtils from "../../utils/playlistUtils"
import { clonePlaylistAPI } from "../../utils/apiUtils"
import { useToast } from "../common/Toast"

// Edit Playlist Modal Component
const EditPlaylistModal = ({ isOpen, onClose, playlist, onUpdatePlaylist }) => {
  const [name, setName] = useState(playlist?.name || "")
  const [description, setDescription] = useState(playlist?.description || "")
  const [isPublic, setIsPublic] = useState(playlist?.isPublic || false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen && playlist) {
      setName(playlist.name || "")
      setDescription(playlist.description || "")
      setIsPublic(playlist.isPublic || false)
      setIsVisible(true)
    }
  }, [isOpen, playlist])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setName(playlist?.name || "")
      setDescription(playlist?.description || "")
      setIsPublic(playlist?.isPublic || false)
      onClose()
    }, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onUpdatePlaylist(name.trim(), description.trim(), isPublic)
      handleClose()
    }
  }

  if (!isOpen || !playlist) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[60] p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className={`card rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md shadow-2xl mt-4 sm:mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Edit Playlist</h2>
          <button
            onClick={handleClose}
            className="btn-ghost p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Playlist Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Enter playlist name"
              className="input-primary w-full px-3 py-2.5 sm:py-2 rounded-lg text-sm placeholder-gray-400"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your playlist"
              maxLength={70}
              rows={3}
              className="input-primary w-full px-3 py-2.5 sm:py-2 rounded-lg text-sm placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="editIsPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Make playlist public
            </label>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

// Delete Playlist Confirmation Modal Component
const DeletePlaylistModal = ({ isOpen, onClose, playlist, onConfirmDelete }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || !playlist) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">Delete Playlist</h3>

        <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm text-center">
          Are you sure you want to delete <span className="font-semibold">"{playlist.name}"</span>?
        </p>

        <p className="text-gray-500 dark:text-gray-500 mb-4 sm:mb-6 text-xs text-center">
          This action cannot be undone and will remove all {playlist.songs?.length || 0} songs from this playlist.
        </p>

        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaylistPage() {
  const { state, deletePlaylist, updatePlaylist } = useMusic()
  const { user, isAuthenticated } = useAuth()
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const { showToast } = useToast()
  
  const [fetchedPlaylist, setFetchedPlaylist] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Find the specific playlist by ID from context
  const contextPlaylist = state.playlists?.find(p => (p.id || p._id) === playlistId)
  
  // Prefer fetched playlist to ensure fresh data, fallback to context playlist
  const playlist = fetchedPlaylist || contextPlaylist
  const playlistSongs = playlist?.audio || playlist?.songs || []
  
  const isOwner = playlist && user && (playlist.owner?._id === user.id || playlist.owner?._id === user._id || playlist.owner === user.id || playlist.owner === user._id)

  useEffect(() => {
    let isMounted = true
    const loadPlaylist = async () => {
      try {
        setIsLoading(true)
        const data = await playlistUtils.fetchPlaylistById(playlistId)
        if (isMounted && data.success) {
          setFetchedPlaylist(data.playlist)
        }
      } catch (err) {
        console.error("Failed to fetch playlist", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    
    loadPlaylist()
    
    return () => { isMounted = false }
  }, [playlistId])

  const handleUpdatePlaylist = async (name, description, isPublic) => {
    updatePlaylist(playlistId, { name, description, isPublic })
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    deletePlaylist(playlistId)
    setShowDeleteModal(false)
    navigate("/")
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClonePlaylist = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:required'));
      return;
    }
    try {
      setIsCloning(true);
      await clonePlaylistAPI(playlistId);
      showToast('Playlist saved to your library', 'success');
      // Refresh user playlists in background
      state.fetchPlaylists && state.fetchPlaylists();
    } catch (error) {
      showToast('Failed to save playlist', 'error');
    } finally {
      setIsCloning(false);
    }
  };

  // Handle loading state
  if (isLoading && !playlist) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Handle case where playlist is not found or user is not authorized
  if (!playlist) {
    return (
      <div className="text-center py-8 sm:py-16 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <ListMusic className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Playlist not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
          The playlist you're looking for doesn't exist or is private.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
                {playlist.name}
              </h1>
              {playlist.isPublic ? (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </div>
              )}
            </div>
            {playlist.description && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 sm:mb-4">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>
                {playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
            {playlist.isPublic && (
              <button
                onClick={handleShare}
                className="btn-ghost flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                title="Share playlist"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden xs:inline sm:inline">{copied ? "Copied!" : "Share"}</span>
              </button>
            )}
            
            {isOwner && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-ghost flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:text-purple-600 dark:hover:text-purple-400 text-sm"
                  title="Edit playlist"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Edit</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="btn-ghost flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:text-red-600 dark:hover:text-red-400 text-sm"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Delete</span>
                </button>
              </>
            )}
            
            {isAuthenticated && !isOwner && (
              <button
                onClick={handleClonePlaylist}
                disabled={isCloning}
                className="btn-ghost flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:text-purple-600 dark:hover:text-purple-400 text-sm disabled:opacity-50"
                title="Save to Library"
              >
                <Save className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">{isCloning ? 'Saving...' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>


        {playlistSongs.length === 0 ? (
          // No songs in playlist
          <div className="text-center py-8 sm:py-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ListMusic className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              No songs in this playlist yet
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 sm:mb-8 max-w-sm mx-auto px-4">
              Start building your playlist by adding your favorite songs from your library.
            </p>
          </div>
        ) : (
          // Show songs grid - Mobile-first responsive grid
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mt-4">
            {playlistSongs.map((song) => (
              <SongCard key={song.id || song._id} song={song} playlist={playlistSongs} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
        onUpdatePlaylist={handleUpdatePlaylist}
      />

      {/* Delete Playlist Confirmation Modal */}
      <DeletePlaylistModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        playlist={playlist}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}