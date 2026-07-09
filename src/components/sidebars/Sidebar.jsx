import { useState, useEffect, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { Library, Plus, Heart, X, Upload, ListMusic, ShieldAlert, Info, Shield, HelpCircle } from "lucide-react"
import UploadModal from "../uploads/UploadModal"
import { useMusic } from "../../context/MusicContext"
import { useAuth } from "../../context/AuthContext"

// Create Playlist Modal Component
const CreatePlaylistModal = ({ isOpen, onClose, onCreatePlaylist }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setName("")
      setDescription("")
      setIsPublic(false)
      onClose()
    }, 300)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, handleClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onCreatePlaylist(name.trim(), description.trim(), isPublic)
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-[60] p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl mt-8 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Create Playlist</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm dark:text-white placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Make playlist public
            </label>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Playlist
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320) // Default width
  const [isResizing, setIsResizing] = useState(false)
  const location = useLocation()
  const { state, createPlaylist } = useMusic()
  const { isAuthenticated, user } = useAuth()

  const startResizing = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX
      if (newWidth >= 320 && newWidth <= 400) {
        setSidebarWidth(newWidth)
      } else if (newWidth < 320) {
        setSidebarWidth(320)
      } else if (newWidth > 400) {
        setSidebarWidth(400)
      }
    }
  }, [isResizing])

  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])


  const libraryItems = [
    { path: "/favorites", icon: Heart, label: "Liked Songs" },
  ]

  if (user?.role === 'admin' || user?.role === 'moderator') {
    libraryItems.push({ path: "/admin", icon: ShieldAlert, label: "Admin Dashboard" })
  }

  const handleMobileClose = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  const isActive = (path) => location.pathname === path

  const handleCreatePlaylist = (name, description, isPublic) => {
    createPlaylist(name, description, isPublic)
  }

  return (
    <>
      {/* MOBILE: Full-screen overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={onClose} />}

      {/* MOBILE-FIRST: Reduced width and padding on mobile */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-[60] lg:z-0
          w-80 sm:w-72
          bg-gray-50 dark:bg-gray-900 
          border-r border-gray-200/50 dark:border-transparent
          transform ${isResizing ? '' : 'transition-all duration-200 ease-in-out'} shadow-2xl
          px-4 py-3 sm:px-6 sm:py-4
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full
        `}
        style={{ width: window.innerWidth >= 1024 ? sidebarWidth : undefined }}
      >
        {/* Resizer Handle */}
        <div
          onMouseDown={startResizing}
          className={`hidden lg:flex absolute top-0 bottom-0 right-0 w-2 cursor-col-resize z-50 bg-white dark:bg-black items-center justify-center group`}
        >
          <div className={`w-[1px] h-full bg-black/30 dark:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isResizing ? '!opacity-100' : ''}`} />
        </div>
        <div className="flex flex-col h-full min-h-0">
          {/* MOBILE: Header with close button */}
          <div className="py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Library className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Library</h2>
              </div>
              {/* MOBILE: Close button visible on mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center mt-12 space-y-4">
              <Library className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log in to view your library</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Save your favorite songs and create playlists.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('auth:required'))}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
              >
                Log In
              </button>
            </div>
          ) : (
            <>
              {/* MOBILE: Library Items with better touch targets */}
              <div className="py-2">
                <nav className="space-y-1">
                  {libraryItems.map((item) => (
                    <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileClose}
                  className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 w-full text-left min-h-[48px] ${isActive(item.path)
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* MOBILE: Playlists section */}
          <div className="py-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Playlists ({state.playlists?.length || 0})
              </h3>
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full duration-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Create new playlist"
                aria-label="Create new playlist"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <nav className="space-y-1 overflow-y-auto flex-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:dark:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
              {state.playlists?.map((playlist) => (
                <Link
                  key={playlist._id || playlist.id}
                  to={`/playlist/${playlist._id || playlist.id}`}
                  onClick={handleMobileClose}
                  className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 w-full text-left min-h-[48px] ${isActive(`/playlist/${playlist._id || playlist.id}`)
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <ListMusic className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate text-sm sm:text-base">{playlist.name}</span>
                    {((playlist.audio && playlist.audio.length > 0) || (playlist.songs && playlist.songs.length > 0)) && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {playlist.audio?.length || playlist.songs?.length || 0} song{(playlist.audio?.length || playlist.songs?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          </>
          )}



          {/* Quick Links for Mobile */}
          <div className="sm:hidden mt-auto pt-4 pb-2 px-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <nav className="space-y-1">
              <Link
                to="/about"
                onClick={handleMobileClose}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive('/about')
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                <Info className="w-5 h-5" />
                <span className="font-medium text-sm">About Us</span>
              </Link>
              <Link
                to="/privacy"
                onClick={handleMobileClose}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive('/privacy')
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">Privacy Policy</span>
              </Link>
              <Link
                to="/support"
                onClick={handleMobileClose}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive('/support')
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Support</span>
              </Link>
            </nav>
          </div>

          {/* MOBILE: Bottom spacing for better UX */}
          <div className="pb-36 lg:pb-20 flex-shrink-0">
            {/* Intentional spacing for mobile audio player */}
          </div>
        </div>
      </div>



      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </>
  )
}