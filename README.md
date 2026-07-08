# StreamFlow Frontend (React + Vite)

This is the frontend client for the StreamFlow application, built with React, Vite, and Tailwind CSS.

## 🚀 Recent Updates & Changelog

### Profile Page & UI Enhancements
- **Aesthetic Overhaul**: Replaced the previous `.glass-effect` container on the Profile Page with standard solid colors (`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700`). This ensures the profile form perfectly matches the dark/light mode theme established by the Sidebar and Navbar.
- **Mobile Responsiveness**: On small screens (phones), the profile form now expands to take up the full screen width and height (removing unnecessary padding). The action buttons ("Save Changes" and "Cancel") now stack vertically to provide a better mobile user experience.
- **Smart Phone Input**: Revamped the phone number input area. Added a dedicated Country Code selector dropdown with flags. The frontend now intelligently parses existing phone numbers, extracts the country code, and gracefully handles the backend's default "No Phone Number" string. It also automatically concatenates the code and number before sending the payload to the backend.

### Authentication & Security
- **Route Guards (`ProtectedRoute`)**: Implemented a robust `ProtectedRoute` wrapper component in `App.jsx`. All private routes (`/profile`, `/settings`, `/uploads`, `/favorites`) are now securely guarded.
- **Auto-Login Prompt**: If an unauthenticated user attempts to visit a protected route, they are immediately redirected to the Home page (`/`), and an `auth:required` event is dispatched. The Navbar listens to this event and automatically opens the "Sign In" modal.
- **Infinite Loop Fix**: Resolved a critical bug in `AuthContext` where the `auth:logout` event listener would trigger an infinite recursion loop during the logout process.

### Bug Fixes
- **Corrupt Image Preview**: Fixed a bug in `Navbar.jsx` where the user's profile image preview would appear corrupted. The frontend now correctly checks if the image URL is a relative path (e.g., `/uploads/profiles/...`) and prepends the backend's API base URL (`VITE_API_BASE_URL` or `http://localhost:5000`) before rendering it.

## 🛠️ Tech Stack
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- React Spinners & Lucide Icons
