import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = true, isLoading = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} 
      />
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl relative z-10 animate-fade-in border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-0 flex items-start space-x-4">
          <div className={`p-3 rounded-full flex-shrink-0 ${isDangerous ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-sm ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
            } disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
        
        {/* Close button top right */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
