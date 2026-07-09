import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PuffLoader } from 'react-spinners'
import { Disc, Music, Save } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { fetchSongsWithRetry } from "../../utils/apiUtils"
import { useAuth } from "../../context/AuthContext"
import { useMusic } from "../../context/MusicContext"
import { createPlaylist } from "../../utils/playlistUtils"
import { useToast } from "../common/Toast"

export default function AlbumPage() {
  const { albumName } = useParams()
  const navigate = useNavigate()
  
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [artistName, setArtistName] = useState('Various Artists')
  const [albumCover, setAlbumCover] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const { isAuthenticated } = useAuth()
  const { state } = useMusic()
  const { showToast } = useToast()

  useEffect(() => {
    const fetchAlbumSongs = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const results = await fetchSongsWithRetry(3, 1000, { 
          page: 1, 
          limit: 100, 
          genre: 'all', 
          category: 'all', 
          artist: 'all',
          album: albumName 
        })
        
        if (results.songs && results.songs.length > 0) {
          setSongs(results.songs)
          
          const artists = Array.from(new Set(results.songs.map(s => s.artist || s.singer).filter(Boolean)))
          if (artists.length === 1) {
            setArtistName(artists[0])
          } else if (artists.length > 1) {
            setArtistName('Various Artists')
          }
          
          if (results.songs[0].coverImage || results.songs[0].coverUrl) {
            setAlbumCover(results.songs[0].coverImage || results.songs[0].coverUrl)
          }
        } else {
          setError('Album not found or has no tracks.')
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load album')
      } finally {
        setLoading(false)
      }
    }

    if (albumName) {
      fetchAlbumSongs()
    }
  }, [albumName])

  const handleSaveAlbum = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:required'));
      return;
    }
    
    try {
      setIsSaving(true);
      const songIds = songs.map(s => s.id || s._id);
      await createPlaylist({
        name: albumName,
        description: `Album by ${artistName}`,
        isPublic: false,
        audio: songIds
      });
      showToast('Album saved to your library', 'success');
      // Refresh user playlists
      if (state.fetchPlaylists) {
        state.fetchPlaylists();
      }
    } catch (err) {
      console.error('Failed to save album:', err);
      showToast('Failed to save album', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <PuffLoader color="#7C3AED" size={60} />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading album...</p>
      </div>
    )
  }

  if (error || songs.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Disc className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Album Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Could not find any tracks for this album.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100 to-gray-50 dark:from-blue-900/30 dark:to-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
          
          <div className="w-48 h-48 sm:w-56 sm:h-56 shadow-2xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 relative z-10 flex-shrink-0">
            {albumCover ? (
              <img 
                src={albumCover} 
                alt={albumName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc className="w-24 h-24 text-gray-300 dark:text-gray-600" />
            )}
          </div>
          
          <div className="text-center sm:text-left z-10 flex-1">
            <div className="inline-flex items-center space-x-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Disc className="w-4 h-4" />
              <span>Album</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {albumName}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 font-medium">
              By <span className="font-bold text-gray-900 dark:text-gray-200">{artistName}</span>
            </p>

            <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm font-medium text-gray-500">
              <div className="flex items-center space-x-1">
                <Music className="w-4 h-4" />
                <span>{songs.length} {songs.length === 1 ? 'Track' : 'Tracks'}</span>
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="mt-4 flex justify-center sm:justify-start">
                <button
                  onClick={handleSaveAlbum}
                  disabled={isSaving}
                  className="btn-primary flex items-center space-x-2 px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  title="Save album to your library as a playlist"
                >
                  <Save className="w-5 h-5" />
                  <span className="font-semibold">{isSaving ? 'Saving...' : 'Save to Library'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-2">
          {songs.map((song) => (
            <SongCard 
              key={song.id} 
              song={song} 
              playlist={songs}
              playlistName={albumName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
