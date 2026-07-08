import React from 'react'
import { useSongCard } from '../../hooks/useSongCard'
import { formatArtists } from '../../utils/songDisplayUtils'
import SongCover from './SongCover'
import SongInfo from './SongInfo'
import SongMenu from './SongMenu'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function SongCard({
  song,
  isEditMode = false,
  onEditClick = null,
  onAuthRequired = null,
  playlist = [],
  playlistName = null
}) {
  const songCardHook = useSongCard(song, onAuthRequired, playlist)
  
  const {
    isHovered,
    setIsHovered,
    showMenu,
    setShowMenu,
    showDeleteConfirm,
    setShowDeleteConfirm,
    menuRef,
    songId,
    isCurrentSong,
    isPlaying,
    isFavorite,
    isUploaded,
    isInQueue,
    guardedPlaySong,
    guardedToggleFavorite,
    handleMenuOption,
    confirmDelete,
    isAuthenticated
  } = songCardHook

  // Event handlers - FIXED: Ensure proper event handling
  const handleCardClick = (e) => {
    // Prevent if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return
    }
    
    if (!isEditMode) {
      console.log('SongCard clicked:', song.title) // Debug log
      guardedPlaySong()
    }
  }

  const handlePlayPause = (e) => {
    e.stopPropagation()
    console.log('Play/Pause clicked:', song.title) // Debug log
    guardedPlaySong()
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    guardedToggleFavorite()
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    if (onEditClick) {
      onEditClick(song)
    }
  }

  // Display properties
  const displayTitle = song.title || "Unknown Title"
  const rawArtist = song.artist || song.singer || "Unknown Artist"
  const displayArtist = formatArtists(rawArtist)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const rawCover = song.cover || song.coverImageUrl;
  const displayCover = rawCover
      ? rawCover.startsWith('/uploads/') ? `${API_BASE}${rawCover}` : rawCover
      : "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover"
  const displayDuration = song.duration || "0:00"
  const displayGenre = song.genre

  return (
    <>
      <div
        className={`bg-white/90 dark:bg-white/5 backdrop-blur-md rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform hover:scale-[1.03] hover:-translate-y-1 border border-gray-100/50 dark:border-white/10 group ${
          !isEditMode ? 'cursor-pointer' : ''
        } ${isCurrentSong ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        title={!isEditMode ? (isAuthenticated ? (isPlaying ? "Pause" : "Play") : "Sign in to play music") : undefined}
      >
        <SongCover
          displayCover={displayCover}
          displayTitle={displayTitle}
          isUploaded={isUploaded}
          displayGenre={displayGenre}
          isInQueue={isInQueue}
          isCurrentSong={isCurrentSong}
          isEditMode={isEditMode}
          isHovered={isHovered}
          isPlaying={isPlaying}
          isAuthenticated={isAuthenticated}
          isFavorite={isFavorite}
          onEditClick={handleEditClick}
          onPlayPause={handlePlayPause}
          onFavorite={handleFavorite}
        />

        <SongInfo
          displayTitle={displayTitle}
          displayArtist={displayArtist}
          rawArtist={rawArtist}
          displayDuration={displayDuration}
          isCurrentSong={isCurrentSong}
          isEditMode={isEditMode}
          isAuthenticated={isAuthenticated}
          showMenu={showMenu}
          menuRef={menuRef}
          onMenuToggle={handleMenuToggle}
          onMenuOption={handleMenuOption}
          onAuthRequired={onAuthRequired}
          isInQueue={isInQueue}
          isUploaded={isUploaded}
        />
      </div>

      <DeleteConfirmModal
        show={showDeleteConfirm}
        songTitle={displayTitle}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}