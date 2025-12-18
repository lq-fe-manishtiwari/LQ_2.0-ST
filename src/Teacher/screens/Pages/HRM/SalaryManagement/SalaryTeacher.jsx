import React, { useState } from 'react';
import { Search, Eye, Edit, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

export default function SalaryTeacher() {
    const [leaves, setLeaves] = useState([
        { id: 1, name: 'Vishal Pawar', role: 'Teacher', designation: 'Math Faculty', type: 'Ganpati Leave', appliedDate: 'Invalid date', days: 1, status: 'Approve' },
        { id: 2, name: 'Manish More', role: 'HOD', designation: 'Science HOD', type: 'Ganpati Leave', appliedDate: 'Invalid date', days: 7, status: 'Pending' },
        { id: 3, name: 'Manish More', role: 'Teacher', designation: 'Physics Faculty', type: 'Medical Leave', appliedDate: 'Invalid date', days: 1, status: 'Pending' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const navigate = useNavigate(); 

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLeaves = leaves.slice(startIndex, endIndex);
    const totalPages = Math.ceil(leaves.length / itemsPerPage);

    const handleViewLeave = (leaveId) => {
        // ✅ Navigate to view leave page
        navigate(`/hrm/salary/salary-teacher/view-status/${leaveId}`);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">

            {/* Top Bar: Filter & Search */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">

                {/* Filter */}
                <div className="w-full sm:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-48 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Approve">Approve</option>
                        <option value="Reject">Reject</option>
                    </select>
                </div>

                {/* Search */}
                <div className="w-full sm:w-auto relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="table-header">
                        <tr>
                            <th className="table-th text-center">Name</th>
                            <th className="table-th text-center">Role</th>
                            <th className="table-th text-center">Designation</th>
                            <th className="table-th text-center">Type</th>
                            <th className="table-th text-center">Applied Date</th>
                            <th className="table-th text-center">Day's</th>
                            <th className="table-th text-center">Status</th>
                            <th className="table-th text-center">Actions</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {currentLeaves.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            currentLeaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-white transition-colors group">
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{leave.name}</span>
                                        </div>
                                    </td>

                                    {/* Role */}
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                        {leave.role}
                                    </td>

                                    {/* Designation */}
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                        {leave.designation}
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                        {leave.type}
                                    </td>

                                    {/* Applied Date */}
                                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                                        {leave.appliedDate}
                                    </td>

                                    {/* Days */}
                                    <td className="px-6 py-4 text-center text-sm text-gray-700 font-medium">
                                        {leave.days}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-medium ${leave.status === 'Approve' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>

                                    {/* Actions - ✅ CORRECTED: onClick handler */}
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleViewLeave(leave.id)} // ✅ Correct syntax
                                            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                        >
                                            {leave.status === 'Approve' ? (
                                                <Eye className="w-4 h-4" />
                                            ) : (
                                                <Edit className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, leaves.length)} of {leaves.length} entries
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}