import React, { useState, useEffect } from 'react'
import { X, Plus, Music } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'

export default function PlaylistSelectionModal() {
  const { state, closePlaylistModal, createPlaylist, addSongToPlaylist, fetchPlaylists } = useMusic()
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOpen = state.playlistModal?.isOpen
  const song = state.playlistModal?.song

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists()
      setIsCreating(false)
      setNewPlaylistName('')
      setIsPublic(false)
    }
  }, [isOpen, fetchPlaylists])

  if (!isOpen || !song) return null

  const handleClose = () => {
    closePlaylistModal()
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      setLoading(true)
      const res = await createPlaylist(newPlaylistName.trim(), "", isPublic)
      if (res?.playlist) {
        await addSongToPlaylist(res.playlist._id || res.playlist.id, song.id || song._id)
        handleClose()
      }
    } catch (error) {
      console.error('Failed to create playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setLoading(true)
      await addSongToPlaylist(playlistId, song.id || song._id)
      handleClose()
    } catch (error) {
      console.error('Failed to add song to playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden transform transition-all duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add to Playlist</h2>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Create New Playlist Button / Form */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-200 dark:border-gray-600 mb-4 text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors">
                <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                New Playlist
              </span>
            </button>
          ) : (
            <form onSubmit={handleCreatePlaylist} className="mb-4">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white mb-3 text-sm"
                disabled={loading}
              />
              
              <div className="flex items-center space-x-2 mb-4 px-1">
                <input
                  type="checkbox"
                  id="modalIsPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-3.5 h-3.5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="modalIsPublic" className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Make playlist public
                </label>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Playlist List */}
          <div className="space-y-1">
            {state.playlists.length > 0 ? (
              state.playlists.map((playlist) => {
                const isAdded = playlist.audio?.some(a => (a._id || a) === (song._id || song.id)) || playlist.songs?.some(s => (s._id || s.id) === (song._id || song.id));
                return (
                  <button
                    key={playlist._id || playlist.id}
                    onClick={() => !isAdded && handleAddToPlaylist(playlist._id || playlist.id)}
                    disabled={isAdded || loading}
                    className="w-full flex items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
                      {playlist.cover && playlist.cover !== 'No Cover' ? (
                        <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{playlist.name}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {playlist.audio?.length || playlist.songs?.length || 0} songs
                      </p>
                    </div>
                    {isAdded && (
                      <span className="text-xs font-medium text-green-500 ml-2">Added</span>
                    )}
                  </button>
                )
              })
            ) : (
              !isCreating && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">You don't have any playlists yet.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
