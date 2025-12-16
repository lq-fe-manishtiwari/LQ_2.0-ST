import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { api } from '@/_services/api';
import WelcomeHeader from './components/WelcomeHeader';
import QuickActions from './components/QuickActions';
import ProfileView from './components/ProfileView';

const Dashboard = () => {
  const {
    userProfile,
    loading,
    error,
    fetchProfile,
    fullName,
    designation,
    userType,
    profileImage,
    email,
    phone
  } = useUserProfile();

  // State for allocated programs
  const [allocatedPrograms, setAllocatedPrograms] = useState({
    class_teacher_allocation: [],
    normal_allocation: []
  });
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState(null);
  
  // State for teacher dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [studentsData, setStudentsData] = useState({});
  const [studentsLoading, setStudentsLoading] = useState({});
  const [showProfileView, setShowProfileView] = useState(false);
  
  // Pagination state for students
  const [studentsPagination, setStudentsPagination] = useState({});
  const STUDENTS_PER_PAGE = 10;

  // Function to fetch allocated programs
  const fetchAllocatedPrograms = async () => {
    try {
      setProgramsLoading(true);
      setProgramsError(null);
      
      // Get teacher ID from user profile response
      const teacherId = userProfile?.teacher_id;
      
      if (teacherId) {
        const response = await api.getTeacherAllocatedPrograms(teacherId);
        
        if (response.success) {
          // Handle new API structure with two sections
          const data = response.data;
          if (data && (data.class_teacher_allocation || data.normal_allocation)) {
            setAllocatedPrograms({
              class_teacher_allocation: data.class_teacher_allocation || [],
              normal_allocation: data.normal_allocation || []
            });
          } else {
            // Fallback for old API structure
            setAllocatedPrograms({
              class_teacher_allocation: [],
              normal_allocation: data?.programs || data || []
            });
          }
        } else {
          setProgramsError(response.message || 'Failed to fetch allocated programs');
        }
      } else {
        setProgramsError('Teacher ID not found in profile');
      }
    } catch (err) {
      console.error('Error fetching allocated programs:', err);
      setProgramsError(err.message || 'An error occurred while fetching programs');
    } finally {
      setProgramsLoading(false);
    }
  };

  // Function to fetch students for a specific program
  const fetchStudents = async (allocation) => {
    const allocationId = allocation.allocation_id;
    
    try {
      setStudentsLoading(prev => ({ ...prev, [allocationId]: true }));
      
      const response = await api.getStudentsByFilters(
        allocation.program_id,
        allocation.academic_year_id,
        allocation.semester_id,
        allocation.division_id
      );
      
      if (response.success) {
        setStudentsData(prev => ({ ...prev, [allocationId]: response.data }));
        // Initialize pagination for this allocation
        setStudentsPagination(prev => ({ 
          ...prev, 
          [allocationId]: { currentPage: 1, totalPages: Math.ceil(response.data.length / STUDENTS_PER_PAGE) }
        }));
      } else {
        console.error('Failed to fetch students:', response.message);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setStudentsLoading(prev => ({ ...prev, [allocationId]: false }));
    }
  };

  // Function to get paginated students
  const getPaginatedStudents = (allocationId) => {
    const students = studentsData[allocationId] || [];
    const pagination = studentsPagination[allocationId] || { currentPage: 1 };
    const startIndex = (pagination.currentPage - 1) * STUDENTS_PER_PAGE;
    const endIndex = startIndex + STUDENTS_PER_PAGE;
    return students.slice(startIndex, endIndex);
  };

  // Function to change page
  const changePage = (allocationId, newPage) => {
    setStudentsPagination(prev => ({
      ...prev,
      [allocationId]: { ...prev[allocationId], currentPage: newPage }
    }));
  };

  useEffect(() => {
    // Fetch profile data when component mounts
    if (!userProfile) {
      fetchProfile();
    }
  }, [userProfile, fetchProfile]);

  // Function to fetch teacher dashboard data
  const fetchTeacherDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      
      const response = await api.getTeacherDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
        const activeCollege = {
          id: response?.data?.college_id || response?.data?.id, 
          name: response?.data?.college_name
        }
        
        // Save to localStorage
        localStorage.setItem('activeCollege', JSON.stringify(activeCollege));
      } else {
        setDashboardError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setDashboardError(err.message || 'An error occurred while fetching dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    // Fetch allocated programs when user profile is available and profile view is shown
    if (userProfile && showProfileView) {
      fetchAllocatedPrograms();
    }
  }, [userProfile, showProfileView]);
  
  useEffect(() => {
    // Fetch teacher dashboard data when component mounts
    fetchTeacherDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={fetchProfile}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If showing profile view, render the ProfileView component
  if (showProfileView) {
    return (
      <ProfileView
        userProfile={userProfile}
        fullName={fullName}
        email={email}
        phone={phone}
        designation={designation}
        profileImage={profileImage}
        allocatedPrograms={allocatedPrograms}
        programsLoading={programsLoading}
        programsError={programsError}
        fetchAllocatedPrograms={fetchAllocatedPrograms}
        expandedProgram={expandedProgram}
        setExpandedProgram={setExpandedProgram}
        studentsData={studentsData}
        studentsLoading={studentsLoading}
        fetchStudents={fetchStudents}
        studentsPagination={studentsPagination}
        changePage={changePage}
        getPaginatedStudents={getPaginatedStudents}
        onBack={() => setShowProfileView(false)}
      />
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <WelcomeHeader
          profileImage={profileImage}
          fullName={fullName}
          designation={designation}
          userType={userType}
          onViewProfile={() => setShowProfileView(true)}
        />

        {/* Quick Actions */}
        {/* <QuickActions /> */}

        {/* Main Dashboard Content */}
        {/* <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-6">🎓</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Teacher Dashboard</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Click on your profile to view allocated programs and manage your classes efficiently.
          </p>
          <button
            onClick={() => setShowProfileView(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            View My Profile & Programs
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
