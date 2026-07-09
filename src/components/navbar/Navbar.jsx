import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { useMusic } from "../../context/MusicContext"
import { ToastContainer, useToast } from "../common/Toast"
import { searchSongs } from "../../utils/apiUtils"
import { useDebouncedCallback } from "../../hooks/useDebounce"
import { PuffLoader } from 'react-spinners'
import logoImage from "../../assets/logo_transparent.png"
import { Search, Home, Menu, Sun, Moon, User, Settings, LogOut, X, ShieldAlert, Play, Disc, Info, Shield, HelpCircle } from "lucide-react"
import AuthenticationModals from "../authentication/AuthenticationModals"

const getMediaUrl = (url) => {
  if (!url || url === 'No Profile Picture' || url.includes('default-profile')) return null;
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${url}`;
};

const SearchDropdown = ({ isOpen, results, onClose, navigate, dispatch, isAuthenticated }) => {
  if (!isOpen || (results.songs.length === 0 && results.albums.length === 0 && results.users.length === 0 && results.playlists.length === 0)) return null;

  const handlePlaySong = (song) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event('auth:required'));
      return;
    }
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
    dispatch({ type: 'SET_PLAYING', payload: true });
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[70vh] overflow-y-auto z-50 p-4 custom-scrollbar">
      {/* Albums */}
      {results.albums.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Albums</h3>
          {results.albums.map(album => (
            <button key={album} onClick={() => { navigate(`/album/${album}`); onClose(); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors">
              <Disc className="w-8 h-8 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">{album}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Profiles */}
      {results.users.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Profiles</h3>
          {results.users.map(user => (
            <button key={user._id || user.id} onClick={() => { navigate(`/profile/${user.username || user._id}`); onClose(); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden">
                {getMediaUrl(user.profileImg) ? <img src={getMediaUrl(user.profileImg)} className="w-full h-full object-cover"/> : <User className="w-4 h-4 text-purple-600"/>}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">@{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Songs */}
      {results.songs.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Songs</h3>
          {results.songs.map(song => {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const rawCover = song.cover || song.coverImageUrl;
            const displayCover = rawCover
                ? rawCover.startsWith('/uploads/') ? `${API_BASE}${rawCover}` : rawCover
                : "https://placehold.co/200x200/EFEFEF/AAAAAA?text=Song+Cover";
            
            return (
            <button key={song._id || song.id} onClick={() => handlePlaySong(song)} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 group transition-colors">
              <img src={displayCover} className="w-8 h-8 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{song.title}</div>
                <div className="text-xs text-gray-500 truncate">{song.artist || song.singer}</div>
              </div>
              <Play className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            )
          })}
        </div>
      )}
      
      {/* Playlists */}
      {results.playlists.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Playlists</h3>
          {results.playlists.map(playlist => (
            <button key={playlist._id || playlist.id} onClick={() => { navigate(`/playlist/${playlist._id || playlist.id}`); onClose(); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl flex items-center space-x-3 transition-colors">
              <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <Menu className="w-4 h-4 text-gray-500" />
              </div>
              <div className="font-medium text-gray-900 dark:text-white truncate">{playlist.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onMenuClick, onSearch, searchQuery, authLoading }) {
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const [showUserMenuDesktop, setShowUserMenuDesktop] = useState(false)
  const [showUserMenuMobile, setShowUserMenuMobile] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")
  const [isSearching, setIsSearching] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { dispatch } = useMusic()
  
  const [searchResults, setSearchResults] = useState({ songs: [], playlists: [], users: [], albums: [] })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Separate refs for desktop and mobile
  const userMenuDesktopRef = useRef(null)
  const userMenuButtonDesktopRef = useRef(null)
  const userMenuMobileRef = useRef(null)
  const userMenuButtonMobileRef = useRef(null)
  const searchInputRef = useRef(null)
  const desktopSearchInputRef = useRef(null)

  // Enhanced Toast hook with FIFO queue (max 4 toasts)
  const {
    toasts,
    removeToast,
    showGoodbyeToast,
    showWelcomeToast,
    showRegistrationToast,
    showAuthToast
  } = useToast(4)

  // Check if current page is home
  const isHome = location.pathname === '/' || location.pathname === '/browse'
  const isAbout = location.pathname === '/about'
  const isPrivacy = location.pathname === '/privacy'
  const isSupport = location.pathname === '/support'

  // Debounced search callback - only triggers after 500ms of no typing
  const [debouncedSearch, cancelDebouncedSearch] = useDebouncedCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults({ songs: [], playlists: [], users: [], albums: [] })
        setIsDropdownOpen(false)
        setIsSearching(false)
        if (onSearch) onSearch("")
        return
      }
      setIsSearching(true)
      if (onSearch) onSearch(query)
      try {
        const results = await searchSongs(query, { limit: 5 })
        const albums = Array.from(new Set(results.songs.map(s => s.album).filter(Boolean))).slice(0, 3)
        setSearchResults({
          songs: results.songs.slice(0, 5),
          playlists: results.playlists.slice(0, 3),
          users: results.users.slice(0, 3),
          albums: albums
        })
        setIsDropdownOpen(true)
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setIsSearching(false)
      }
    },
    500
  )

  // Update local search query when prop changes (external updates)
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "")
  }, [searchQuery])

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both desktop menu button and menu itself
      const isDesktopOutsideClick =
        userMenuDesktopRef.current &&
        !userMenuDesktopRef.current.contains(event.target) &&
        userMenuButtonDesktopRef.current &&
        !userMenuButtonDesktopRef.current.contains(event.target)

      // Check if click is outside both mobile menu button and menu itself
      const isMobileOutsideClick =
        userMenuMobileRef.current &&
        !userMenuMobileRef.current.contains(event.target) &&
        userMenuButtonMobileRef.current &&
        !userMenuButtonMobileRef.current.contains(event.target)

      // Close menu if click is outside for either desktop or mobile
      if (isDesktopOutsideClick) {
        setShowUserMenuDesktop(false)
      }

      if (isMobileOutsideClick) {
        setShowUserMenuMobile(false)
      }

      // Close dropdown if click outside
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideMobileInput = !searchInputRef.current || !searchInputRef.current.contains(event.target);
      const isOutsideDesktopInput = !desktopSearchInputRef.current || !desktopSearchInputRef.current.contains(event.target);

      if (isDropdownOpen && isOutsideDropdown && isOutsideMobileInput && isOutsideDesktopInput) {
        setIsDropdownOpen(false)
      }

      // Close mobile search if click is outside
      if (isMobileSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)) {
        closeMobileSearch()
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowUserMenuDesktop(false)
        setShowUserMenuMobile(false)
        if (isMobileSearchOpen) {
          closeMobileSearch()
        }
      }
    }

    if (showUserMenuDesktop || showUserMenuMobile || isMobileSearchOpen || isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserMenuDesktop, showUserMenuMobile, isMobileSearchOpen, isDropdownOpen])

  useEffect(() => {
    const handleAuthRequired = () => {
      setAuthMode("signin")
      setShowAuthModal(true)
    }
    
    window.addEventListener('auth:required', handleAuthRequired)
    
    return () => {
      window.removeEventListener('auth:required', handleAuthRequired)
    }
  }, [])

  // Toggle user menu with proper event handling
  const toggleUserMenuDesktop = (event) => {
    event.stopPropagation();
    setShowUserMenuDesktop(prev => !prev);
    setShowUserMenuMobile(false); // Ensure mobile menu is closed
  }

  const toggleUserMenuMobile = (event) => {
    event.stopPropagation();
    setShowUserMenuMobile(prev => !prev);
    setShowUserMenuDesktop(false); // Ensure desktop menu is closed
  }

  const handleSignInClick = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
    setShowUserMenuDesktop(false)
    setShowUserMenuMobile(false)
  }

  const handleSignUpClick = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
    setShowUserMenuDesktop(false)
    setShowUserMenuMobile(false)
  }

  const handleLogout = async () => {
    setShowUserMenuDesktop(false)
    setShowUserMenuMobile(false)
    try {
      await logout()
      showGoodbyeToast()
    } catch (error) {
      console.error('Logout error:', error)
      // Logout should still work even if there's an error
      showGoodbyeToast()
    }
  }

  // Handle search input changes with debouncing
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setLocalSearchQuery(value)

    if (value.trim()) {
      setIsSearching(true)
      debouncedSearch(value)
    } else {
      // Immediate clear when search is empty
      if (cancelDebouncedSearch) cancelDebouncedSearch()
      setSearchResults({ songs: [], playlists: [], users: [], albums: [] })
      setIsDropdownOpen(false)
      setIsSearching(false)
      if (onSearch) {
        onSearch("")
      }
    }
  }

  const clearSearch = () => {
    if (cancelDebouncedSearch) cancelDebouncedSearch()
    setLocalSearchQuery("")
    setSearchResults({ songs: [], playlists: [], users: [], albums: [] })
    setIsDropdownOpen(false)
    setIsSearching(false)
    if (onSearch) {
      onSearch("")
    }
  }

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true)
    setShowUserMenuDesktop(false)
    setShowUserMenuMobile(false)
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
    // Clear search when closing mobile search
    clearSearch()
  }

  const handleAuthSuccess = (userData, isRegistration = false) => {
    console.log('Authentication successful:', userData)

    // Show appropriate welcome toast
    if (isRegistration) {
      showRegistrationToast(userData?.username || userData?.name)
    } else {
      showWelcomeToast(userData?.username || userData?.name)
    }
  }

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-md sticky top-0 z-30">
        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="lg:hidden absolute inset-0 bg-white dark:bg-gray-800 z-40 flex items-center justify-center px-4 py-4">
            <div className="relative flex max-w-full">
              {/* Search Icon with loading state */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                {isSearching ? (
                  <PuffLoader
                    color="#7C3AED"
                    size={16}
                    loading={true}
                  />
                ) : (
                  <Search className="text-black dark:text-gray-400 w-5 h-5" />
                )}
              </div>

              <input
                ref={searchInputRef}
                type="text"
                placeholder={isSearching ? "Searching..." : "Search songs, artists, genres..."}
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                className={`w-full pl-12 pr-12 py-2 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-gray-500/5 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 ${isSearching ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                  }`}
              />

              <button
                onClick={closeMobileSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div ref={dropdownRef}>
                <SearchDropdown 
                  isOpen={isDropdownOpen} 
                  results={searchResults} 
                  onClose={() => { setIsDropdownOpen(false); closeMobileSearch(); }} 
                  navigate={navigate} 
                  dispatch={dispatch} 
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 transition-opacity duration-300 ${isMobileSearchOpen ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            {/* Mobile Layout: Menu - Search - Logo - Theme - Auth */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Left: Menu + Search Icon */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onMenuClick}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button
                  onClick={openMobileSearch}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              {/* Center: Logo + App Name */}
              <Link to="/" className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-bl from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  StreamFlow
                </span>
              </Link>

              {/* Right: Theme + Auth */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Mobile Auth */}
                {!isAuthenticated ? (
                  <div className="flex items-center">
                    {authLoading ? (
                      <div className="p-2">
                        <PuffLoader
                          color="#7C3AED"
                          size={20}
                          loading={true}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={handleSignInClick}
                        className="px-2 py-2 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-sm"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      ref={userMenuButtonMobileRef}
                      onClick={toggleUserMenuMobile}
                      className="flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
                      title={`Logged in as ${user?.username || user?.name || 'User'}`}
                    >
                      {getMediaUrl(user?.profileImg) ? (
                        <img
                          src={getMediaUrl(user.profileImg)}
                          alt={user.username || user.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-purple-400 dark:border-purple-600 group-hover:border-purple-600 dark:group-hover:border-purple-800 transition-colors"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-700 group-hover:via-purple-700 group-hover:to-blue-700 transition-all duration-300">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Mobile User Menu */}
                    {showUserMenuMobile && (
                      <div
                        ref={userMenuMobileRef}
                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50"
                        style={{ top: '100%' }}
                      >
                        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.username || user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link to="/profile" onClick={() => setShowUserMenuMobile(false)} >
                          <div
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </div>
                        </Link>
                        <Link to="/settings" onClick={() => setShowUserMenuMobile(false)} >
                          <button
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </button>
                        </Link>

                        <hr className="my-2 border-gray-200/50 dark:border-gray-700/50 mx-4" />

                        <button
                          onClick={handleLogout}
                          disabled={authLoading}
                          className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left disabled:opacity-50 group"
                        >
                          {authLoading ? (
                            <>
                              <PuffLoader
                                color="#DC2626"
                                size={14}
                                loading={true}
                              />
                              <span className="ml-3">Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-3" />
                              Logout
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout: Logo - Home - Search - Theme - Auth */}
            <div className="hidden lg:flex items-center justify-between w-full space-x-5">
              {/* Left side: Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-3 mr-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                    <img src={logoImage} alt="logo" />
                  </div>
                  <span className="font-bold text-2xl bg-gradient-to-bl from-purple-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                    StreamFlow
                  </span>
                </Link>
              </div>

              {/* Center - Home Icon and Search Bar */}
              <div className="flex items-center space-x-4 flex-1 justify-center max-w-2xl">
                <Link
                  to="/"
                  className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isHome
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                >
                  <Home className="w-5 h-5" />
                </Link>


                <div className="relative flex-1 max-w-lg">
                  {/* Search Icon with loading state */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {isSearching ? (
                      <PuffLoader
                        color="#7C3AED"
                        size={16}
                        loading={true}
                      />
                    ) : (
                      <Search className="text-black dark:text-gray-400 w-5 h-5" />
                    )
                    }
                  </div>

                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    placeholder={isSearching ? "Searching..." : "Search songs, artists, genres..."}
                    value={localSearchQuery}
                    onChange={handleSearchInputChange}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl border-gray-500/5 border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-purple-100 dark:focus:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 ${isSearching ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                      }`}
                  />

                  {localSearchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div ref={dropdownRef}>
                    <SearchDropdown 
                      isOpen={isDropdownOpen} 
                      results={searchResults} 
                      onClose={() => setIsDropdownOpen(false)} 
                      navigate={navigate} 
                      dispatch={dispatch} 
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                </div>
              </div>

              {/* Right side: Theme + Auth */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Desktop Authentication buttons or User menu */}
                {!isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    {authLoading ? (
                      <div className="flex items-center space-x-3 px-4 py-2">
                        <PuffLoader
                          color="#7C3AED"
                          size={20}
                          loading={true}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleSignUpClick}
                          className="px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-300 font-medium"
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={handleSignInClick}
                          className="px-4 py-2 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      ref={userMenuButtonDesktopRef}
                      onClick={toggleUserMenuDesktop}
                      className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group"
                      title={`Logged in as ${user?.username || user?.name || 'User'}`}
                    >
                      {getMediaUrl(user?.profileImg) ? (
                        <img
                          src={getMediaUrl(user.profileImg)}
                          alt={user.username || user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 dark:border-purple-600 group-hover:border-purple-600 dark:group-hover:border-purple-800 transition-colors"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-700 group-hover:via-purple-700 group-hover:to-blue-700 transition-all duration-300 group-hover:shadow-xl">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {user?.username || user?.name || 'User'}
                      </span>
                    </button>

                    {/* Desktop User Menu */}
                    {showUserMenuDesktop && (
                      <div
                        ref={userMenuDesktopRef}
                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-3 z-50"
                        style={{ top: '100%' }}
                      >
                        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.username || user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link to="/profile" onClick={() => setShowUserMenuDesktop(false)} >
                          <button
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </button>
                        </Link>
                        {(user?.role === 'admin' || user?.role === 'moderator') && (
                          <Link to="/admin" onClick={() => setShowUserMenuDesktop(false)} >
                            <button
                              className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left text-purple-600 dark:text-purple-400"
                            >
                              <ShieldAlert className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </button>
                          </Link>
                        )}
                        <Link to="/settings" onClick={() => setShowUserMenuDesktop(false)} >
                          <button
                            className="flex items-center px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl mx-2 w-11/12 text-left"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </button>
                        </Link>

                        <hr className="my-2 border-gray-200/50 dark:border-gray-700/50 mx-4" />

                        <button
                          onClick={handleLogout}
                          disabled={authLoading}
                          className="flex items-center px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors rounded-xl mx-2 w-11/12 text-left disabled:opacity-50 group"
                        >
                          {authLoading ? (
                            <>
                              <PuffLoader
                                color="#DC2626"
                                size={14}
                                loading={true}
                              />
                              <span className="ml-3">Logging out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4 mr-3" />
                              Logout
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthenticationModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        showAuthToast={showAuthToast}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  )
}