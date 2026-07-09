import { useEffect, useState, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import { User } from "lucide-react"
import { PuffLoader } from 'react-spinners'
import SongCard from "../songCard/SongCard.jsx"
import PlaylistCard from "../playlist/PlaylistCard.jsx"
import SongCardSkeleton from "../common/SongCardSkeleton.jsx"
import { ToastContainer, useToast } from "../common/Toast"
import {
  fetchSongsWithRetry,
  getUniqueGenres,
  getUniqueArtists,
  fetchPublicPlaylistsAPI
} from "../../utils/apiUtils.js"
import HeroSection from "./HeroSection.jsx"
import AuthenticationModals from "../authentication/AuthenticationModals.jsx"



// Component for horizontal scrolling tabs (Categories & Genres)
const ScrollableTabs = ({ items, selected, onSelect, labelMap = {} }) => {
  const scrollRef = useRef(null)
  
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }

  if (!items || items.length <= 1) return null;

  return (
    <div className="relative group flex items-center mb-6 w-full">
      <button onClick={() => scroll(-1)} className="absolute left-0 z-10 p-2 bg-gradient-to-r from-white dark:from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        ◀
      </button>
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-6 scroll-smooth w-full">
        {items.map(item => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex-shrink-0 shadow-sm ${
              selected === item 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {labelMap[item] || (item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1))}
          </button>
        ))}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 z-10 p-2 bg-gradient-to-l from-white dark:from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        ▶
      </button>
    </div>
  )
}

