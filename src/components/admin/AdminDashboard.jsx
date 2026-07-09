import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminOverview from './AdminOverview';
import AdminUsersList from './AdminUsersList';
import AdminAudioList from './AdminAudioList';
import AdminModerationTab from './AdminModerationTab';
import AdminApplicationsList from './AdminApplicationsList';
import { LayoutDashboard, Users, Music, ShieldAlert, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      window.dispatchEvent(new CustomEvent('auth:required'));
      navigate('/');
    }
  }, [user, navigate, authLoading]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
  ];

  tabs.push({ id: 'users', label: 'Users', icon: Users });
  
  if (user?.role === 'admin') {
    tabs.push({ id: 'audio', label: 'Audio Tracks', icon: Music });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage your platform's users and content</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-bl from-purple-600 via-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-xl p-6 min-h-[500px]">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'applications' && <AdminApplicationsList />}
          {activeTab === 'moderation' && <AdminModerationTab />}
          {activeTab === 'users' && <AdminUsersList />}
          {activeTab === 'audio' && <AdminAudioList />}
        </div>
      </div>
    </div>
  );
}
