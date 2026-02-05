import React from 'react';

const AcademicInfo = ({ userProfile }) => {
  const academicDetails = [
    {
      label: 'Employee ID',
      value: userProfile?.employee_id || 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    },
    {
      label: 'Department',
      value: userProfile?.department?.department_name || userProfile?.department_name || 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      label: 'Qualification',
      value: userProfile?.qualification || 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    {
      label: 'Experience',
      value: userProfile?.experience ? `${userProfile.experience} years` : 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Specialization',
      value: userProfile?.specialization || 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      label: 'Join Date',
      value: userProfile?.date_of_joining ? new Date(userProfile.date_of_joining).toLocaleDateString() : 'Not provided',
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const qualifications = userProfile?.qualifications || [];
  const achievements = userProfile?.achievements || [];

  return (
    <div className="space-y-10">
      {/* Dynamic Academic Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicDetails.map((detail, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex items-center mb-3">
              <div className="p-1.5 bg-gray-50 rounded-md">{detail.icon}</div>
              <label className="block text-xs font-black uppercase text-gray-400 ml-3 tracking-wider">{detail.label}</label>
            </div>
            <p className="text-gray-900 font-bold text-lg break-words">{detail.value}</p>
          </div>
        ))}
      </div>

      {qualifications.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            Detailed Qualifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualifications.map((qual, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
                  {qual.year || index + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{qual.degree || qual.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{qual.university || qual.board || 'Institution N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            Achievements
          </h3>
          <div className="space-y-4">
            {achievements.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!qualifications.length && !achievements.length) && (
        <div className="py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
          <p className="text-gray-500 font-bold">No additional academic records found.</p>
        </div>
      )}
    </div>
  );
};

export default AcademicInfo;