import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/_services/api';
import { StudentService } from "../Student/screens/Pages/Profile/Student.Service";

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
  const [studentHistory, setStudentHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

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

  // Fetch student history
// Fetch student history
const fetchStudentHistory = async () => {
  try {
    setHistoryLoading(true);
    setHistoryError(null);
    
    // Get studentId from userProfile or localStorage
    let studentId = userProfile?.id || userProfile?.student_id;
    
    if (!studentId) {
      // If not in userProfile, try to get from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      studentId = currentUser?.id || currentUser?.studentId;
    }
    
    if (!studentId) {
      throw new Error('Student ID not found');
    }
    
    const response = await StudentService.getStudentHistory(studentId);
    
    // Response mapping logic (StudentAcademicJourney से लिया गया)
    const toTimestamp = (v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return v;
      // if already a numeric string
      if (!Number.isNaN(Number(v)) && v.toString().trim() !== '') return Number(v);
      // try ISO/date string
      const parsed = Date.parse(v);
      return isNaN(parsed) ? null : Math.floor(parsed / 1000);
    };

    let rawData = [];
    if (Array.isArray(response)) {
      rawData = response;
    } else if (response && Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && typeof response === "object") {
      rawData = response.history || response.records || [];
    }

    const mappedData = rawData.map((item) => ({
      ...item,
      // ids & basic
      id: item.id ?? item.student_history_id ?? null,
      student_id: item.student_id ?? null,
      student_name: item.student_name ?? item.name ?? null,
      roll_number: item.roll_number ?? item.rollNo ?? item.roll ?? null,
      is_active: typeof item.is_active === 'boolean' ? item.is_active : !!item.active,

      // flattened labels for UI (with fallbacks)
      class_name: item.class_name
        ?? item.academic_year?.program?.program_name
        ?? item.academic_year?.class_year?.name
        ?? (item.academic_year?.year_number ? `Year ${item.academic_year.year_number}` : null),
      academic_year_name: item.academic_year?.name ?? item.academic_year_name ?? null,
      semester_name: item.semester?.name ?? item.semester_name ?? null,
      batch_name: item.academic_year?.batch?.batch_name ?? item.academic_year?.batch?.batch_code ?? null,
      division_name: item.division?.division_name ?? item.division?.name ?? item.division_name ?? null,

      // timeline timestamps: prefer explicit fields, else try related dates
      allocated_at: toTimestamp(item.allocated_at ?? item.allocatedAt ?? item.allocation_at ?? item.academic_year?.start_date ?? null),
      promoted_at: toTimestamp(item.promoted_at ?? item.promotedAt ?? item.promotion_at ?? null),
      deallocated_at: toTimestamp(item.deallocated_at ?? item.deallocatedAt ?? item.deallocation_at ?? null),

      _raw: item,
    }));

    // success check based on your API response structure
    if (response.success || response.status === 'success' || response.status === 200) {
      setStudentHistory(mappedData);
    } else {
      setHistoryError(response.message || 'Failed to fetch student history');
    }
    
  } catch (err) {
    console.error('Error fetching student history:', err);
    setHistoryError(err.message || 'An error occurred while fetching student history');
  } finally {
    setHistoryLoading(false);
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
    setStudentHistory(null);
    setError(null);
    setHistoryError(null);
  };

  // Auto-fetch profile when component mounts and user is logged in
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (refreshToken && currentUser && !userProfile) {
      fetchProfile();
    }
  }, []);

  // Auto-fetch student history when userProfile changes and user is a student
  useEffect(() => {
    if (userProfile) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userType = currentUser?.iss || userProfile?.userType;
      
      if (userType === 'STUDENT') {
        fetchStudentHistory();
      }
    }
  }, [userProfile]);

  const contextValue = {
    userProfile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    clearProfile,
    // Student history related
    studentHistory,
    historyLoading,
    historyError,
    fetchStudentHistory,
    // Helper getters for common profile fields
    get fullName() {
      return userProfile?.firstname + " " + userProfile?.lastname || userProfile?.name || '';
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
    },
    get isStudent() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userType = currentUser?.iss || userProfile?.userType;
      return userType === 'STUDENT';
    }
  };

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileContext;