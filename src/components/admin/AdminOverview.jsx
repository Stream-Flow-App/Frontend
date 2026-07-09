import React, { useState, useEffect } from 'react';
import { fetchAdminUsers, fetchAdminAudios } from '../../utils/adminApiUtils';
import { Users, Music, Activity } from 'lucide-react';
import { PuffLoader } from 'react-spinners';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, audios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [usersData, audiosData] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminAudios(),
        ]);
        
        setStats({
          users: usersData.totalUsers !== undefined ? usersData.totalUsers : (usersData.length || 0),
          audios: audiosData.count || audiosData.audios?.length || 0,
        });
      } catch {
        setError('Failed to load overview statistics');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <PuffLoader color="#8b5cf6" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Audio Tracks',
      value: stats.audios,
      icon: Music,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Platform Status',
      value: 'Healthy',
      icon: Activity,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Platform Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="relative group rounded-2xl p-1 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
              <div className="relative bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 h-full flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2 truncate">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg flex-shrink-0 bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
