import React from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Privacy & Policy
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy is critically important to us. Learn how we collect, use, and protect your data.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-12 space-y-8">
          
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-purple-500 flex-shrink-0" />
              Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              When you use StreamFlow, we may collect personal information such as your name, email address, and profile picture during registration. We also collect usage data to improve our services, such as your listening history, created playlists, and interacted content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-purple-500 flex-shrink-0" />
              How We Use Your Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your data is primarily used to provide and enhance your experience on StreamFlow. This includes:
            </p>
            <ul className="space-y-3 mt-4 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Personalizing your music recommendations and feed.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Managing your account and processing your artist applications.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Communicating with you about updates, security alerts, and support messages.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We implement a variety of security measures to maintain the safety of your personal information. Your data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions regarding this privacy policy, you may contact us via our Support page.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
