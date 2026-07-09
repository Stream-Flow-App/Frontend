import React, { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { MusicProvider } from "./context/MusicContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/layout/Layout"
import HomeRouter from "./components/home/HomeRouter"
import HomePage from "./components/home/HomePage"
import UploadsPage from "./components/uploads/UploadsPage"
import FavoritesPage from "./components/favorites/FavoritesPage"
import PlaylistPage from "./components/playlist/PlaylistPage"
import NotFound404 from "./components/404Page/NotFound404"
import ProfilePage from "./components/profile/ProfilePage"
import ArtistPage from "./components/profile/ArtistPage"
import AlbumPage from "./components/album/AlbumPage"
import SettingsPage from "./components/settings/SettingsPage"
import ResetPasswordPage from "./components/authentication/ResetPasswordPage"
import MusicErrorBoundary from "./components/errorBoundary/MusicErrorBoundary"
import ProtectedRoute from "./components/layout/ProtectedRoute"
import AdminRoute from "./components/layout/AdminRoute"
import AdminDashboard from "./components/admin/AdminDashboard"
import LandingPage from "./components/home/LandingPage"
import ArtistApplicationForm from "./components/home/ArtistApplicationForm"
import PrivacyPolicyPage from "./components/home/PrivacyPolicyPage"
import SupportPage from "./components/home/SupportPage"
import "./index.css"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <MusicErrorBoundary 
        fallbackMessage="There was an issue loading this page"
        onReset={() => window.location.href = '/'}
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Page Error</h1>
            <p className="text-gray-600 mb-4">Something went wrong with this page.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </MusicErrorBoundary>
    ),
    children: [
      { 
        path: '', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the home page">
            <HomeRouter />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'browse', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the browse page">
            <HomePage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'about', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the about page">
            <LandingPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'apply-artist', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the application form">
            <ArtistApplicationForm />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'privacy', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the privacy policy page">
            <PrivacyPolicyPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'support', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the support page">
            <SupportPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'uploads', 
        element: (
          <ProtectedRoute>
            <MusicErrorBoundary fallbackMessage="There was an issue loading your uploads">
              <UploadsPage />
            </MusicErrorBoundary>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'favorites', 
        element: (
          <ProtectedRoute>
            <MusicErrorBoundary fallbackMessage="There was an issue loading your favorites">
              <FavoritesPage />
            </MusicErrorBoundary>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <MusicErrorBoundary fallbackMessage="There was an issue loading your profile">
              <ProfilePage />
            </MusicErrorBoundary>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'profile/:username', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading this profile">
            <ArtistPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'album/:albumName', 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading this album">
            <AlbumPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: 'settings', 
        element: (
          <ProtectedRoute>
            <MusicErrorBoundary fallbackMessage="There was an issue loading settings">
              <SettingsPage />
            </MusicErrorBoundary>
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin', 
        element: (
          <AdminRoute>
            <MusicErrorBoundary fallbackMessage="There was an issue loading the admin dashboard">
              <AdminDashboard />
            </MusicErrorBoundary>
          </AdminRoute>
        ) 
      },
      { 
        path: "/playlist/:playlistId", 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading this playlist">
            <PlaylistPage />
          </MusicErrorBoundary>
        ) 
      },
      { 
        path: "/user/reset-password", 
        element: (
          <MusicErrorBoundary fallbackMessage="There was an issue loading the reset password page">
            <ResetPasswordPage />
          </MusicErrorBoundary>
        ) 
      },
      { path: '*', element: <NotFound404 /> },
    ]
  }
])

function App() {
  return (
    <MusicErrorBoundary 
      fallbackMessage="We're having trouble loading the music app. This might be a temporary issue."
      onReset={() => {
        // Clear all stored data and reload
        localStorage.removeItem('musicAppData')
        sessionStorage.clear()
        window.location.reload()
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <MusicProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading music app...</p>
                </div>
              </div>
            }>
              <RouterProvider router={router} />
            </Suspense>
          </MusicProvider>
        </AuthProvider>
      </ThemeProvider>
    </MusicErrorBoundary>
  )
}

export default App