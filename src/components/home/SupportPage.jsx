import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Send, Linkedin, Github } from 'lucide-react';

import { api } from '../../utils/apiUtils';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      await api.post('/api/contact', data);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      e.target.reset();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            How can we help?
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input required type="text" id="name" name="name" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input required type="email" id="email" name="email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="john@example.com" />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <input required type="text" id="subject" name="subject" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="How do I become an artist?" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea required id="message" name="message" rows="5" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Please describe your issue in detail..."></textarea>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button disabled={isLoading} type="submit" className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400 flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Email Support</h4>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">zackriver.dev@gmail.com</p>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/labdallah-wageehl/" target="_blank" rel="noreferrer" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Linkedin className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">LinkedIn</h4>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Connect</p>
            </div>
          </a>
          <a href="https://github.com/Zack-River" target="_blank" rel="noreferrer" className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-gray-800 dark:text-gray-200 flex-shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">GitHub</h4>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Zack-River</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}

const CheckCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
