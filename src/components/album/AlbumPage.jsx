import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PuffLoader } from 'react-spinners'
import { Disc, Music, Save, Edit2, Play, Pause, Trash2 } from "lucide-react"
import EditAlbumModal from "../uploads/EditAlbumModal.jsx"
import ConfirmModal from "../common/ConfirmModal"

import { useAuth } from "../../context/AuthContext"
import { useMusic, MUSIC_ACTIONS, createMusicAction } from "../../context/MusicContext"
import { useToast } from "../common/Toast"

import * as albumUtils from "../../utils/albumUtils"
import { transformApiSong } from "../../utils/apiUtils"
import * as playlistUtils from "../../utils/playlistUtils"

// Compact track row — Spotify-style
function TrackRow({ song, index, isCurrentSong, isPlaying, onPlay }) {
  const [hovered, setHovered] = useState(false)

  const formatDuration = (dur) => {
    if (!dur) return '—'
    if (typeof dur === 'string' && dur.includes(':')) return dur
    const secs = typeof dur === 'number' ? Math.floor(dur / 1000) : parseInt(dur)
    if (isNaN(secs)) return '—'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
        isCurrentSong
          ? 'bg-purple-50 dark:bg-purple-900/20'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {/* Track number / play icon */}
      <div className="w-8 text-center flex-shrink-0">
        {hovered || (isCurrentSong && isPlaying) ? (
          <button className="text-purple-600 dark:text-purple-400">
            {isCurrentSong && isPlaying
              ? <Pause className="w-4 h-4 mx-auto" />
              : <Play className="w-4 h-4 mx-auto ml-0.5" />}
          </button>
        ) : (
          <span className={`text-sm font-medium ${isCurrentSong ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>
            {isCurrentSong && isPlaying ? '▶' : index}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <img
        src={song.cover || 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=♪'}
        alt={song.title}
        className="w-10 h-10 rounded object-cover flex-shrink-0"
        onError={e => { e.target.src = 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=♪' }}
      />

      {/* Title + Artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrentSong ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
          {song.title || 'Unknown'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist || song.singer || 'Unknown Artist'}</p>
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">{formatDuration(song.durationRaw || song.duration)}</span>
    </div>
  )
}

export default function AlbumPage() {
  const { albumId } = useParams()
  const navigate = useNavigate()
  
  const [albumData, setAlbumData] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [artistName, setArtistName] = useState('Various Artists')
  const [albumName, setAlbumName] = useState('Unknown Album')
  const [albumDescription, setAlbumDescription] = useState('')
  const [albumCover, setAlbumCover] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const { isAuthenticated, user } = useAuth()
  const { createPlaylist, deletePlaylist, fetchPlaylists, state, dispatch } = useMusic()
  const { showToast } = useToast()

  const savedAlbumPlaylist = state.playlists?.find(p => p.originalId === albumId || p._id === albumId || p.id === albumId)
  const isSaved = !!savedAlbumPlaylist

  // Check if owner
  const userId = user?._id || user?.id;
  const ownerObj = albumData?.owner;
  const ownerId = ownerObj?._id || ownerObj?.id || (typeof ownerObj === 'string' ? ownerObj : null);
  
  const isOwner = Boolean(
    (userId && ownerId && String(userId) === String(ownerId)) ||
    (user?.username && ownerObj?.username && user.username === ownerObj.username)
  );

  const loadAlbum = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await albumUtils.fetchAlbumById(albumId)
      if (data && data.success && data.album) {
        const album = data.album
        setAlbumData(album)
        const rawTracks = album.audio || album.songs || []
        const transformedTracks = rawTracks.map(song => {
          if (!song || typeof song !== 'object') return null
          if (song.url) return song
          if (song._id) return transformApiSong(song)
          return null
        }).filter(Boolean)
        setSongs(transformedTracks)
        setAlbumName(album.name || 'Unknown Album')
        setAlbumDescription(album.description || '')
        if (album.cover && album.cover !== 'No Cover') {
          setAlbumCover(album.cover)
        } else if (transformedTracks.length > 0) {
          setAlbumCover(transformedTracks[0].cover || null)
        }
        const artists = Array.from(new Set(transformedTracks.map(s => s.artist || s.singer).filter(Boolean)))
        setArtistName(artists.length > 0 ? artists.join(', ') : 'Unknown Artist')
      } else {
        setError('Album not found.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load album.')
    } finally {
      setLoading(false)
    }
  }, [albumId])

  useEffect(() => { if (albumId) loadAlbum() }, [albumId, loadAlbum])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true') {
      setShowEditModal(true);
    }
  }, []);
  const handlePlaySong = (song) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:required'))
      return
    }
    const currentId = (state.currentSong?.id || state.currentSong?._id)
    const songId = song.id || song._id
    if (currentId === songId) {
      dispatch(createMusicAction(MUSIC_ACTIONS.TOGGLE_PLAY))
    } else {
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_CURRENT_SONG, song))
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_QUEUE, songs))
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_PLAYING, true))
    }
  }

  const handleSaveAlbum = async () => {
    if (!isAuthenticated) { window.dispatchEvent(new CustomEvent('auth:required')); return }
    try {
      setIsSaving(true)
      if (isSaved) {
        await deletePlaylist(savedAlbumPlaylist._id || savedAlbumPlaylist.id)
        showToast('Album removed from your library', 'success')
      } else {
        await playlistUtils.createPlaylist({ 
          name: albumName, 
          description: `Album by ${artistName}`, 
          isPublic: false, 
          audio: songs.map(s => s.id || s._id),
          originalId: albumId
        })
        showToast('Album saved to your library', 'success')
      }
      if (fetchPlaylists) fetchPlaylists()
    } catch (err) {
      console.error(err)
      showToast('Failed to save album', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAlbum = async () => {
    setIsDeleting(true)
    try {
      await albumUtils.deleteAlbumAPI(albumId)
      showToast('Album deleted successfully', 'success')
      navigate('/uploads')
    } catch (err) {
      console.error(err)
      showToast('Failed to delete album', 'error')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const isPlayingAlbum = state.queue?.length > 0 && songs.length > 0 && state.queue.length === songs.length && state.queue.every((s, i) => (s.id || s._id) === (songs[i].id || songs[i]._id))

  const handlePlayAlbum = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:required'))
      return
    }
    if (songs.length === 0) return
    
    if (isPlayingAlbum) {
      dispatch(createMusicAction(MUSIC_ACTIONS.TOGGLE_PLAY))
    } else {
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_QUEUE, songs))
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_CURRENT_SONG, songs[0]))
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_PLAYING, true))
    }
  }

  if (loading) return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <PuffLoader color="#7C3AED" size={60} />
      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading album...</p>
    </div>
  )

  if (error) return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <Disc className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">Go Home</button>
    </div>
  )

  const currentSongId = state.currentSong?.id || state.currentSong?._id

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Hero Header */}
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 to-gray-50 dark:from-purple-900/30 dark:to-gray-900">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
          
          {/* Cover Art */}
          <div 
            onClick={handlePlayAlbum}
            className="group relative w-44 h-44 sm:w-52 sm:h-52 shadow-2xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-lg cursor-pointer"
          >
            {albumCover
              ? <img src={albumCover} alt={albumName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              : <Disc className="w-20 h-20 text-gray-300 dark:text-gray-600 transition-transform duration-500 group-hover:scale-105" />}
            
            {/* Play Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlayingAlbum && state.isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button className="bg-purple-600 text-white rounded-full p-4 shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:bg-purple-500 hover:scale-105">
                {isPlayingAlbum && state.isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
            </div>
          </div>
          
          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Album</p>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{albumName}</h1>
            {albumDescription && albumDescription !== 'No Description' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-md">{albumDescription}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              By <span className="font-semibold text-gray-900 dark:text-gray-200">{artistName}</span>
              {' · '}<span>{songs.length} {songs.length === 1 ? 'track' : 'tracks'}</span>
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              {isAuthenticated && (
                <button onClick={handleSaveAlbum} disabled={isSaving}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all disabled:opacity-50 ${isSaved ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-200'}`}>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? '...' : isSaved ? 'Remove from Library' : 'Save to Library'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header row */}
        <div className="flex items-center gap-3 px-3 pb-2 mb-1 border-b border-gray-200 dark:border-gray-700">
          <span className="w-8 text-center text-xs text-gray-400">#</span>
          <span className="w-10 flex-shrink-0" />
          <span className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</span>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tracks in this album yet.</p>
          </div>
        ) : (
          <div className="space-y-0.5 mt-1">
            {songs.map((song, idx) => {
              const songId = song.id || song._id
              const isCurrent = currentSongId === songId
              return (
                <TrackRow
                  key={songId || idx}
                  song={song}
                  index={idx + 1}
                  isCurrentSong={isCurrent}
                  isPlaying={isCurrent && state.isPlaying}
                  onPlay={() => handlePlaySong(song, idx)}
                />
              )
            })}
          </div>
        )}
      </div>

      {showEditModal && albumData && (
        <EditAlbumModal 
          editAlbum={albumData} 
          onClose={() => {
            setShowEditModal(false)
            loadAlbum()
          }} 
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAlbum}
        title="Delete Album"
        message={`Are you sure you want to delete "${albumName}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  )
}
