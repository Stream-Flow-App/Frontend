import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../utils/authUtils';
import { ShieldCheck, Music, Clock, AlertCircle } from 'lucide-react';

export default function ArtistApplicationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [reviewNotes, setReviewNotes] = useState(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    socialLinks: { instagram: '', twitter: '' },
    portfolioLinks: { soundcloud: '', youtube: '', spotify: '' }
  });

  useEffect(() => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('auth:required'));
      navigate('/');
      return;
    }

    // Redirect if already an artist
    if (user.role === 'artist' || user.role === 'admin') {
      navigate('/');
      return;
    }

    // Check existing application
    const checkApplication = async () => {
      try {
        const res = await authApi.get(`/api/applications/mine`);
        
        if (res.data && res.data.application) {
          const application = res.data.application;
          setApplicationStatus(application.status);
          setReviewNotes(application.reviewNotes);
          if (application.status === 'rejected') {
            // Pre-fill if rejected so they can fix and re-apply
            setFormData({
              bio: application.bio || '',
              socialLinks: application.socialLinks || { instagram: '', twitter: '' },
              portfolioLinks: application.portfolioLinks || { soundcloud: '', youtube: '', spotify: '' }
            });
          }
        }
      } catch (err) {
        if (err.response && err.response.status !== 404) {
          console.error('Failed to check application status:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await authApi.post(`/api/applications/apply`, formData);
      
      setApplicationStatus('pending');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600 dark:text-yellow-500">
          <Clock size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Under Review</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your application to become a verified artist has been submitted successfully. Our moderation team is currently reviewing your profile and portfolio. This usually takes 24-48 hours.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 font-medium transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Apply as an Artist</h1>
        <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">Join our community of creators and share your music with the world.</p>
      </div>

      {applicationStatus === 'rejected' && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-bold text-red-800 dark:text-red-400">Application Not Approved</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {reviewNotes || 'Your previous application was not approved. Please update your details and try again.'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6 sm:p-10 space-y-8">
        
        {/* Bio Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
            Artist Bio
          </h3>
          <div className="pl-11">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tell us about yourself and your music journey (Min. 20 characters) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              minLength={20}
              rows={4}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="I am an electronic music producer from..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Portfolio Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
            Portfolio & Demos
          </h3>
          <p className="pl-11 text-sm text-gray-500 dark:text-gray-400 mb-4">Provide at least one link to your previous work so we can verify your authenticity.</p>
          
          <div className="pl-11 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SoundCloud Profile / Track</label>
              <input
                type="url"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="https://soundcloud.com/your-artist-name"
                value={formData.portfolioLinks.soundcloud}
                onChange={(e) => setFormData({...formData, portfolioLinks: {...formData.portfolioLinks, soundcloud: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spotify Artist URI / Link</label>
              <input
                type="url"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="https://open.spotify.com/artist/..."
                value={formData.portfolioLinks.spotify}
                onChange={(e) => setFormData({...formData, portfolioLinks: {...formData.portfolioLinks, spotify: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube Channel</label>
              <input
                type="url"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="https://youtube.com/c/your-channel"
                value={formData.portfolioLinks.youtube}
                onChange={(e) => setFormData({...formData, portfolioLinks: {...formData.portfolioLinks, youtube: e.target.value}})}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Social Links Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
            Social Verification
          </h3>
          <div className="pl-11 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
              <input
                type="url"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="https://instagram.com/your-handle"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter / X URL</label>
              <input
                type="url"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="https://twitter.com/your-handle"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center ${
              submitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 shadow-md hover:shadow-lg'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
