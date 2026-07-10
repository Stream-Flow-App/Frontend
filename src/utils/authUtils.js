// client/src/utils/authUtils.js
import axios from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config and credentials enabled
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // This is crucial for sending/receiving cookies
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Expires": "0",
  },
});

// Request interceptor for logging
authApi.interceptors.request.use(
  (config) => {
    console.log(`Making auth request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Auth request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => {
    console.log(`Auth response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(
      "Auth response error:",
      error.response?.data || error.message,
    );

    // Handle 401 errors (authentication failed) or 403 suspended
    if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.message === "Your account has been suspended.")) {
      // Clear any stored user data and emit logout event
      localStorage.removeItem("userData");
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  },
);

/**
 * Register a new user
 */
export const registerUser = async (userData, profileImg = null) => {
  try {
    const formData = new FormData();

    // Add required fields
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);

    // Add optional profile image
    if (profileImg) {
      formData.append("profileImg", profileImg);
    }

    const response = await authApi.post("/api/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.result === 1) {
      // Store user data in localStorage (not the token, that's in cookies)
      const userData = response.data.data;
      localStorage.setItem("userData", JSON.stringify(userData));

      return {
        success: true,
        message: response.data.message,
        user: userData,
      };
    } else {
      throw new Error(response.data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error(
            message || "Invalid registration data. Please check your inputs.",
          );
        case 409:
          throw new Error(
            "Email or username already exists. Please try different credentials.",
          );
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(`Registration failed (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error("Network error. Please check your internet connection.");
    } else {
      throw new Error(
        error.message || "Registration failed. Please try again.",
      );
    }
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials, remember = false) => {
  try {
    const loginData = {
      email: credentials.email,
      password: credentials.password,
    };

    // Add remember field if true
    if (remember) {
      loginData.remember = "on";
    }

    const response = await authApi.post("/api/users/login", loginData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Handle already logged in case
    if (response.data.loggedIn === true) {
      if (response.data.data) {
        localStorage.setItem("userData", JSON.stringify(response.data.data));
      }
      return {
        success: true,
        message: response.data.message,
        alreadyLoggedIn: true,
        user: response.data.data,
      };
    }

    // Handle successful login
    if (response.data.result === 1) {
      const userData = response.data.data;

      // Store user data in localStorage (token is automatically set in cookies)
      localStorage.setItem("userData", JSON.stringify(userData));

      return {
        success: true,
        message: response.data.message,
        user: userData,
      };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          throw new Error(
            message ||
              "Invalid credentials. Please check your email and password.",
          );
        case 403:
          throw new Error("Account deactivated. Please contact support.");
        case 401:
          throw new Error("Invalid email or password. Please try again.");
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(`Login failed (${status}): ${message}`);
      }
    } else if (error.request) {
      throw new Error("Network error. Please check your internet connection.");
    } else {
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const response = await authApi.get("/api/users/logout");

    // Clear user data from localStorage (cookies are cleared by the server)
    localStorage.removeItem("userData");

    // Emit logout event
    window.dispatchEvent(new Event("auth:logout"));

    return {
      success: true,
      message: response.data.message || "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear user data even if API call fails
    localStorage.removeItem("userData");

    // Emit logout event
    window.dispatchEvent(new Event("auth:logout"));

    return {
      success: true,
      message: "Logged out locally",
    };
  }
};

/**
 * Check if user is authenticated by checking stored user data
 */
export const isAuthenticated = () => {
  const userData = localStorage.getItem("userData");
  return !!userData;
};

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Request a password reset email
 * @param {string} email - The user's email address
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await authApi.post("/api/users/forget-password", { email });
    return {
      success: true,
      message: response.data.message || "Reset link sent!",
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to send reset link.");
    }
    throw new Error(error.message || "Network error. Please check your internet connection.");
  }
};

/**
 * Reset password using token
 * @param {string} resetToken - The token from the email link
 * @param {string} password - The new password
 */
export const resetPasswordWithToken = async (resetToken, password) => {
  try {
    const response = await authApi.post("/api/users/reset-password", { resetToken, password });
    return {
      success: true,
      message: response.data.message || "Password reset successfully!",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to reset password.");
    }
    throw new Error(error.message || "Network error. Please check your internet connection.");
  }
};

/**
 * Verify authentication by making a test request
 * This will use the cookies automatically
 */
export const verifyAuth = async () => {
  try {
    // Use the profile endpoint to verify auth status and get fresh user data
    const response = await authApi.get("/api/users/profile/data");

    // If successful, we are authenticated
    if (response.data && response.data.user) {
      // Update local storage with fresh user data
      const userData = { ...response.data.user };
      localStorage.setItem("userData", JSON.stringify(userData));

      return {
        success: true,
        authenticated: true,
        user: userData,
      };
    }

    // If we get here with no error, but not already logged in,
    // it means the credentials were wrong but we might still be authenticated
    // Let's check if we have user data
    const userData = getCurrentUser();
    return {
      success: true,
      authenticated: !!userData,
      user: userData,
    };
  } catch (error) {
    // If we get 401/403, we're not authenticated
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        success: true,
        authenticated: false,
        user: null,
      };
    }

    // For other errors, assume we might still be authenticated if we have user data
    const userData = getCurrentUser();
    return {
      success: true,
      authenticated: !!userData,
      user: userData,
    };
  }
};

/**
 * Auto-login check - verify if user is still authenticated
 */
export const autoLogin = async () => {
  try {
    if (!isAuthenticated()) {
      return { success: false, message: "No stored user data" };
    }

    const authCheck = await verifyAuth();

    if (authCheck.authenticated) {
      return {
        success: true,
        user: authCheck.user,
        message: "Auto-login successful",
      };
    } else {
      // Clear invalid user data
      localStorage.removeItem("userData");
      return {
        success: false,
        message: "Session expired, please log in again",
      };
    }
  } catch (error) {
    console.error("Auto-login error:", error);
    localStorage.removeItem("userData");
    return {
      success: false,
      message: "Auto-login failed",
    };
  }
};

/**
 * Update user data in localStorage
 */
export const updateUserData = (userData) => {
  try {
    localStorage.setItem("userData", JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Error updating user data:", error);
    return false;
  }
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem("userData");
  window.dispatchEvent(new Event("auth:logout"));
};

/**
 * Make an authenticated request (helper function)
 */
export const makeAuthenticatedRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
    };

    if (data) {
      config.data = data;
    }

    const response = await authApi(config);
    return response.data;
  } catch (error) {
    console.error(`Authenticated ${method} request to ${url} failed:`, error);
    throw error;
  }
};

/**
 * Check authentication status by attempting to access a protected route
 * Alternative method if the login endpoint doesn't work for verification
 */
export const checkAuthStatus = async () => {
  try {
    // This is a placeholder - replace with an actual protected endpoint when available
    // For now, we'll just return based on stored user data
    const userData = getCurrentUser();

    if (userData) {
      return {
        success: true,
        authenticated: true,
        user: userData,
      };
    } else {
      return {
        success: true,
        authenticated: false,
        user: null,
      };
    }
  } catch (error) {
    console.error("Auth status check error:", error);
    return {
      success: false,
      authenticated: false,
      user: null,
      error: error.message,
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data (name, username, phone)
 * @param {File} profileImg - Optional profile image file
 * @returns {Promise<Object>} - Updated user object
 */
export const updateProfile = async (profileData, profileImg = null) => {
  try {
    const formData = new FormData();

    // Append data fields
    if (profileData.name) formData.append("name", profileData.name);
    if (profileData.username) formData.append("username", profileData.username);
    if (profileData.phone) formData.append("phone", profileData.phone);

    // Add optional profile image
    if (profileImg) {
      formData.append("profileImg", profileImg);
    }

    const response = await authApi.put("/api/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });

    // The backend returns user data, update local storage
    if (response.data.user) {
      // Merge with existing data to avoid losing any fields
      const existingData = JSON.parse(localStorage.getItem("userData") || "{}")
      const mergedUser = { ...existingData, ...response.data.user }
      localStorage.setItem("userData", JSON.stringify(mergedUser));
      return {
        success: true,
        user: mergedUser,
      };
    }

    return {
      success: true,
      user: response.data.user,
      message: response.data.message,
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      throw new Error(message || `Update failed (${status})`);
    } else if (error.request) {
      throw new Error("Network error. Please check your internet connection.");
    } else {
      throw new Error(
        error.message || "Profile update failed. Please try again.",
      );
    }
  }
};

/**
 * Sync playback state to backend
 */
export const syncPlaybackState = async (songId, currentTime) => {
  try {
    // Use native fetch with keepalive: true to ensure the request
    // fires even if the browser tab is being closed
    const response = await fetch(`${API_BASE_URL}/api/users/profile/playback`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      // Since it's a cross-origin request sometimes, ensure credentials are sent
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ songId, currentTime }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    // We don't want to throw error on playback sync since it's a background process
    console.error("Playback sync error:", error);
    return { success: false };
  }
};

/**
 * Change User Password (In-App)
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await authApi.put("/api/users/change-password", {
      oldPassword,
      newPassword,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Failed to change password");
    }
    throw new Error(error.message || "Failed to change password. Please try again.");
  }
};
