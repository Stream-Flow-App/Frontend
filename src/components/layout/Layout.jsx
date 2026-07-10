import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useMusic } from "../../context/MusicContext"
import Sidebar from "../sidebars/Sidebar"
import ArtistSidebar from "../sidebars/ArtistSidebar"
import Navbar from "../navbar/Navbar"
import RightSidebar from "../sidebars/RightSidebar"
import AudioPlayer from '../audioPlayer/AudioPlayer'
import MusicErrorBoundary from '../errorBoundary/MusicErrorBoundary'
import { AudioPlayerSkeleton } from '../loading/LoadingStates'
import PlaylistSelectionModal from '../modals/PlaylistSelectionModal'
import { transformApiSong } from '../../utils/apiUtils'

export default function Layout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { state, dispatch, fetchPlaylists, fetchFavorites } = useMusic()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  // Check if there's a current song to determine if audio player should be shown
  const hasCurrentSong = !!state.currentSong
  const isAudioLoading = hasCurrentSong && state.isSkipping

  // Load last playback state from user
  useEffect(() => {
    if (user?.lastPlayback?.songId && typeof user.lastPlayback.songId === 'object' && !state.currentSong) {
      const transformedSong = transformApiSong(user.lastPlayback.songId)
      dispatch({ type: 'SET_CURRENT_SONG', payload: transformedSong })
      dispatch({ type: 'SET_TIME', payload: user.lastPlayback.currentTime || 0 })
      dispatch({ type: 'SET_PLAYING', payload: false })
      
      if (user.lastPlayback.queue && Array.isArray(user.lastPlayback.queue)) {
        const transformedQueue = user.lastPlayback.queue.map(song => transformApiSong(song)).filter(Boolean)
        dispatch({ type: 'SET_QUEUE', payload: transformedQueue })
      }
    }
  }, [user, state.currentSong, dispatch])

  // Fetch initial user data (Playlists and Favorites)
  useEffect(() => {
    if (isAuthenticated) {
      if (state.playlists.length === 0) {
        fetchPlaylists?.();
      }
      if (state.favorites.length === 0) {
        fetchFavorites?.();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MusicErrorBoundary 
        fallbackMessage="There was an issue with the navigation"
        onReset={() => {
          setIsSidebarOpen(false)
          setIsRightSidebarOpen(false)
        }}
      >
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          isAuthenticated={isAuthenticated}
          authLoading={authLoading}
        />
      </MusicErrorBoundary>

      <div className="flex flex-1 overflow-hidden">
        <MusicErrorBoundary fallbackMessage="There was an issue with the sidebar">
          {user?.role === 'artist' ? (
            <ArtistSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          ) : (
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          )}
        </MusicErrorBoundary>
        
        {/* Main content with padding bottom when audio player is visible */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col ${
          hasCurrentSong ? 'pb-36 sm:pb-24 lg:pb-24' : ''
        }`}>
          <div className="p-3 sm:p-4 lg:p-6 flex-1">
            <MusicErrorBoundary 
              fallbackMessage="There was an issue loading this page"
              onReset={() => {}}
            >
              <Outlet context={{ 
                isAuthenticated, 
                authLoading 
              }} />
            </MusicErrorBoundary>
          </div>
          
          {/* Small Footer */}
          <footer className="w-full py-4 px-6 text-center text-xs text-gray-500 dark:text-gray-500 mt-auto opacity-70">
            <p className="flex items-center justify-center gap-1 flex-wrap">
              &copy; {new Date().getFullYear()} StreamFlow. Built by{' '}
              <a href="https://github.com/Zack-River" target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                Rivers
              </a>
              {' '}&amp;{' '}
              <span className="flex items-center gap-1">
                <a href="https://www.linkedin.com/in/ziadseleem" target="_blank" rel="noreferrer" className="text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                  Ziad Seleem
                </a>
                <a href="https://github.com/ziad328" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  (GitHub)
                </a>
              </span>.
            </p>
            <p className="mt-1">
              Ideas or bugs?{' '}
              <a href="https://github.com/Stream-Flow-App" target="_blank" rel="noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors">
                Visit the StreamFlow Org
              </a>.
            </p>
          </footer>
        </main> 
        
        {/* Right sidebar only shown on larger screens by default */}
        <div className="hidden lg:block">
          <MusicErrorBoundary fallbackMessage="There was an issue with the queue">
            <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
          </MusicErrorBoundary>
        </div>
        
        {/* Right sidebar as overlay on smaller screens */}
        <div className="lg:hidden">
          {isRightSidebarOpen && (
            <MusicErrorBoundary fallbackMessage="There was an issue with the queue">
              <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)} />
            </MusicErrorBoundary>
          )}
        </div>
      </div>
      
      {/* Fixed Audio Player - positioned to hover at viewport bottom */}
      {hasCurrentSong && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 max-w-7xl mx-auto z-50 transition-all duration-300">
          <MusicErrorBoundary 
            fallbackMessage="There was an issue with the audio player"
            onReset={() => {
              // Reset audio player state if needed
              window.location.reload()
            }}
          >
            {isAudioLoading ? (
              <AudioPlayerSkeleton />
            ) : (
              <AudioPlayer 
                onToggleRightSidebar={toggleRightSidebar} 
                isRightSidebarOpen={isRightSidebarOpen} 
              />
            )}
          </MusicErrorBoundary>
        </div>
      )}

      {/* Modals */}
      <PlaylistSelectionModal />
    </div>
  )
}