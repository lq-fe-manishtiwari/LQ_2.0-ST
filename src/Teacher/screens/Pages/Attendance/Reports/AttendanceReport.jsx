import React, { useState } from 'react';
import StudentReports from './StudentReports/StudentReport';
import TeacherReports from './TeacherReports/TeacherReport';
// import StaffReports from './StaffReports/StaffReports';

const AttendanceReports = () => {
    const [activeTab, setActiveTab] = useState('student');

    const tabs = [
        { id: 'student', label: 'Student Reports', icon: '🎓' },
        { id: 'teacher', label: 'Teacher Reports', icon: '👨‍🏫' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'student':
                return <StudentReports />;
            case 'teacher':
                return <TeacherReports />;
            default:
                return <StudentReports />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Attendance Reports
                </h2>
                <p className="text-gray-600">
                    Generate and view comprehensive attendance reports
                </p>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[180px] px-6 py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">{tab.icon}</span>
                                <span className="font-semibold">{tab.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default AttendanceReports;
