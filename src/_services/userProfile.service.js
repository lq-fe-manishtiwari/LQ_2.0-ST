import { getProfile } from './api.js';

class UserProfileService {
  constructor() {
    this.userProfile = null;
    this.loading = false;
    this.error = null;
    this.subscribers = new Set();
    this.fetchPromise = null; // Track ongoing fetch promise
    this.hasFetched = false; // Track if we've already fetched once
  }

  // Subscribe to profile changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers
  notify() {
    this.subscribers.forEach(callback => callback({
      profile: this.userProfile,
      loading: this.loading,
      error: this.error
    }));
  }

  // Get current profile (cached)
  getCurrentProfile() {
    return {
      profile: this.userProfile,
      loading: this.loading,
      error: this.error
    };
  }

  // Check if user is authenticated
  _isAuthenticated() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const currentUser = localStorage.getItem('currentUser');
      
      if (!refreshToken || !currentUser) {
        return false;
      }

      const parsedToken = JSON.parse(refreshToken);
      const parsedUser = JSON.parse(currentUser);
      
      return !!(parsedToken.token && parsedUser.jti);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Fetch profile from API
  async fetchProfile() {
    // Check authentication first
    if (!this._isAuthenticated()) {
      console.log('User not authenticated, skipping profile fetch');
      return { profile: null, loading: false, error: 'Not authenticated' };
    }

    // If already loaded, return cached data
    if (this.userProfile && this.hasFetched) {
      console.log('Profile already loaded, returning cached data');
      return this.getCurrentProfile();
    }

    // If already loading, return the existing promise
    if (this.loading && this.fetchPromise) {
      console.log('Profile fetch already in progress, waiting for existing request');
      return this.fetchPromise;
    }

    this.loading = true;
    this.error = null;
    this.notify();

    // Create and store the fetch promise
    this.fetchPromise = this._performFetch();
    
    try {
      const result = await this.fetchPromise;
      this.hasFetched = true;
      return result;
    } finally {
      this.fetchPromise = null;
    }
  }

  // Internal method to perform the actual fetch
  async _performFetch() {
    try {
      console.log('Fetching user profile from API...');
      const profileData = await getProfile();
      this.userProfile = profileData;
      this.loading = false;
      this.error = null;
      
      console.log('User profile fetched successfully:', profileData);
      this.notify();
      
      return { profile: profileData, loading: false, error: null };
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      this.loading = false;
      this.error = error.message || 'Failed to fetch user profile';
      this.notify();
      
      return { profile: null, loading: false, error: this.error };
    }
  }

  // Get specific user data with fallbacks
  getUserId() {
    return this.userProfile?.user?.user_id || this.userProfile?.teacher_id || null;
  }

  getTeacherId() {
    return this.userProfile?.teacher_id || null;
  }

  getCollegeId() {
    return this.userProfile?.college_id || null;
  }

  getEmployeeId() {
    return this.userProfile?.employee_id || null;
  }

  getFullName() {
    const { firstname, middlename, lastname } = this.userProfile || {};
    return [firstname, middlename, lastname].filter(Boolean).join(' ') || 'Unknown User';
  }

  getEmail() {
    return this.userProfile?.email || null;
  }

  getMobile() {
    return this.userProfile?.mobile || null;
  }

  getUserType() {
    return this.userProfile?.user?.user_type || 'TEACHER';
  }

  getUsername() {
    return this.userProfile?.user?.username || null;
  }

  isActive() {
    return this.userProfile?.user?.active || false;
  }

  getRoles() {
    return this.userProfile?.user?.roles || [];
  }

  getAuthorities() {
    return this.userProfile?.user?.authorities || [];
  }

  // Get all essential IDs for API calls
  getEssentialIds() {
    return {
      userId: this.getUserId(),
      teacherId: this.getTeacherId(),
      collegeId: this.getCollegeId(),
      employeeId: this.getEmployeeId()
    };
  }

  // Clear profile data
  clearProfile() {
    this.userProfile = null;
    this.loading = false;
    this.error = null;
    this.hasFetched = false;
    this.fetchPromise = null;
    this.notify();
  }

  // Check if profile is loaded
  isProfileLoaded() {
    return this.userProfile !== null && !this.loading && this.hasFetched;
  }

  // Refresh profile (force fetch)
  async refreshProfile() {
    console.log('Force refreshing user profile...');
    this.userProfile = null;
    this.hasFetched = false;
    this.fetchPromise = null;
    return await this.fetchProfile();
  }

  // Method to be called after successful login
  async initializeAfterLogin() {
    console.log('Initializing profile after login...');
    this.userProfile = null;
    this.hasFetched = false;
    this.fetchPromise = null;
    this.loading = false;
    this.error = null;
    
    // Fetch profile now that user is authenticated
    return await this.fetchProfile();
  }
}

// Create singleton instance
const userProfileService = new UserProfileService();

export default userProfileService;