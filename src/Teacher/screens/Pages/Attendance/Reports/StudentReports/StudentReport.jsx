import React, { useState } from 'react';
import DailyReport from './DailyReport';
import MonthlyReport from '../MonthlyReport';
// import SubjectWiseReport from '../SubjectWiseReport';
// import DefaulterReport from '../DefaulterReport';
// import DivisionComparison from '../DivisionComparison';
// import DateRangeReport from '../DateRangeReport';

const StudentReports = () => {
    const [activeReport, setActiveReport] = useState('daily');

    const reportTabs = [
        { id: 'daily', label: 'Daily Summary', icon: '📅' },
        { id: 'monthly', label: 'Attendance Summary', icon: '📊' },
        // { id: 'subject', label: 'Subject-wise', icon: '📚' },
        // { id: 'defaulter', label: 'Defaulters', icon: '⚠️' },
        // { id: 'division', label: 'Division Compare', icon: '📈' },
        // { id: 'daterange', label: 'Date Range', icon: '🔍' }
    ];

    const renderReport = () => {
        switch (activeReport) {
            case 'daily':
                return <DailyReport />;
            case 'monthly':
                return <MonthlyReport />;
            // case 'subject':
            //     return <SubjectWiseReport />;
            // case 'defaulter':
            //     return <DefaulterReport />;
            // case 'division':
            //     return <DivisionComparison />;
            // case 'daterange':
            //     return <DateRangeReport />;
            default:
                return <DailyReport />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mb-px">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReport(tab.id)}
                            className={`flex-shrink-0 px-4 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${activeReport === tab.id
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Content */}
            <div>
                {renderReport()}
            </div>
        </div>
    );
};

export default StudentReports;
