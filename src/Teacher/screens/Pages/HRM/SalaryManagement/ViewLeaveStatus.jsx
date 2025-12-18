import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ViewLeaveStatus() {
    const navigate = useNavigate();

    const handleBack = () => {
        // Navigate to /hrm/salary/salary-teacher
        navigate('/hrm/salary/salary-teacher');
    };

    const handleClose = () => {
        // Also navigate to /hrm/salary/salary-teacher when close is clicked
        navigate('/hrm/salary/salary-teacher');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Leave Application Details Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                            Leave Application Details
                        </h2>

                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-5">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium">
                                    Ganpati Leave
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        From Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                                        Select Date
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        To Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                                        Select Date
                                    </div>
                                </div>
                            </div>

                            {/* Number of Days */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Number of days <span className="text-red-500">*</span>
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium">
                                    1
                                </div>
                            </div>

                            {/* Remark */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Remark <span className="text-red-500">*</span>
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                                    6767
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-5">
                            {/* Attachment */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Attachment
                                </label>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center cursor-pointer hover:bg-blue-100 transition-colors">
                                    <span className="text-blue-600 font-bold text-lg mr-3">@</span>
                                    <span className="text-blue-700 font-medium">Attachment file</span>
                                    <span className="ml-auto text-blue-500 text-sm">View</span>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <div className="p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 font-semibold flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                    Approved
                                </div>
                            </div>

                            {/* Approval Remark */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Approval Remark
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                                    gfngj
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex space-x-4">
                                <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                    Edit Application
                                </button>
                                <button className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
                                    Cancel Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave Summary Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Leave Summary</h2>
                        <p className="text-gray-600 text-sm mt-1">Overview of your available leave balance</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Leave Type
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Approved
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Balance
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Main Row - Ganpati Leave */}
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <span className="text-orange-600 font-bold">G</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">Ganpati Leave</div>
                                                <div className="text-xs text-gray-500">Festival Leave</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">6</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-medium text-blue-600">1</div>
                                        <div className="text-xs text-gray-500">Used</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-green-600">5</div>
                                        <div className="text-xs text-gray-500">Available</div>
                                    </td>

                                </tr>

                                {/* Additional Sample Rows */}
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-green-600 font-bold">C</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">Casual Leave</div>
                                                <div className="text-xs text-gray-500">Personal Leave</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">12</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-medium text-blue-600">3</div>
                                        <div className="text-xs text-gray-500">Used</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-green-600">9</div>
                                        <div className="text-xs text-gray-500">Available</div>
                                    </td>

                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <span className="text-red-600 font-bold">S</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">Sick Leave</div>
                                                <div className="text-xs text-gray-500">Medical Leave</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">10</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-medium text-blue-600">2</div>
                                        <div className="text-xs text-gray-500">Used</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-green-600">8</div>
                                        <div className="text-xs text-gray-500">Available</div>
                                    </td>

                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <span className="text-purple-600 font-bold">E</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900">Earned Leave</div>
                                                <div className="text-xs text-gray-500">Accumulated Leave</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-gray-900">15</div>
                                        <div className="text-xs text-gray-500">Days</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-medium text-blue-600">5</div>
                                        <div className="text-xs text-gray-500">Used</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-green-600">10</div>
                                        <div className="text-xs text-gray-500">Available</div>
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                                Showing <span className="font-semibold">4</span> leave types
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    Previous
                                </button>
                                <span className="px-3 py-2 text-sm font-medium text-gray-700">1</span>
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}