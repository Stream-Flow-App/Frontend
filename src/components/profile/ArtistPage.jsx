import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { api, formatDurationFromMs } from "../../utils/apiUtils"
import { PuffLoader } from 'react-spinners'
import SongCard from "../songCard/SongCard.jsx"
import PlaylistCard from "../playlist/PlaylistCard.jsx"
import { User, Music, Disc3 } from "lucide-react"

export default function ArtistPage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [artist, setArtist] = useState(null)
  const [audios, setAudios] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/api/users/public/${username}`)
        
        if (response.data?.user) {
          setArtist(response.data.user)
          
          const mappedAudios = (response.data.audios || []).map(apiSong => ({
            id: apiSong._id,
            title: apiSong.title,
            artist: Array.isArray(apiSong.singer) && apiSong.singer.length > 0 
              ? apiSong.singer.join(', ') 
              : apiSong.singer || 'Unknown Artist',
            album: apiSong.album || 'Unknown Album',
            coverImageUrl: apiSong.coverImageUrl || '/default-cover.png',
            audioUrl: apiSong.audioUrl,
            duration: formatDurationFromMs(apiSong.duration),
            durationSeconds: apiSong.durationSeconds || 0,
            genre: apiSong.genre,
            category: apiSong.category,
            uploadedBy: apiSong.uploadedBy,
            isPrivate: apiSong.isPrivate
          }))
          
          setAudios(mappedAudios)
          setAlbums(response.data.albums || [])
        } else {
          setError('Artist not found')
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || 'Failed to load artist profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchArtistData()
    }
  }, [username])

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <PuffLoader color="#7C3AED" size={60} />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading artist profile...</p>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Artist Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'The profile you are looking for does not exist.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    )
  }

  const profileImgUrl = artist.profileImg && artist.profileImg !== 'No Profile Picture' 
    ? artist.profileImg 
    : null

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 to-gray-50 dark:from-purple-900/30 dark:to-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-end space-y-6 sm:space-y-0 sm:space-x-8">
          
          <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full shadow-2xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 relative z-10 flex-shrink-0">
            {profileImgUrl ? (
              <img 
                src={profileImgUrl} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-20 h-20 text-gray-300 dark:text-gray-600" />
            )}
          </div>
          
          <div className="text-center sm:text-left z-10 flex-1">
            <div className="inline-flex items-center space-x-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              <User className="w-4 h-4" />
              <span>Artist</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {artist.name}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 font-medium">
              @{artist.username}
            </p>

            <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm font-medium text-gray-500">
              <div className="flex items-center space-x-1">
                <Music className="w-4 h-4" />
                <span>{audios.length} {audios.length === 1 ? 'Track' : 'Tracks'} Uploaded</span>
              </div>
              {albums.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Disc3 className="w-4 h-4" />
                  <span>{albums.length} {albums.length === 1 ? 'Album' : 'Albums'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {albums.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {albums.map((album) => (
                <PlaylistCard 
                  key={album._id} 
                  playlist={album}
                  isAlbum={true}
                />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Popular Releases</h2>
        
        {audios.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {audios.map((song, idx) => (
              <SongCard 
                key={song.id} 
                song={song} 
                playlist={audios}
                playlistName={`${artist.name}'s Tracks`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Music className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No tracks yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {artist.name} hasn't uploaded any public tracks.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
