import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMusic } from '../../context/MusicContext';
import { updateProfile } from '../../utils/authUtils';
import { Camera, Save, Heart, Music, ListMusic, CalendarDays, User } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { state } = useMusic();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  });
  
  const [profileImg, setProfileImg] = useState(null);
  const [previewImg, setPreviewImg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || ''
      });
      
      const imgUrl = user.profileImg && user.profileImg !== 'No Profile Picture'
        ? (user.profileImg.startsWith('http') || user.profileImg.startsWith('/assets') || user.profileImg.startsWith('blob:') 
            ? user.profileImg 
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.profileImg}`)
        : '/assets/images/default-profile.jpg';
      
      setPreviewImg(imgUrl);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setProfileImg(file);
      setPreviewImg(URL.createObjectURL(file));
      setIsEditing(true); // Automatically enter edit mode if they change picture
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');

    try {
      // The backend will ignore fields that aren't sent, so phone number won't be erased!
      const result = await updateProfile(formData, profileImg);
      if (result.success) {
        updateUser(result.user);
        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        setProfileImg(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] text-gray-900 dark:text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Aesthetic Profile Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden bg-[#0f0c29]">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        
        {/* Profile Card & Stats Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Editor Card */}
          <div className="lg:col-span-2 bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all">
            <form onSubmit={handleSubmit}>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 -mt-16 sm:-mt-20">
                {/* Avatar */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center relative">
                    {previewImg && previewImg !== '/assets/images/default-profile.jpg' ? (
                      <img 
                        src={previewImg} 
                        alt="Profile" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                
                {/* Basic Info Display */}
                <div className="text-center sm:text-left flex-1 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{user.name}</h1>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">@{user.username}</p>
                </div>
                
                <div className="hidden sm:block pb-4">
                   <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {error && <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
              {successMsg && <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg text-sm">{successMsg}</div>}

              {/* Public Fields Form */}
              <div className={`space-y-6 transition-all duration-300 ${isEditing ? 'opacity-100 max-h-[500px]' : 'opacity-50 pointer-events-none max-h-0 overflow-hidden sm:max-h-[500px] sm:opacity-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-70 transform hover:scale-[1.02] shadow-md shadow-purple-500/20"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Public Profile'}
                    </button>
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <div className="sm:hidden flex justify-center mt-6">
                   <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Your Music Journey</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-medium">Favorites</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{state.favorites?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <Music className="w-5 h-5" />
                    <span className="font-medium">Uploads</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{state.uploads?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <ListMusic className="w-5 h-5" />
                    <span className="font-medium">Playlists</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{state.playlists?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
               <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <CalendarDays className="w-5 h-5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold">StreamFlow Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2026'}
                    </p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
