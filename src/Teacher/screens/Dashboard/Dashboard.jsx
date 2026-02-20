import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { api } from '@/_services/api';
import WelcomeHeader from './components/WelcomeHeader';
import QuickActions from './components/QuickActions';
import ProfileView from './components/ProfileView';
import Attendencedashboard from '../Pages/Attendance/Dashboard/Dashboard';

const Dashboard = () => {
  const {
    profile,
    loading,
    error,
    fetchProfile,
    getFullName,
    getEmail,
    getMobile,
    getUserType,
    getTeacherId,
    getUserId,
    isLoaded
  } = useUserProfile();

  // Derived values from profile
  const userProfile = profile;
  const fullName = getFullName();
  const email = getEmail();
  const phone = getMobile();
  const userType = getUserType();
  const designation = profile?.designation || 'Teacher';
  const profileImage = profile?.avatar || null;

  // State for allocated programs
  const [allocatedPrograms, setAllocatedPrograms] = useState({
    class_teacher_allocation: [],
    normal_allocation: []
  });
  const [allocatedMentorClasses, setAllocatedMentorClasses] = useState();
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
      const teacherId = getTeacherId();

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

  const fetchAllocatedMentorClasses = async () => {
    try {
      setProgramsLoading(true);
      setProgramsError(null);

      const userId = getUserId(); // or getTeacherId() — whichever your API uses

      if (!userId) {
        setProgramsError('User ID not available');
        return;
      }

      const response = await api.getTeacherAllocatedMentoringClasses(userId);

      console.log('Raw mentoring response:', response); // Keep this for now

      // Extract the actual array safely
      let mentorClasses = [];

      if (response && response.success && Array.isArray(response.data)) {
        mentorClasses = response.data;
      } else if (Array.isArray(response)) {
        mentorClasses = response;
      } else if (response && Array.isArray(response.data)) {
        mentorClasses = response.data;
      } else {
        console.warn('Unexpected mentoring response format:', response);
        mentorClasses = [];
      }

      console.log('Setting allocatedMentorClasses to:', mentorClasses); // ← This should show array

      setAllocatedMentorClasses(mentorClasses); // ← ONLY the array!

    } catch (err) {
      console.error('Error fetching mentoring classes:', err);
      setProgramsError('Failed to load mentoring classes');
      setAllocatedMentorClasses([]); // Ensure it's always an array
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchMentoringStudents = async (collectionId) => {
    try {
      setStudentsLoading(prev => ({ ...prev, [collectionId]: true }));

      const response = await api.getMentoringAllocationsbyCollectionId(collectionId);

      if (response.success) {
        // 🔹 Convert mentoring students to existing structure
        const students = (response.data?.students || []).map(s => ({
          student: {
            studentId: s.student_id,
            firstname: s.firstname,
            middlename: s.middlename,
            lastname: s.lastname,
            rollNumber: s.roll_number,
            program_name: s.program_name,
            class_year_name: s.class_year_name,
            program_id: s.program_id,
            class_year_id: s.class_year_id
          }
        }));

        // 🔹 Set exactly the same way as other student fetches
        setStudentsData(prev => ({
          ...prev,
          [collectionId]: students
        }));

        setStudentsPagination(prev => ({
          ...prev,
          [collectionId]: {
            currentPage: 1,
            totalPages: Math.ceil(students.length / STUDENTS_PER_PAGE)
          }
        }));
      } else {
        console.error('Failed to fetch mentoring students:', response.message);
      }
    } catch (err) {
      console.error('Error fetching mentoring students:', err);
    } finally {
      setStudentsLoading(prev => ({ ...prev, [collectionId]: false }));
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
    if (!isLoaded && !loading) {
      fetchProfile();
    }
  }, [isLoaded, loading, fetchProfile]);

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
    if (isLoaded && showProfileView) {
      fetchAllocatedPrograms();
      fetchAllocatedMentorClasses();
    }
  }, [isLoaded, showProfileView]);

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
        allocatedMentorClasses={allocatedMentorClasses}
        programsLoading={programsLoading}
        programsError={programsError}
        fetchAllocatedPrograms={fetchAllocatedPrograms}
        fetchAllocatedMentorClasses={fetchAllocatedMentorClasses}
        fetchMentoringStudents={fetchMentoringStudents}
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
        {/* Main Dashboard Content */}
        <Attendencedashboard />
      </div>
    </div>
  );
};

export default Dashboard;
