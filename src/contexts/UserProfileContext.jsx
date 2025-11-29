import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/_services/api';

// Create the context
const UserProfileContext = createContext();

// Custom hook to use the context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// Provider component
export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current user from localStorage to determine user type
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userType = currentUser?.iss; // 'STUDENT' or 'TEACHER'
      
      // Call the appropriate API endpoint based on user type
      const response = await api.getUserProfile(userType);
      
      if (response.success) {
        setUserProfile(response.data);
      } else {
        setError(response.message || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile data
  const updateProfile = (newProfileData) => {
    setUserProfile(prev => ({
      ...prev,
      ...newProfileData
    }));
  };

  // Clear profile data (useful for logout)
  const clearProfile = () => {
    setUserProfile(null);
    setError(null);
  };

  // Auto-fetch profile when component mounts and user is logged in
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (refreshToken && currentUser && !userProfile) {
      fetchProfile();
    }
  }, []);

  const contextValue = {
    userProfile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    clearProfile,
    // Helper getters for common profile fields
    get fullName() {
      return userProfile?.fullName || userProfile?.name || '';
    },
    get designation() {
      return userProfile?.designation || '';
    },
    get userType() {
      return userProfile?.userType || JSON.parse(localStorage.getItem('currentUser') || '{}')?.iss || '';
    },
    get profileImage() {
      return userProfile?.profileImage || userProfile?.avatar || '';
    },
    get email() {
      return userProfile?.email || '';
    },
    get phone() {
      return userProfile?.phone || userProfile?.mobile || '';
    }
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileContext;