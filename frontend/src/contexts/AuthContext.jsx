import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Fast-track: Set loading false immediately if token exists
        // This allows dashboard to render while we verify in background
        setLoading(false);

        // Verify token in background (don't block UI)
        const response = await apiClient.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        } else {
          // Token is invalid, remove it
          apiClient.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiClient.logout();
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setError(null);
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      console.log('Updating profile with:', profileData);
      const response = await apiClient.updateProfile(profileData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        // Update user state with new data
        setUser(response.data.user);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      setError(null);
      
      console.log('Updating preferences with:', preferences);
      const response = await apiClient.updatePreferences(preferences);
      console.log('Preferences update response:', response);
      
      if (response.success) {
        // Update user with new preferences
        setUser(prevUser => ({
          ...prevUser,
          preferences: response.data.preferences
        }));
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Preferences update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      const errorMessage = error.message || 'Preferences update failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      
      console.log('Changing password...');
      const response = await apiClient.changePassword(passwordData);
      console.log('Password change response:', response);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    updatePreferences,
    changePassword,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
