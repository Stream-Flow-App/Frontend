import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, X, User } from 'lucide-react';
import { authApi } from '../../utils/authUtils';

export default function AdminApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await authApi.get('/api/applications/admin');
      if (res.data) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id, status) => {
    let reviewNotes = '';
    if (status === 'rejected') {
      reviewNotes = window.prompt('Reason for rejection (optional):');
      if (reviewNotes === null) return; // cancelled
    } else {
      if (!window.confirm('Are you sure you want to approve this application? The user will immediately become an artist.')) {
        return;
      }
    }

    setActionLoading(id);
    try {
      const res = await authApi.patch(`/api/applications/admin/${id}/review`, {
        status, reviewNotes
      });

      if (res.status === 200) {
        setApplications(applications.filter(app => app._id !== id));
      } else {
        alert(res.data?.message || 'Failed to review application');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading applications...</div>;

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-gray-800/50">
        <h3 className="text-xl font-bold text-gray-300 mb-2">No Pending Applications</h3>
        <p className="text-gray-500">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Artist Applications ({applications.length})</h2>
      
      <div className="space-y-6">
        {applications.map((app) => (
          <div key={app._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center overflow-hidden border border-purple-500/30">
                  {app.user.profileImg && app.user.profileImg !== 'No Profile Picture' ? (
                    <img src={app.user.profileImg} alt={app.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-purple-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{app.user.username} • {app.user.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-3 w-full md:w-auto">
                <button
                  onClick={() => handleReview(app._id, 'rejected')}
                  disabled={actionLoading === app._id}
                  className="flex-1 md:flex-none justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-red-600 text-gray-700 dark:text-white hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  <X size={16} className="mr-2" /> Reject
                </button>
                <button
                  onClick={() => handleReview(app._id, 'approved')}
                  disabled={actionLoading === app._id}
                  className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  <Check size={16} className="mr-2" /> Approve
                </button>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Artist Bio</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{app.bio}</p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Portfolio Links</h4>
                <div className="space-y-2">
                  {app.portfolioLinks.soundcloud && (
                    <a href={app.portfolioLinks.soundcloud} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                      <ExternalLink size={14} className="mr-2" /> SoundCloud
                    </a>
                  )}
                  {app.portfolioLinks.spotify && (
                    <a href={app.portfolioLinks.spotify} target="_blank" rel="noreferrer" className="flex items-center text-sm text-green-400 hover:text-green-300">
                      <ExternalLink size={14} className="mr-2" /> Spotify
                    </a>
                  )}
                  {app.portfolioLinks.youtube && (
                    <a href={app.portfolioLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center text-sm text-red-400 hover:text-red-300">
                      <ExternalLink size={14} className="mr-2" /> YouTube
                    </a>
                  )}
                  {!app.portfolioLinks.soundcloud && !app.portfolioLinks.spotify && !app.portfolioLinks.youtube && (
                    <span className="text-gray-500 text-sm">No portfolio links provided</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Social Media</h4>
                <div className="space-y-2">
                  {app.socialLinks.instagram && (
                    <a href={app.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center text-sm text-pink-400 hover:text-pink-300">
                      <ExternalLink size={14} className="mr-2" /> Instagram
                    </a>
                  )}
                  {app.socialLinks.twitter && (
                    <a href={app.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-300 hover:text-blue-200">
                      <ExternalLink size={14} className="mr-2" /> Twitter / X
                    </a>
                  )}
                  {!app.socialLinks.instagram && !app.socialLinks.twitter && (
                    <span className="text-gray-500 text-sm">No social links provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
