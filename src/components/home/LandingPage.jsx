import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Mic2, ShieldCheck, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Stream Flow</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-300 mx-auto">
            The next generation of music streaming. Designed for listeners to discover, and for artists to thrive. 
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/" className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-colors">
              Start Listening
            </Link>
            <Link to="/apply-artist" className="px-8 py-3 border border-gray-500 text-base font-medium rounded-full text-white bg-transparent hover:bg-white/10 transition-colors">
              Apply as Artist
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Everything you need to know about our platform ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Listeners</h3>
            <p className="text-gray-500 dark:text-gray-400">Create an account to browse millions of songs, build playlists, and discover new underground artists before they blow up.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Creator Role
            </div>
            <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-6 text-pink-600 dark:text-pink-400">
              <Mic2 size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Artists</h3>
            <p className="text-gray-500 dark:text-gray-400">Apply to become a verified artist. Gain access to the exclusive Artist Dashboard, upload your tracks, and track real-time listen hours and analytics.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Moderators</h3>
            <p className="text-gray-500 dark:text-gray-400">Our dedicated team of moderators review artist applications and ensure all uploaded content meets our community guidelines and audio standards.</p>
          </div>
        </div>
      </div>

      {/* Call to Action for Artists */}
      <div className="bg-purple-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to share your sound with the world?</h2>
          <p className="text-purple-200 mb-10 text-lg">
            We are currently accepting applications for new artists. Submit your portfolio, social links, and a short bio. Our moderation team reviews applications within 48 hours.
          </p>
          <Link to="/apply-artist" className="px-8 py-4 bg-white text-purple-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            Submit Artist Application
          </Link>
        </div>
      </div>

      {/* Footer / Policy */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Music size={20} className="text-purple-500" />
            <span className="font-bold text-white text-lg tracking-wider">Stream Flow</span>
          </div>
          <p className="mb-4">© 2026 Stream Flow Inc. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Content Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
