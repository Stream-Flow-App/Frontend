<div align="center">
  <img src="logo.png" alt="Stream Flow Logo" width="150" height="150" style="border-radius: 20px;">
  <h1>Stream Flow - Client</h1>
  <p>A modern, premium music streaming web application built with React and Vite.</p>
</div>

## Overview
Stream Flow is a sleek and highly dynamic music streaming platform featuring a modern UI with glassmorphism, vibrant gradients, and intuitive navigation. The frontend client integrates with the Stream Flow Backend API to provide user authentication, global search, playlist management, and high-quality audio playback.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context API (`MusicContext`, `AuthContext`, `ThemeContext`)
- **Icons:** Lucide React
- **Forms:** Formik + Yup
- **HTTP Client:** Axios

## Core Features
- **Global Search:** Spotify-style dropdown search across songs, artists, and albums.
- **Audio Player:** Persistent audio playback across route transitions.
- **Library Management:** Users can upload audio, create/manage playlists, and like their favorite tracks.
- **Profiles:** Dedicated artist pages and public user profiles.
- **Responsive Design:** Mobile-first approach with fluid layouts and micro-animations.

## Getting Started
1. `npm install`
2. `npm run dev`

## File Structure
- `/src/components/` - React UI components grouped by feature (e.g., `audioPlayer`, `navbar`, `playlist`)
- `/src/context/` - Global state providers
- `/src/hooks/` - Custom React hooks for audio state and playback
- `/src/utils/` - API utility functions interacting with the backend

