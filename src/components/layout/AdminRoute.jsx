import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PuffLoader } from 'react-spinners';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.dispatchEvent(new CustomEvent('auth:required'));
    }
  }, [isLoading, isAuthenticated, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] text-gray-900 dark:text-white">
        <PuffLoader color="#8b5cf6" size={60} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return <Navigate to="/" replace />;
  }

  return children;
}
