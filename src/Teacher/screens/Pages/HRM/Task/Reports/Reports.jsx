import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DailyLogSheet from './DailyLogSheet';
import SummaryLogSheet from './SummaryLogSheet';

const reportTabs = [
    { id: 'admin-logsheet', label: 'Admin Staff Logsheet', component: DailyLogSheet },
    { id: 'summary-logsheet', label: 'Summary of Admin Logsheet', component: SummaryLogSheet },
    // Add more tabs here as needed
];

export default function Reports() {
    const [activeTab, setActiveTab] = useState(reportTabs[0].id);
    const [mobileTabStart, setMobileTabStart] = useState(0);

    const tabsPerPage = 3; // Show 3 tabs at a time on mobile
    const visibleTabs = reportTabs.slice(mobileTabStart, mobileTabStart + tabsPerPage);
    const canScrollLeft = mobileTabStart > 0;
    const canScrollRight = mobileTabStart + tabsPerPage < reportTabs.length;

    const handleScrollLeft = () => {
        if (canScrollLeft) {
            setMobileTabStart(prev => Math.max(0, prev - 1));
        }
    };

    const handleScrollRight = () => {
        if (canScrollRight) {
            setMobileTabStart(prev => Math.min(reportTabs.length - tabsPerPage, prev + 1));
        }
    };

    const ActiveComponent = reportTabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="w-full flex flex-col gap-6 p-4 sm:p-6">
            {/* Page Header */}
            <div className="text-center">
                <h2 className="pageheading text-lg sm:text-xl md:text-2xl">Reports</h2>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3">
                {/* Desktop View - All tabs visible */}
                <div className="hidden lg:flex flex-wrap gap-2">
                    {reportTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Mobile/Tablet View - Scrollable tabs with arrows */}
                <div className="lg:hidden">
                    <div className="flex items-center gap-2">
                        {/* Left Arrow */}
                        <button
                            onClick={handleScrollLeft}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${canScrollLeft
                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Visible Tabs */}
                        <div className="flex-1 flex gap-2 overflow-hidden">
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={handleScrollRight}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${canScrollRight
                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tab indicator for mobile */}
                    <div className="mt-2 text-center text-xs text-gray-500">
                        {reportTabs.findIndex(t => t.id === activeTab) + 1} of {reportTabs.length}
                    </div>
                </div>
            </div>

            {/* Active Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {ActiveComponent ? <ActiveComponent /> : <div className="p-6 text-center text-gray-500">Select a report</div>}
            </div>
        </div>
    );
}
