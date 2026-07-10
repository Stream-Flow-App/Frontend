import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../../context/AuthContext"
import { Play, Music, Disc, Clock } from "lucide-react"
import { fetchMyUploads } from "../../utils/apiUtils.js"
import { fetchUserAlbums } from "../../utils/albumUtils.js"
import SongCard from "../songCard/SongCard.jsx"
import SongCardSkeleton from "../common/SongCardSkeleton.jsx"
import { ToastContainer } from "../common/Toast"

export default function ArtistHomePage() {
  const { user } = useAuth()
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadArtistUploads = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [results, albumResults] = await Promise.all([
        fetchMyUploads(),
        fetchUserAlbums().catch(() => ({ albums: [] }))
      ])
      setSongs(results.songs || [])
      setAlbums(albumResults.albums || [])
    } catch (err) {
      console.error(err)
      setError('Failed to load your uploads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArtistUploads()
  }, [loadArtistUploads])

  // Calculate real stats based on fetched songs
  const approvedSongs = songs.filter(s => s.status === 'approved')
  const topSongs = [...approvedSongs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5)
  const totalUploads = songs.length
  const totalPlays = songs.reduce((sum, song) => sum + (song.plays || 0), 0)
  const totalListenSeconds = songs.reduce((sum, song) => sum + (song.totalListenSeconds || 0), 0)

  const formatListenTime = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hrs}h ${remainingMins}m`
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user?.name || user?.username || 'Artist'}!
          </h1>
          <p className="text-purple-100 max-w-2xl text-lg">
            This is your artist dashboard. Track your performance, manage your uploads, and connect with your audience.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Plays</h3>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Play className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalPlays.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Your Uploads</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Music className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalUploads}
            </p>
            {totalUploads > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {approvedSongs.length} live · {totalUploads - approvedSongs.length} pending
              </p>
            )}
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Albums</h3>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Disc className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {albums.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Listen Time</h3>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatListenTime(totalListenSeconds)}
          </p>
        </div>
    </div>

      {/* Most Popular Songs Section */}
      {topSongs.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Most Popular Songs
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {topSongs.map((song, index) => (
                <div key={song.id || song._id} className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-shrink-0 text-gray-400 font-bold w-6 text-center mr-2">
                    {index + 1}
                  </div>
                  <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 shadow-sm mr-4">
                    <img src={song.cover} alt={song.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {song.album || song.artist}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6 mr-2">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Play className="w-4 h-4 mr-1 text-purple-500" />
                      {song.plays?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 w-16 justify-end">
                      <Clock className="w-4 h-4 mr-1 text-orange-500" />
                      {formatListenTime(song.totalListenSeconds || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Uploads Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Your Uploads
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(5)].map((_, i) => <SongCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={loadArtistUploads}
              className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {songs.map((song) => (
              <SongCard key={song.id || song._id} song={song} songs={songs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Music className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Uploads Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              You haven't uploaded any songs yet. Use the Upload button in the sidebar to share your first track!
            </p>
          </div>
        )}
      </div>
      
      <ToastContainer />
    </div>
  )
}
