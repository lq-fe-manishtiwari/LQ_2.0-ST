import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AllocateSalaryModal from './Components/AllocateSalaryModal';

export default function SalaryType() {
    const navigate = useNavigate();

    // Mock Data
    const [leaves, setLeaves] = useState([
        { id: 1, type: 'Medical Leave', description: 'For medical emergencies', daysAllowed: 10, user: 'Teacher', isActive: true },
        { id: 2, type: 'Casual Leave', description: 'For personal matters', daysAllowed: 12, user: 'Student', isActive: true },
        { id: 3, type: 'Sick Leave', description: 'For health issues', daysAllowed: 5, user: 'Other Staff', isActive: false },
    ]);

    // Modal State
    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Handle Delete
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this type?')) {
            setLeaves(leaves.filter(leave => leave.id !== id));
        }
    };

    // Handle Status Toggle
    const handleToggleStatus = (id) => {
        setLeaves(leaves.map(leave =>
            leave.id === id ? { ...leave, isActive: !leave.isActive } : leave
        ));
    };

    // Actions
    const handleView = (leave) => {
        navigate(`view/${leave.id}`, { state: { leave } });
    };

    const handleEdit = (leave) => {
        navigate(`edit/${leave.id}`, { state: { leave } });
    };

    const handleAllocate = (leave) => {
        setSelectedLeave(leave);
        setShowAllocateModal(true);
    };

    return (
        <div className="h-full">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Salary Types</h3>
                <button
                    onClick={() => navigate('add')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Type
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th text-center" style={{ width: '15%' }}>Type</th>
                                <th className="table-th text-center" style={{ width: '25%' }}>Description</th>
                                <th className="table-th text-center" style={{ width: '15%' }}>Days Allowed</th>
                                <th className="table-th text-center" style={{ width: '15%' }}>User</th>
                                <th className="table-th text-center" style={{ width: '15%' }}>Status</th>
                                <th className="table-th text-center" style={{ width: '15%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <p className="text-lg font-medium mb-2">No types found</p>
                                        <p className="text-sm">Click "Add Type" to create one.</p>
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-900 text-center font-medium">{leave.type}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600 text-center truncate" title={leave.description}>{leave.description}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700 text-center">{leave.daysAllowed}</td>
                                        <td className="px-4 py-4 text-sm text-gray-700 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {leave.user}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(leave.id)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${leave.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                            >
                                                {leave.isActive ? (
                                                    <><ToggleRight className="w-4 h-4" /> Active</>
                                                ) : (
                                                    <><ToggleLeft className="w-4 h-4" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleView(leave)}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(leave)}
                                                    className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAllocate(leave)}
                                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                    title="Allocate"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="lg:hidden space-y-4">
                {leaves.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                        <p className="text-gray-500">No types found.</p>
                    </div>
                ) : (
                    leaves.map((leave) => (
                        <div key={leave.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-900">{leave.type}</h4>
                                <button
                                    onClick={() => handleToggleStatus(leave.id)}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${leave.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {leave.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p><span className="font-medium text-gray-800">User:</span> {leave.user}</p>
                                <p><span className="font-medium text-gray-800">Days Allowed:</span> {leave.daysAllowed}</p>
                                <p className="truncate"><span className="font-medium text-gray-800">Description:</span> {leave.description}</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => handleView(leave)}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleEdit(leave)}
                                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleAllocate(leave)}
                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Allocate Modal */}
            {showAllocateModal && (
                <AllocateSalaryModal
                    leave={selectedLeave}
                    onClose={() => setShowAllocateModal(false)}
                />
            )}
        </div>
    );
}
