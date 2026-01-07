import React, { createContext, useContext, useEffect, useState } from 'react';
import userProfileService from '../_services/userProfile.service.js';

// Create the context
const UserProfileContext = createContext();

// Custom hook to use the UserProfile context
export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

// UserProfile Provider Component
export const UserProfileProvider = ({ children }) => {
  const [profileState, setProfileState] = useState({
    profile: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Subscribe to profile service changes
    const unsubscribe = userProfileService.subscribe((newState) => {
      setProfileState(newState);
    });

    // Initialize with current state
    const currentState = userProfileService.getCurrentProfile();
    setProfileState(currentState);

    // Check if user is logged in before fetching profile
    const checkAuthAndFetchProfile = () => {
      // Check if user has a valid token
      const refreshToken = localStorage.getItem('refreshToken');
      const currentUser = localStorage.getItem('currentUser');

      if (!refreshToken || !currentUser) {
        console.log('UserProfileProvider: No auth tokens found, skipping profile fetch');
        return;
      }

      try {
        const parsedToken = JSON.parse(refreshToken);
        const parsedUser = JSON.parse(currentUser);

        // Basic validation of token structure
        if (!parsedToken.token || !parsedUser.jti) {
          console.log('UserProfileProvider: Invalid auth tokens, skipping profile fetch');
          return;
        }

        // Only fetch profile if user is authenticated and profile not already loaded
        if (!userProfileService.isProfileLoaded() && !currentState.loading) {
          console.log('UserProfileProvider: User authenticated, initiating profile fetch...');
          userProfileService.fetchProfile();
        } else if (userProfileService.isProfileLoaded()) {
          console.log('UserProfileProvider: Profile already loaded, skipping fetch');
        }
      } catch (error) {
        console.log('UserProfileProvider: Error parsing auth tokens, skipping profile fetch:', error);
      }
    };

    checkAuthAndFetchProfile();

    return unsubscribe;
  }, []); // Empty dependency array to ensure this only runs once

  // Context value with all the helper methods
  const contextValue = {
    // State
    profile: profileState.profile,
    loading: profileState.loading,
    error: profileState.error,
    isLoaded: profileState.profile !== null && !profileState.loading,

    // Service methods
    fetchProfile: () => userProfileService.fetchProfile(),
    refreshProfile: () => userProfileService.refreshProfile(),
    clearProfile: () => userProfileService.clearProfile(),
    initializeAfterLogin: () => userProfileService.initializeAfterLogin(),

    // Helper methods for easy access to user data
    getUserId: () => userProfileService.getUserId(),
    getTeacherId: () => userProfileService.getTeacherId(),
    getCollegeId: () => userProfileService.getCollegeId(),
    getDepartmentId: () => userProfileService.getDepartmentId(),
    getEmployeeId: () => userProfileService.getEmployeeId(),
    getFullName: () => userProfileService.getFullName(),
    getEmail: () => userProfileService.getEmail(),
    getMobile: () => userProfileService.getMobile(),
    getUserType: () => userProfileService.getUserType(),
    getUsername: () => userProfileService.getUsername(),
    isActive: () => userProfileService.isActive(),
    getRoles: () => userProfileService.getRoles(),
    getAuthorities: () => userProfileService.getAuthorities(),
    getEssentialIds: () => userProfileService.getEssentialIds(),

    // Convenience methods for common use cases
    getApiIds: () => {
      const ids = userProfileService.getEssentialIds();
      return {
        userId: ids.userId,
        collegeId: ids.collegeId,
        teacherId: ids.teacherId
      };
    },

    // Check if user has specific role
    hasRole: (roleName) => {
      const roles = userProfileService.getRoles();
      return roles.some(role => role.name === roleName);
    },

    // Check if user has specific authority
    hasAuthority: (authorityName) => {
      const authorities = userProfileService.getAuthorities();
      return authorities.some(auth => auth.authority === authorityName);
    }
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

// HOC for class components (if needed)
export const withUserProfile = (Component) => {
  return function UserProfileComponent(props) {
    const userProfile = useUserProfile();
    return <Component {...props} userProfile={userProfile} />;
  };
};

export default UserProfileContext;