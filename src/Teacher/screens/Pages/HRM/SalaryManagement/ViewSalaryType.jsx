import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ViewSalaryType() {
    const navigate = useNavigate();
    const location = useLocation();
    // Mock data if no state is passed
    const leave = location.state?.leave || {
        type: 'Medical Leave',
        description: 'For medical emergencies',
        daysAllowed: 10,
        user: 'Teacher',
        isActive: true,
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">View Leave Details</h2>
            </div>

            {/* Details Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">

                    <div>
                        <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">Type Name</h4>
                        <p className="text-gray-800 font-medium text-base">{leave.type}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">Description</h4>
                        <p className="text-gray-800 font-medium text-base">{leave.description}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">No. Of Days Allowed</h4>
                        <p className="text-gray-800 font-medium text-base">{leave.daysAllowed}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">Active Status</h4>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${leave.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {leave.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">User Type</h4>
                        <p className="text-gray-800 font-medium text-base">{leave.user}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
