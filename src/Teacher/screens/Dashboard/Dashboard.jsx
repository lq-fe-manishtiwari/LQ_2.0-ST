import React, { useEffect, useState } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { api } from '@/_services/api';

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

  // Helper function to render allocation card with improved design
  const renderAllocationCard = (allocation, index, isClassTeacher = false) => {
    const cardStyle = isClassTeacher 
      ? "border-l-4 border-l-purple-500 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      : "border-l-4 border-l-blue-500 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200";
    
    const badgeStyle = isClassTeacher
      ? "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold"
      : "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold";
    
    const iconColor = isClassTeacher ? "text-purple-600" : "text-blue-600";
    const isExpanded = expandedProgram === allocation.allocation_id;
    const students = studentsData[allocation.allocation_id] || [];
    const pagination = studentsPagination[allocation.allocation_id] || { currentPage: 1, totalPages: 1 };

    return (
      <div key={allocation.allocation_id || index} className={cardStyle}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isClassTeacher ? 'bg-purple-50' : 'bg-blue-50'}`}>
                  {isClassTeacher ? (
                    <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {allocation.program?.program_name || 'Untitled Program'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={badgeStyle}>
                      {isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
                    </span>
                    {allocation.program?.program_code && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {allocation.program.program_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {allocation.batch && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📚</span>
                    <span className="text-gray-700 truncate">{allocation.batch.batch_name}</span>
                  </div>
                )}
                {allocation.semester && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📖</span>
                    <span className="text-gray-700">{allocation.semester.name}</span>
                  </div>
                )}
                {allocation.division && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">🏫</span>
                    <span className="text-gray-700">Div {allocation.division.division_name}</span>
                  </div>
                )}
                {allocation.academic_year && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">📅</span>
                    <span className="text-gray-700">{allocation.academic_year.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {students.length > 0 && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{students.length}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
              )}
              <button
                onClick={() => {
                  const newExpanded = isExpanded ? null : allocation.allocation_id;
                  setExpandedProgram(newExpanded);
                  if (newExpanded && !studentsData[allocation.allocation_id]) {
                    fetchStudents(allocation);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="p-6">
              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {allocation.academic_year && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 mb-1">Academic Year</div>
                    <div className="text-sm font-semibold text-gray-900">{allocation.academic_year.name}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(allocation.academic_year.start_date).toLocaleDateString()} - {new Date(allocation.academic_year.end_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {allocation.batch && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 mb-1">Batch</div>
                    <div className="text-sm font-semibold text-gray-900">{allocation.batch.batch_name}</div>
                    <div className="text-xs text-gray-600">{allocation.batch.batch_code}</div>
                  </div>
                )}
                
                {allocation.semester && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-xs font-medium text-gray-500 mb-1">Semester</div>
                    <div className="text-sm font-semibold text-gray-900">{allocation.semester.name}</div>
                    <div className="text-xs text-gray-600">Semester {allocation.semester.semester_number}</div>
                  </div>
                )}
              </div>
              
              {/* Subjects */}
              {allocation.subjects && allocation.subjects.length > 0 && (
                <div className="bg-white p-4 rounded-lg border mb-6">
                  <div className="text-xs font-medium text-gray-500 mb-2">Subjects</div>
                  <div className="flex flex-wrap gap-2">
                    {allocation.subjects.map((subject, idx) => (
                      <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        {subject.name || subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Students Section with Pagination */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Students</h4>
                      {students.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Showing {((pagination.currentPage - 1) * STUDENTS_PER_PAGE) + 1} to {Math.min(pagination.currentPage * STUDENTS_PER_PAGE, students.length)} of {students.length} students
                        </p>
                      )}
                    </div>
                    {studentsLoading[allocation.allocation_id] && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  {studentsData[allocation.allocation_id] ? (
                    <div>
                      {students.length > 0 ? (
                        <div>
                          {/* Students Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {getPaginatedStudents(allocation.allocation_id).map((studentData, idx) => (
                              <div key={studentData.student?.studentId || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                                  {studentData.student?.firstname ? studentData.student.firstname.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {studentData.student?.firstname} {studentData.student?.lastname}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {studentData.student?.rollNumber && `Roll: ${studentData.student.rollNumber}`}
                                    {studentData.student?.admissionNumber && ` | Adm: ${studentData.student.admissionNumber}`}
                                  </div>
                                  {studentData.student?.email && (
                                    <div className="text-xs text-gray-500 truncate">{studentData.student.email}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Pagination */}
                          {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <button
                                onClick={() => changePage(allocation.allocation_id, pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              
                              <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (pagination.currentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                  } else {
                                    pageNum = pagination.currentPage - 2 + i;
                                  }
                                  
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => changePage(allocation.allocation_id, pageNum)}
                                      className={`w-8 h-8 text-sm rounded ${
                                        pagination.currentPage === pageNum
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              <button
                                onClick={() => changePage(allocation.allocation_id, pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-3xl mb-2">👥</div>
                          <p className="text-sm">No students found for this program</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-3xl mb-2">👥</div>
                      <p className="text-sm">
                        {studentsLoading[allocation.allocation_id] ? 'Loading students...' : 'Click to load students'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    // Fetch profile data when component mounts
    if (!userProfile) {
      fetchProfile();
    }
  }, [userProfile, fetchProfile]);

  useEffect(() => {
    // Fetch allocated programs when user profile is available and profile view is shown
    if (userProfile && showProfileView) {
      fetchAllocatedPrograms();
    }
  }, [userProfile, showProfileView]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setShowProfileView(true)}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-blue-200 hover:border-blue-300">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Welcome back, {fullName || 'User'}!
                </h1>
                {designation && (
                  <p className="text-gray-600 mb-2">{designation}</p>
                )}
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {userType || 'User'}
                  </span>
                  <button
                    onClick={() => setShowProfileView(true)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📚</div>
              <div className="bg-blue-50 group-hover:bg-blue-100 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Classes</h3>
            <p className="text-gray-600 text-sm">Manage your classes and students</p>
          </div>

          <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📝</div>
              <div className="bg-green-50 group-hover:bg-green-100 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessments</h3>
            <p className="text-gray-600 text-sm">Create and manage assessments</p>
          </div>

          <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">📊</div>
              <div className="bg-purple-50 group-hover:bg-purple-100 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View student performance</p>
          </div>

          <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">🎯</div>
              <div className="bg-orange-50 group-hover:bg-orange-100 rounded-full p-2 transition-colors">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600 text-sm">Access frequently used tools</p>
          </div>
        </div>

        {/* Conditional Content */}
        {!showProfileView ? (
          /* Main Dashboard Content */
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-6">🎓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Teacher Dashboard</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Click on your profile to view allocated programs and manage your classes efficiently.</p>
            <button
              onClick={() => setShowProfileView(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              View My Profile & Programs
            </button>
          </div>
        ) : (
          /* Profile View with Allocated Programs */
          <div>
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowProfileView(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-white px-4 py-2 rounded-lg border hover:shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{fullName || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{email || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{phone || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <p className="text-gray-900">{designation || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Allocated Programs Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Allocated Programs</h2>
                {programsLoading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
              </div>
              
              {programsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span>{programsError}</span>
                    <button
                      onClick={fetchAllocatedPrograms}
                      className="ml-4 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!programsLoading && !programsError && (
                <div>
                  {(allocatedPrograms.class_teacher_allocation.length > 0 || allocatedPrograms.normal_allocation.length > 0) ? (
                    <div className="space-y-8">
                      {/* Class Teacher Allocations Section */}
                      {allocatedPrograms.class_teacher_allocation.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-3 rounded-xl">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">Class Teacher Allocations</h3>
                              <p className="text-sm text-gray-600">Programs where you serve as the class teacher</p>
                            </div>
                            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                              {allocatedPrograms.class_teacher_allocation.length} {allocatedPrograms.class_teacher_allocation.length === 1 ? 'Program' : 'Programs'}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {allocatedPrograms.class_teacher_allocation.map((allocation, index) => 
                              renderAllocationCard(allocation, index, true)
                            )}
                          </div>
                        </div>
                      )}

                      {/* Normal Allocations Section */}
                      {allocatedPrograms.normal_allocation.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-3 rounded-xl">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">Subject Teaching Allocations</h3>
                              <p className="text-sm text-gray-600">Programs where you teach specific subjects</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                              {allocatedPrograms.normal_allocation.length} {allocatedPrograms.normal_allocation.length === 1 ? 'Program' : 'Programs'}
                            </div>
                          </div>
                          <div className="space-y-4">
                            {allocatedPrograms.normal_allocation.map((allocation, index) => 
                              renderAllocationCard(allocation, index, false)
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-gray-400 text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Allocated</h3>
                      <p className="text-gray-500">You don't have any programs allocated at the moment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
