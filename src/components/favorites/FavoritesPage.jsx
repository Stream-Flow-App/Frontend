import { Heart } from "lucide-react"
import SongCard from "../songCard/SongCard.jsx"
import { useMusic } from "../../context/MusicContext"

export default function FavoritesPage() {
  const { state, dispatch } = useMusic()

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Liked Songs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {state.favorites.length} {state.favorites.length === 1 ? 'song' : 'songs'} in your favorites
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {state.favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {state.favorites.map((song, index) => (
              <SongCard
                key={song._id}
                song={song}
                index={index}
                contextAudios={state.favorites}
                onPlay={() => dispatch({ type: "SET_CURRENT_SONG", payload: song })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No liked songs yet</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-sm">
              Songs you like will appear here. Start exploring and click the heart icon on songs you love.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}