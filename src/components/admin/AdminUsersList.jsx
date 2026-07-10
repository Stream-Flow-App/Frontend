import React, { useState, useEffect, useCallback } from 'react';
import { fetchAdminUsers, updateAdminUserBan, updateAdminUserRole } from '../../utils/adminApiUtils';
import { Shield, AlertTriangle, ShieldAlert, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PuffLoader } from 'react-spinners';
import { useToast } from '../common/Toast';

import { useAuth } from '../../context/AuthContext';
export default function AdminUsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'artists', 'mods'
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [banningUser, setBanningUser] = useState(null);
  const [banDuration, setBanDuration] = useState('24');
  const { showErrorToast, showSuccessToast } = useToast();

  const loadUsers = useCallback(async (currentSearch, currentPage, currentUserType, isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await fetchAdminUsers(currentSearch, currentPage, 10, currentUserType);
      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      } else {
        setUsers(data); // Fallback for old API format
      }
    } catch {
      showErrorToast('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    // Initial load is true, subsequent search loads are background
    const isInitial = users.length === 0 && search === '';
    
    const delayDebounceFn = setTimeout(() => {
      loadUsers(search, page, activeTab, !isInitial);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, activeTab, loadUsers]);

  // handleBan, handleRoleChange remain unchanged...
  const handleBan = async () => {
    if (!banningUser) return;
    try {
      await updateAdminUserBan(banningUser.username, banDuration);
      showSuccessToast('User ban status updated');
      loadUsers(search, page, activeTab, true);
    } catch {
      showErrorToast('Failed to update ban status');
    } finally {
      setBanningUser(null);
    }
  };

  const handleRoleChange = async (username, newRole) => {
    try {
      await updateAdminUserRole(username, newRole);
      showSuccessToast('User role updated');
      loadUsers(search, page, activeTab, true);
    } catch {
      showErrorToast('Failed to update role');
    }
  };

  // We only show full-screen loader on initial mount
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <PuffLoader color="#8b5cf6" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Users</h2>
            <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/20">
              {totalUsers || users.length} Users
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400" size={18} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => { setActiveTab('users'); setPage(1); setUsers([]); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Normal Users
          </button>
          <button
            onClick={() => { setActiveTab('artists'); setPage(1); setUsers([]); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'artists'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => { setActiveTab('mods'); setPage(1); setUsers([]); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'mods'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Mods & Admins
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 flex items-center space-x-3">
                  {user.profileImg && user.profileImg !== 'No Profile Picture' && !user.profileImg.includes('default-profile') ? (
                    <img
                      src={user.profileImg.startsWith('http') ? user.profileImg : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${user.profileImg.startsWith('/') ? '' : '/'}${user.profileImg}`}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0"
                    style={{ display: (user.profileImg && user.profileImg !== 'No Profile Picture' && !user.profileImg.includes('default-profile')) ? 'none' : 'flex' }}
                  >
                    <span className="text-white font-medium text-sm">
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{user.name || user.username}</span>
                </td>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  {currentUser?.role === 'admin' && user.role !== 'admin' ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.username, e.target.value)}
                      className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : user.role === 'moderator'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'admin' && user.username !== currentUser?.username && (
                    <button
                      onClick={() => setBanningUser(user)}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-center ml-auto ${
                        user.bannedUntil && new Date(user.bannedUntil) > new Date()
                          ? 'text-yellow-400 hover:bg-yellow-400/10 bg-yellow-500/10 border-yellow-500/20'
                          : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                      }`}
                      title={user.bannedUntil && new Date(user.bannedUntil) > new Date() ? 'Manage Ban' : 'Suspend User'}
                    >
                      {user.bannedUntil && new Date(user.bannedUntil) > new Date() ? (
                        <ShieldAlert size={18} />
                      ) : (
                        <Shield size={18} />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex items-center space-x-3 text-red-500 dark:text-red-400 mb-4">
              <ShieldAlert size={24} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage User Ban</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You are managing the suspension for <span className="font-semibold text-gray-900 dark:text-white">{banningUser.username}</span>.
              {banningUser.bannedUntil && new Date(banningUser.bannedUntil) > new Date() && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">Currently banned until: {new Date(banningUser.bannedUntil).toLocaleString()}</span>
              )}
            </p>
            
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ban Duration</label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
              >
                <option value="24">24 Hours</option>
                <option value="168">7 Days</option>
                <option value="720">30 Days</option>
                <option value="forever">Forever</option>
                <option value="0">Unban (Remove Suspension)</option>
              </select>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setBanningUser(null)}
                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
