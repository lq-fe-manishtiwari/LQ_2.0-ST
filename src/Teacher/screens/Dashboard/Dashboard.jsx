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
  const [allocatedPrograms, setAllocatedPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [programsError, setProgramsError] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [studentsData, setStudentsData] = useState({});
  const [studentsLoading, setStudentsLoading] = useState({});
  const [showProfileView, setShowProfileView] = useState(false);

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
          setAllocatedPrograms(response.data?.programs || response.data || []);
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
      } else {
        console.error('Failed to fetch students:', response.message);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setStudentsLoading(prev => ({ ...prev, [allocationId]: false }));
    }
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
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
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
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold border-2 border-blue-200 hover:border-blue-300">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Welcome back, {fullName || 'User'}!
              </h1>
              {designation && (
                <p className="text-gray-600 mb-1">{designation}</p>
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
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📚</div>
            <div className="bg-blue-100 rounded-full p-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">My Classes</h3>
          <p className="text-gray-600 text-sm">Manage your classes and students</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📝</div>
            <div className="bg-green-100 rounded-full p-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Assessments</h3>
          <p className="text-gray-600 text-sm">Create and manage assessments</p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">📊</div>
            <div className="bg-purple-100 rounded-full p-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm">View student performance</p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">🎯</div>
            <div className="bg-orange-100 rounded-full p-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
          <p className="text-gray-600 text-sm">Access frequently used tools</p>
        </div>
      </div>

      {/* Conditional Content */}
      {!showProfileView ? (
        /* Main Dashboard Content */
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-6">🎓</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Teacher Dashboard</h2>
          <p className="text-gray-600 mb-8">Click on your profile to view allocated programs and manage your classes.</p>
          <button
            onClick={() => setShowProfileView(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">My Allocated Programs</h2>
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
                {allocatedPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {allocatedPrograms.map((allocation, index) => (
                      <div key={allocation.allocation_id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            const newExpanded = expandedProgram === allocation.allocation_id ? null : allocation.allocation_id;
                            setExpandedProgram(newExpanded);
                            if (newExpanded && !studentsData[allocation.allocation_id]) {
                              fetchStudents(allocation);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {allocation.program?.program_name || 'Untitled Program'}
                                </h3>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                  {allocation.program?.program_code || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {allocation.batch && (
                                  <span>📚 {allocation.batch.batch_name}</span>
                                )}
                                {allocation.semester && (
                                  <span>📖 {allocation.semester.name}</span>
                                )}
                                {allocation.division && (
                                  <span>🏫 Division {allocation.division.division_name}</span>
                                )}
                                {allocation.academic_year && (
                                  <span>📅 {allocation.academic_year.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">ID: {allocation.allocation_id}</span>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedProgram === allocation.allocation_id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {expandedProgram === allocation.allocation_id && (
                          <div className="border-t border-gray-200 bg-gray-50 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {allocation.academic_year && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Academic Year</div>
                                  <div className="text-gray-900 font-semibold">{allocation.academic_year.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(allocation.academic_year.start_date).toLocaleDateString()} - {new Date(allocation.academic_year.end_date).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                              
                              {allocation.batch && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Batch</div>
                                  <div className="text-gray-900 font-semibold">{allocation.batch.batch_name}</div>
                                  <div className="text-sm text-gray-600">{allocation.batch.batch_code}</div>
                                </div>
                              )}
                              
                              {allocation.semester && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Semester</div>
                                  <div className="text-gray-900 font-semibold">{allocation.semester.name}</div>
                                  <div className="text-sm text-gray-600">Semester {allocation.semester.semester_number}</div>
                                </div>
                              )}
                              
                              {allocation.division && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Division</div>
                                  <div className="text-gray-900 font-semibold">{allocation.division.division_name}</div>
                                </div>
                              )}
                              
                              {allocation.academic_year?.class_year && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Class Year</div>
                                  <div className="text-gray-900 font-semibold">{allocation.academic_year.class_year.name}</div>
                                </div>
                              )}
                              
                              {allocation.academic_year && (
                                <div className="bg-white p-4 rounded-lg border border-gray-100">
                                  <div className="text-sm font-medium text-gray-700 mb-2">Year Number</div>
                                  <div className="text-gray-900 font-semibold">Year {allocation.academic_year.year_number}</div>
                                </div>
                              )}
                            </div>
                            
                            {allocation.subjects && allocation.subjects.length > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-gray-100 mb-4">
                                <div className="text-sm font-medium text-gray-700 mb-2">Subjects</div>
                                <div className="flex flex-wrap gap-2">
                                  {allocation.subjects.map((subject, idx) => (
                                    <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                                      {subject.name || subject}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Students Section */}
                            <div className="bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium text-gray-700">Students</div>
                                {studentsLoading[allocation.allocation_id] && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                )}
                              </div>
                              
                              {studentsData[allocation.allocation_id] ? (
                                <div>
                                  {studentsData[allocation.allocation_id].length > 0 ? (
                                    <div className="space-y-2">
                                      {studentsData[allocation.allocation_id].map((studentData, idx) => (
                                        <div key={studentData.student?.studentId || idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                                            {studentData.student?.firstname ? studentData.student.firstname.charAt(0).toUpperCase() : 'S'}
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                              {studentData.student?.firstname} {studentData.student?.lastname}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {studentData.student?.rollNumber && `Roll: ${studentData.student.rollNumber}`}
                                              {studentData.student?.admissionNumber && ` | Admission: ${studentData.student.admissionNumber}`}
                                              {studentData.student?.studentId && ` | ID: ${studentData.student.studentId}`}
                                            </div>
                                            {studentData.student?.email && (
                                              <div className="text-xs text-gray-500">{studentData.student.email}</div>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            {studentData.allocation?.division && (
                                              <div className="text-xs text-gray-600 mb-1">
                                                Division: {studentData.allocation.division.divisionName}
                                              </div>
                                            )}
                                            {studentData.allocation?.semester && (
                                              <div className="text-xs text-gray-600">
                                                {studentData.allocation.semester.name} (Sem {studentData.allocation.semester.semesterNumber})
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <div className="text-2xl mb-2">👥</div>
                                      <p className="text-sm">No students found for this program</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  <div className="text-2xl mb-2">👥</div>
                                  <p className="text-sm">
                                    {studentsLoading[allocation.allocation_id] ? 'Loading students...' : 'Students will be loaded when expanded'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Programs Allocated</h3>
                    <p className="text-gray-500">You don't have any programs allocated at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;