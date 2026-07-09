import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useMusic } from '../context/MusicContext'
import { useAuth } from '../context/AuthContext'
import { useAuthGuard } from '../utils/authGuardUtils'
import { showErrorToast, showSuccessToast } from '../utils/toastUtils'
import { MUSIC_ACTIONS, createMusicAction } from '../context/MusicContext'
import { deleteAudioAPI } from '../utils/apiUtils'

export const useSongCard = (song, onAuthRequired, playlist = []) => {
  const { state, dispatch, openPlaylistModal, handleToggleFavorite } = useMusic()
  const { isAuthenticated } = useAuth()
  const { guardPlayAction, guardFavoriteAction, createGuardedAction } = useAuthGuard(isAuthenticated, onAuthRequired)

  // Local state
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef(null)

  // Computed values
  const songId = song.id || song._id
  const isCurrentSong = state.currentSong && (state.currentSong.id || state.currentSong._id) === songId
  const isPlaying = isCurrentSong && state.isPlaying
  const isFavorite = state.favorites.some((fav) => (fav.id || fav._id) === songId)
  const isUploaded = song.isUploaded || false
  const isInQueue = state.queue.some((queueSong) => (queueSong.id || queueSong._id) === songId)

  // Normalized song object
  const normalizedSong = useMemo(() => ({
    id: songId,
    title: song.title,
    artist: song.artist || song.singer,
    album: song.album,
    duration: song.duration,
    cover: song.cover || song.coverImageUrl,
    url: song.url || song.audioUrl,
    isUploaded: isUploaded,
    genre: song.genre,
    category: song.category
  }), [
    songId, song.title, song.artist, song.singer, song.album, 
    song.duration, song.cover, song.coverImageUrl, song.url, 
    song.audioUrl, isUploaded, song.genre, song.category
  ])

  // Menu handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [showMenu])

  // FIXED: Core actions with proper state management
  const playSongCore = useCallback(() => {
    console.log('playSongCore called for:', song.title) // Debug log
    
    if (isCurrentSong && state.queue.length > 1) {
      // If it's the current song and queue is already populated, just toggle play/pause
      console.log('Toggling current song:', isPlaying ? 'pause' : 'play') // Debug log
      dispatch(createMusicAction(MUSIC_ACTIONS.TOGGLE_PLAY))
    } else {
      // If it's a different song OR the queue is empty (e.g. after page load), populate queue and play
      console.log('Playing song and setting queue:', song.title) // Debug log
      if (playlist.length > 0) {
        dispatch(createMusicAction(MUSIC_ACTIONS.PLAY_SONG, { 
          song: normalizedSong, 
          playlist, 
          shouldShuffle: state.isShuffled 
        }))
      } else {
        dispatch(createMusicAction(MUSIC_ACTIONS.PLAY_SONG, { 
          song: normalizedSong, 
          playlist: [normalizedSong], 
          shouldShuffle: state.isShuffled 
        }))
      }
    }
  }, [isCurrentSong, isPlaying, playlist, normalizedSong, state.isShuffled, state.queue.length, dispatch, song.title])

  const toggleFavoriteCore = useCallback(async () => {
    if (isFavorite) {
      showSuccessToast(`Removed "${song.title}" from favorites`)
    } else {
      showSuccessToast(`Added "${song.title}" to favorites`)
    }
    await handleToggleFavorite(normalizedSong)
  }, [isFavorite, song.title, normalizedSong, handleToggleFavorite])

  // Guarded actions - FIXED: Ensure proper error handling
  const guardedPlaySong = guardPlayAction ? guardPlayAction(playSongCore, {
    errorMessage: 'You must be signed in to play music.',
    authMode: 'signin'
  }) : playSongCore

  const guardedToggleFavorite = guardFavoriteAction ? guardFavoriteAction(toggleFavoriteCore, {
    errorMessage: 'You must be signed in to add favorites.',
    authMode: 'signin'
  }) : toggleFavoriteCore

  // Menu actions
  const handleMenuOption = useCallback((action, e) => {
    e.stopPropagation()
    setShowMenu(false)

    const guardedAddToQueueAction = createGuardedAction ? createGuardedAction(() => {
      try {
        dispatch(createMusicAction(MUSIC_ACTIONS.ADD_TO_QUEUE, normalizedSong))
        showSuccessToast(`"${song.title}" added to queue`)
      } catch (error) {
        console.error('Failed to add song to queue:', error)
        showErrorToast('Failed to add song to queue')
      }
    }, {
      errorMessage: 'You must be signed in to add songs to queue.',
      authMode: 'signin'
    }) : () => {
      dispatch(createMusicAction(MUSIC_ACTIONS.ADD_TO_QUEUE, normalizedSong))
      showSuccessToast(`"${song.title}" added to queue`)
    }

    const guardedPlayNextAction = createGuardedAction ? createGuardedAction(() => {
      const currentIndex = state.queueIndex
      if (currentIndex >= 0 && currentIndex < state.queue.length - 1) {
        const newQueue = [...state.queue]
        newQueue.splice(currentIndex + 1, 0, normalizedSong)
        dispatch(createMusicAction(MUSIC_ACTIONS.SET_QUEUE, newQueue))
        showSuccessToast(`"${song.title}" will play next`)
      } else {
        dispatch(createMusicAction(MUSIC_ACTIONS.ADD_TO_QUEUE, normalizedSong))
        showSuccessToast(`"${song.title}" added to queue`)
      }
    }, {
      errorMessage: 'You must be signed in to manage queue.',
      authMode: 'signin'
    }) : () => {
      const currentIndex = state.queueIndex
      if (currentIndex >= 0 && currentIndex < state.queue.length - 1) {
        const newQueue = [...state.queue]
        newQueue.splice(currentIndex + 1, 0, normalizedSong)
        dispatch(createMusicAction(MUSIC_ACTIONS.SET_QUEUE, newQueue))
        showSuccessToast(`"${song.title}" will play next`)
      } else {
        dispatch(createMusicAction(MUSIC_ACTIONS.ADD_TO_QUEUE, normalizedSong))
        showSuccessToast(`"${song.title}" added to queue`)
      }
    }

    const guardedPlaylistAction = createGuardedAction ? createGuardedAction(() => {
      openPlaylistModal(song)
    }, {
      errorMessage: 'You must be signed in to manage playlists.',
      authMode: 'signin'
    }) : () => {
      openPlaylistModal(song)
    }

    switch (action) {
      case "queue":
        guardedAddToQueueAction()
        break
      case "play-next":
        guardedPlayNextAction()
        break
      case "playlist":
        guardedPlaylistAction()
        break
      case "delete":
        if (isAuthenticated && isUploaded) {
          setShowDeleteConfirm(true)
        }
        break
      default:
        break
    }
  }, [
    normalizedSong, song, state.queueIndex, state.queue, 
    dispatch, isAuthenticated, isUploaded, createGuardedAction, openPlaylistModal
  ])

  // Delete confirmation
  const confirmDelete = useCallback(async () => {
    try {
      await deleteAudioAPI(songId)
    } catch (error) {
      console.error("Failed to delete song from server:", error)
      showErrorToast("Failed to delete song. Please try again.")
      return
    }

    if (isCurrentSong) {
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_CURRENT_SONG, null))
      dispatch(createMusicAction(MUSIC_ACTIONS.SET_PLAYING, false))
    }

    dispatch(createMusicAction(MUSIC_ACTIONS.REMOVE_UPLOAD, songId))

    if (isFavorite) {
      dispatch(createMusicAction(MUSIC_ACTIONS.REMOVE_FROM_FAVORITES, songId))
    }

    if (isInQueue) {
      const queueIndex = state.queue.findIndex(queueSong => (queueSong.id || queueSong._id) === songId)
      if (queueIndex !== -1) {
        dispatch(createMusicAction(MUSIC_ACTIONS.REMOVE_FROM_QUEUE, queueIndex))
      }
    }

    const audioUrl = song.url || song.audioUrl
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl)
    }

    showSuccessToast(`"${song.title}" deleted successfully`)
    setShowDeleteConfirm(false)
  }, [isCurrentSong, songId, isFavorite, isInQueue, state.queue, song, dispatch])

  return {
    // State
    isHovered,
    setIsHovered,
    showMenu,
    setShowMenu,
    showDeleteConfirm,
    setShowDeleteConfirm,
    menuRef,
    
    // Computed values
    songId,
    isCurrentSong,
    isPlaying,
    isFavorite,
    isUploaded,
    isInQueue,
    normalizedSong,
    
    // Actions
    guardedPlaySong,
    guardedToggleFavorite,
    handleMenuOption,
    confirmDelete,
    
    // Auth state
    isAuthenticated
  }
}