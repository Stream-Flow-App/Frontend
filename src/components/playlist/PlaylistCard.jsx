import React from 'react';
import { Link } from 'react-router-dom';

const PlaylistCard = ({ playlist, showStatus = false, isAlbum = false }) => {
  const imageUrl = playlist.cover && playlist.cover !== 'No Cover' 
    ? playlist.cover 
    : 'https://placehold.co/200x200/2a2a2a/ffffff?text=Playlist';

  return (
    <Link 
      to={isAlbum ? `/album/${playlist._id || playlist.id}` : `/playlist/${playlist._id || playlist.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative aspect-square">
        <img 
          src={imageUrl} 
          alt={playlist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
        {showStatus && playlist.status && (
          <div className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded-sm shadow-md text-[10px] font-bold text-white z-10 ${
              playlist.status === 'approved' ? 'bg-emerald-500' :
              playlist.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-500 text-yellow-900'
          }`}>
              {playlist.status.charAt(0).toUpperCase() + playlist.status.slice(1)}
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-purple-600 rounded-full p-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {playlist.owner?.name || 'Unknown User'} • {playlist.audio?.length || playlist.songs?.length || 0} tracks
        </p>
      </div>
    </Link>
  );
};

export default PlaylistCard;
