import { useState, useEffect } from "react"
import { Edit2, X, Upload } from "lucide-react"
import { useMusic } from "../../context/MusicContext"
import SongCard from "../songCard/SongCard.jsx"
import UploadModal from "./UploadModal"
import { fetchMyAudiosAPI } from "../../utils/apiUtils"
import { fetchUserAlbums } from "../../utils/albumUtils"
import PlaylistCard from "../playlist/PlaylistCard.jsx"

export default function UploadsPage() {
  const { state, dispatch } = useMusic()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [activeTab, setActiveTab] = useState("songs")
  const [albums, setAlbums] = useState([])

  const songs = state.uploads || []

  // Load user uploads on mount and on upload success
  useEffect(() => {
    const loadUploads = async () => {
      try {
        const myAudios = await fetchMyAudiosAPI()
        dispatch({ type: "SET_UPLOADS", payload: myAudios })
        
        
        const myAlbumsResponse = await fetchUserAlbums()
        if (myAlbumsResponse.success) {
          setAlbums(myAlbumsResponse.albums)
        }
      } catch (error) {
        console.error("Failed to load user uploads:", error)
      }
    }
    loadUploads()

    window.addEventListener('songUploaded', loadUploads)
    return () => window.removeEventListener('songUploaded', loadUploads)
  }, [dispatch])

  const handleEditClick = (song) => {
    setEditingSong(song)
    setShowUploadModal(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleUploadModalClose = () => {
    setShowUploadModal(false)
    setEditingSong(null)
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Edit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Uploads
            </h1>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("songs")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "songs" 
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Songs ({songs.length})
              </button>
              <button
                onClick={() => setActiveTab("albums")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "albums" 
                    ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Albums ({albums.length})
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            {isEditMode ? (
              <button
                onClick={handleCancelEdit}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="btn-ghost flex items-center space-x-2 px-3 sm:px-4 py-2 cursor-pointer rounded-lg sm:rounded-xl hover:text-purple-600 dark:hover:text-purple-400 text-sm"
                disabled={songs.length === 0}
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Songs</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-purple-800 dark:text-purple-300 font-medium text-sm sm:text-base leading-relaxed">
                Edit mode enabled. Tap on songs and click the edit button to modify their details.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "songs" ? (
          songs.length === 0 ? (
            // No uploads at all
            <div className="text-center py-8 sm:py-10 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                No songs uploaded yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 sm:mb-8 max-w-sm mx-auto leading-relaxed">
                Start building your music library by uploading your favorite songs.
              </p>
            </div>
          ) : (
            // Show songs grid
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {songs.map((song) => (
                <div key={song.id || song._id} className="group relative">
                  <SongCard
                    song={song}
                    playlist={songs}
                    isEditMode={isEditMode}
                    onEditClick={handleEditClick}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          // Show albums
          albums.length === 0 ? (
            <div className="text-center py-8 sm:py-10 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                No albums created yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Group your songs into albums from the left sidebar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {albums.map(album => (
                <PlaylistCard key={album._id} playlist={album} showStatus={true} isAlbum={true} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={handleUploadModalClose}
          editSong={editingSong}
        />
      )}
    </>
  )
}