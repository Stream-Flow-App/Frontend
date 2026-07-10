import React from 'react'
import { useSongCard } from '../../hooks/useSongCard'
import { formatArtists, formatTime } from '../../utils/songDisplayUtils'
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
  const displayDuration = typeof song.duration === 'number' ? formatTime(song.duration) : (song.duration || "0:00")
  const displayGenre = song.genre

  return (
    <>
      <div
        className={`glass-panel rounded-3xl p-3 sm:p-4 song-card-hover group ${
          !isEditMode ? 'cursor-pointer' : ''
        } ${isCurrentSong ? 'ring-2 ring-aurora-violet ring-opacity-50' : ''}`}
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
          status={song.status}
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