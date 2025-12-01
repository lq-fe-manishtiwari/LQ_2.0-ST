import React from 'react';

const QuickActions = () => {
  const actions = [
    {
      id: 'classes',
      title: 'My Classes',
      description: 'Manage your classes and students',
      icon: '📚',
      bgColor: 'bg-blue-50',
      hoverColor: 'group-hover:bg-blue-100',
      iconColor: 'text-blue-600',
      path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      id: 'assessments',
      title: 'Assessments',
      description: 'Create and manage assessments',
      icon: '📝',
      bgColor: 'bg-green-50',
      hoverColor: 'group-hover:bg-green-100',
      iconColor: 'text-green-600',
      path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View student performance',
      icon: '📊',
      bgColor: 'bg-purple-50',
      hoverColor: 'group-hover:bg-purple-100',
      iconColor: 'text-purple-600',
      path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Access frequently used tools',
      icon: '🎯',
      bgColor: 'bg-orange-50',
      hoverColor: 'group-hover:bg-orange-100',
      iconColor: 'text-orange-600',
      path: 'M13 10V3L4 14h7v7l9-11h-7z'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {actions.map((action) => (
        <div 
          key={action.id}
          className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{action.icon}</div>
            <div className={`${action.bgColor} ${action.hoverColor} rounded-full p-2 transition-colors`}>
              <svg className={`w-5 h-5 ${action.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.path} />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
          <p className="text-gray-600 text-sm">{action.description}</p>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;