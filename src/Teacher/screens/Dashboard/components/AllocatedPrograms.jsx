import React from 'react';

const AllocatedPrograms = ({
  allocatedPrograms,
  allocatedMentorClasses = [],
  programsLoading,
  programsError,
  fetchAllocatedPrograms,
  fetchAllocatedMentorClasses,
  expandedProgram,
  setExpandedProgram,
  studentsData,
  studentsLoading,
  fetchStudents,
  fetchMentoringStudents,  // ← NEW PROP
  studentsPagination,
  changePage,
  getPaginatedStudents
}) => {
  console.log(allocatedMentorClasses);
  const STUDENTS_PER_PAGE = 10;

  const renderAllocationCard = (allocation, index, type = 'subject') => {
    const isMentor = type === 'mentor';
    const keyId = isMentor ? allocation.mentoring_collection_id : allocation.allocation_id;

    const styles = {
      class_teacher: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-800', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badgeText: 'Class Teacher' },
      subject: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-800', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', badgeText: 'Subject Teacher' },
      mentor: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-800', iconBg: 'bg-green-50', iconColor: 'text-green-600', badgeText: 'Mentor' }
    };

    const s = styles[type] || styles.subject;
    const isExpanded = expandedProgram === keyId;
    const students = studentsData[keyId] || [];
    const pagination = studentsPagination[keyId] || { currentPage: 1, totalPages: 1 };

    const displayName = isMentor
      ? allocation.mentoring_collection_name || 'Untitled Mentoring Group'
      : allocation.program?.program_name || 'Untitled Program';

    const studentCount = isMentor ? allocation.student_count : students.length;

    return (
      <div key={keyId} className={`border-l-4 ${s.border} bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200`}>
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${s.iconBg}`}>
                  <svg className={`w-6 h-6 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {type === 'mentor' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    ) : type === 'class_teacher' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    )}
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight truncate mb-1">{displayName}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.badge}`}>
                      {s.badgeText}
                    </span>
                    {isMentor && allocation.subject_name && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {allocation.subject_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick info grid */}
              {!isMentor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  {allocation.batch && <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><span className="text-gray-400 font-bold uppercase text-[10px]">Batch:</span> <span className="font-semibold text-gray-700">{allocation.batch.batch_name}</span></div>}
                  {allocation.semester && <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><span className="text-gray-400 font-bold uppercase text-[10px]">Sem:</span> <span className="font-semibold text-gray-700">{allocation.semester.name}</span></div>}
                  {allocation.division && <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><span className="text-gray-400 font-bold uppercase text-[10px]">Div:</span> <span className="font-semibold text-gray-700">{allocation.division.division_name}</span></div>}
                  {allocation.academic_year && <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"><span className="text-gray-400 font-bold uppercase text-[10px]">Year:</span> <span className="font-semibold text-gray-700">{allocation.academic_year.name}</span></div>}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-start gap-4 pt-4 md:pt-0 border-t md:border-0 border-gray-50">
              {studentCount > 0 && (
                <div className="text-left md:text-right">
                  <div className="text-lg font-black text-gray-900">{studentCount}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Students</div>
                </div>
              )}
              <button
                onClick={() => {
                  const newExpanded = isExpanded ? null : keyId;
                  setExpandedProgram(newExpanded);
                  if (newExpanded && !studentsData[keyId]) {
                    if (isMentor) {
                      fetchMentoringStudents(keyId);
                    } else {
                      fetchStudents(allocation);
                    }
                  }
                }}
                className={`p-2.5 rounded-xl transition-all ${isExpanded ? 'bg-blue-50 text-blue-600 shadow-sm' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="p-3 md:p-6">
              {/* Students Section */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Students</h4>
                      {students.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Showing {((pagination.currentPage - 1) * STUDENTS_PER_PAGE) + 1} to{' '}
                          {Math.min(pagination.currentPage * STUDENTS_PER_PAGE, students.length)} of {students.length}
                        </p>
                      )}
                    </div>
                    {studentsLoading[keyId] && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>

                <div className="p-3 md:p-4">
                  {studentsData[keyId] ? (
                    students.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {getPaginatedStudents(keyId).map((studentData, idx) => {
                            const student = studentData.student || studentData; // adjust based on actual response
                            return (
                              <div key={student.studentId || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                                  {student.firstname?.[0]?.toUpperCase() || 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {student.firstname} {student.middlename} {student.lastname}
                                  </div>
                                  {(student.program_name || student.program?.program_name ||
                                    student.class_year_name || student.class_year?.name) && (
                                      <div className="text-xs text-gray-600 truncate">
                                        {student.program_name || student.program?.program_name}
                                        {(student.program_name || student.program?.program_name) &&
                                          (student.class_year_name || student.class_year?.name) &&
                                          ' | '}
                                        {student.class_year_name || student.class_year?.name}
                                      </div>
                                    )}
                                  <div className="text-xs text-gray-600">
                                    {student.rollNumber && `Roll: ${student.rollNumber}`}
                                    {student.admissionNumber && ` | Adm: ${student.admissionNumber}`}
                                  </div>
                                  {student.email && <div className="text-xs text-gray-500 truncate">{student.email}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {pagination.totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button onClick={() => changePage(keyId, pagination.currentPage - 1)} disabled={pagination.currentPage === 1}
                              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">
                              Previous
                            </button>
                            <div className="flex gap-2">
                              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum = pagination.totalPages <= 5 ? i + 1 :
                                  pagination.currentPage <= 3 ? i + 1 :
                                    pagination.currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i :
                                      pagination.currentPage - 2 + i;
                                return (
                                  <button key={pageNum} onClick={() => changePage(keyId, pageNum)}
                                    className={`w-8 h-8 text-sm rounded ${pagination.currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            <button onClick={() => changePage(keyId, pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}
                              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50">
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No students found</div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {studentsLoading[keyId] ? 'Loading students...' : 'Click arrow to load students'}
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

  return (
    <div className="space-y-8">
      {/* Header & Error */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Allocations</h3>
        {programsLoading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>}
      </div>

      {programsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
          <span>{programsError}</span>
          <button onClick={() => { fetchAllocatedPrograms(); fetchAllocatedMentorClasses(); }}
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm">
            Retry
          </button>
        </div>
      )}

      <div className="space-y-12">
        {/* Class Teacher */}
        {allocatedPrograms.class_teacher_allocation.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-xl"><svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
              <div className="flex-1"><h3 className="text-xl font-bold">Class Teacher Allocations</h3><p className="text-sm text-gray-600">You are the class teacher</p></div>
              <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">{allocatedPrograms.class_teacher_allocation.length} Program{allocatedPrograms.class_teacher_allocation.length > 1 && 's'}</div>
            </div>
            <div className="space-y-4">
              {allocatedPrograms.class_teacher_allocation.map((a, i) => renderAllocationCard(a, i, 'class_teacher'))}
            </div>
          </div>
        )}

        {/* Subject Teacher */}
        {allocatedPrograms.normal_allocation.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-xl"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
              <div className="flex-1"><h3 className="text-xl font-bold">Subject Teaching Allocations</h3><p className="text-sm text-gray-600">You teach specific subjects</p></div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">{allocatedPrograms.normal_allocation.length} Program{allocatedPrograms.normal_allocation.length > 1 && 's'}</div>
            </div>
            <div className="space-y-4">
              {allocatedPrograms.normal_allocation.map((a, i) => renderAllocationCard(a, i, 'subject'))}
            </div>
          </div>
        )}

        {/* Mentoring Classes - NEW SECTION */}
        {allocatedMentorClasses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">My Mentoring Classes</h3>
                <p className="text-sm text-gray-600">Groups you are mentoring</p>
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                {allocatedMentorClasses.length} Group{allocatedMentorClasses.length > 1 && 's'}
              </div>
            </div>
            <div className="space-y-4">
              {allocatedMentorClasses.map((mentorGroup, i) => renderAllocationCard(mentorGroup, i, 'mentor'))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allocatedPrograms.class_teacher_allocation.length === 0 &&
          allocatedPrograms.normal_allocation.length === 0 &&
          allocatedMentorClasses.length === 0 &&
          !programsLoading && !programsError && (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600">No Allocations Yet</h3>
              <p className="text-gray-500 mt-2">You have not been assigned any classes or mentoring groups.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default AllocatedPrograms;