const ImageCardsScroll = ({ items, selected, onSelect, type }) => {
  const scrollRef = useRef(null)
  
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
    }
  }

  if (!items || items.length <= 1) return null;

  return (
    <div className="relative group flex items-center mb-6 w-full">
      <button onClick={() => scroll(-1)} className="absolute left-0 z-10 p-2 bg-gradient-to-r from-white/80 dark:from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity h-full">
        ◀
      </button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-2 py-2 scroll-smooth w-full">
        {items.map(item => {
          const isSelected = selected === item.name;
          const isCircle = type === 'artist';
          return (
            <button
              key={item.name}
              onClick={() => onSelect(item.name)}
              className={`relative flex-shrink-0 group overflow-hidden transition-all duration-300 ${
                isCircle ? 'w-24 h-24 sm:w-32 sm:h-32 rounded-full' : 'w-32 h-20 sm:w-48 sm:h-28 rounded-xl'
              } ${isSelected ? 'ring-4 ring-purple-600 ring-offset-2 dark:ring-offset-gray-900 scale-105' : 'hover:scale-105'}`}
            >
              <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-black/20' : 'bg-black/50 group-hover:bg-black/30'}`}></div>
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className={`text-white font-bold text-center drop-shadow-lg ${isCircle ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                  {item.name === 'all' ? 'All' : item.name}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 z-10 p-2 bg-gradient-to-l from-white/80 dark:from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity h-full">
        ▶
      </button>
    </div>
  )
}

export default function HomePage() {
  const [songs, setSongs] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [availableGenres, setAvailableGenres] = useState([{name: 'all', image: ''}])
  
  const [selectedArtist, setSelectedArtist] = useState('all')
  const [availableArtists, setAvailableArtists] = useState([{name: 'all', image: ''}])
  
  const [publicPlaylists, setPublicPlaylists] = useState([])

  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("signin")

  const {
    toasts,
    removeToast,
    showErrorToast,
    showWelcomeToast,
    showRegistrationToast,
    showAuthToast
  } = useToast(4)

  const CATEGORIES = ['all', 'song', 'podcast', 'audiobook']

  const handleAuthRequired = (mode = 'signin') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (userData, isRegistration = false) => {
    if (isRegistration) showRegistrationToast(userData?.username || userData?.name || 'User')
    else showWelcomeToast(userData?.username || userData?.name || 'User')
  }

  const initialLoad = useCallback(async (category, genre, artist) => {
    try {
      setLoading(true);
      setError(null);
      setPage(1);
      
      const results = await fetchSongsWithRetry(3, 1000, { page: 1, limit: 50, genre, category, artist });
      setSongs(results.songs || []);
      setHasMore(1 < results.totalPages);
      
      // Update available filters dynamically
      const newGenres = getUniqueGenres(results.songs || []);
      setAvailableGenres(newGenres);
      
      const newArtists = getUniqueArtists(results.songs || []);
      setAvailableArtists(newArtists);
      
      const pPlaylists = await fetchPublicPlaylistsAPI();
      setPublicPlaylists(pPlaylists);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      setPage(nextPage);

      const results = await fetchSongsWithRetry(3, 1000, { page: nextPage, limit: 50, genre: selectedGenre, category: selectedCategory, artist: selectedArtist });
      setSongs(prev => {
        const newSongs = results.songs.filter(s => !prev.some(p => (p.id || p._id) === (s.id || s._id)));
        return [...prev, ...newSongs];
      });
      setHasMore(nextPage < results.totalPages);
      
      // Dynamically append new genres and artists
      const newGenres = getUniqueGenres(results.songs);
      setAvailableGenres(prev => {
        const unique = new Map(prev.map(item => [item.name, item]));
        newGenres.forEach(item => unique.set(item.name, item));
        return Array.from(unique.values());
      });
      
      const newArtists = getUniqueArtists(results.songs);
      setAvailableArtists(prev => {
        const unique = new Map(prev.map(item => [item.name, item]));
        newArtists.forEach(item => unique.set(item.name, item));
        return Array.from(unique.values());
      });
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre, selectedCategory, selectedArtist, showErrorToast]);

  // Use refs to prevent recreating IntersectionObserver unnecessarily
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const observer = useRef()
  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadMore])

  useEffect(() => {
    initialLoad(selectedCategory, selectedGenre, selectedArtist)
  }, [selectedGenre, selectedCategory, selectedArtist, initialLoad]);

  const handleRetry = () => {
    initialLoad(selectedCategory, selectedGenre, selectedArtist);
  }

  const handleStartListening = () => {
    const contentElement = document.getElementById('music-content')
    if (contentElement) contentElement.scrollIntoView({ behavior: 'smooth' })
  }

  // Loading state (initial)
  if (loading && page === 1) {
    return (
      <>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <HeroSection onStartListening={handleStartListening} />
          <div className="py-4">
            <div className="flex justify-between mb-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <SongCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (error && songs.length === 0) {
    return (
      <>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <HeroSection />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-4">
              <button onClick={handleRetry} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold">Try Again</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <HeroSection onStartListening={handleStartListening} />

        <div id="music-content">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Categories</h3>
            <ScrollableTabs 
              items={CATEGORIES} 
              selected={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </div>

          {availableGenres.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Genres</h3>
              <ImageCardsScroll 
                items={availableGenres} 
                selected={selectedGenre} 
                onSelect={setSelectedGenre}
                type="genre"
              />
            </div>
          )}

          {availableArtists.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Artists</h3>
              <ImageCardsScroll 
                items={availableArtists} 
                selected={selectedArtist} 
                onSelect={setSelectedArtist}
                type="artist"
              />
            </div>
          )}

          {publicPlaylists.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2 flex items-center justify-between">
                <span>Featured Playlists</span>
              </h3>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2 pb-4">
                {publicPlaylists.map(playlist => (
                  <div key={playlist._id} className="w-48 sm:w-56 flex-shrink-0">
                    <PlaylistCard playlist={playlist} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Discover {selectedCategory !== 'all' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + 's' : 'Audios'}</h2>
            {songs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {songs.map((song, index) => (
                  <SongCard
                    key={song.id || song._id}
                    song={song}
                    playlist={songs}
                    index={index}
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                No items found for the selected filters.
              </div>
            )}
          </div>

          {/* Infinite Scroll Loader */}
          <div ref={lastElementRef} className="py-8 flex justify-center h-20">
            {loading && page > 1 && <PuffLoader color="#9333ea" size={40} />}
            {!hasMore && songs.length > 0 && (
              <p className="text-sm text-gray-500 font-medium text-center w-full">You've reached the end!</p>
            )}
          </div>
        </div>
      </div>

      <AuthenticationModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        showAuthToast={showAuthToast}
      />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  )
}