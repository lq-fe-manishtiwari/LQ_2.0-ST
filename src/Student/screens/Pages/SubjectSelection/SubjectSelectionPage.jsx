import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SubjectSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { configData, configId, academicYearId, semesterId, studentId } = location.state || {};

    useEffect(() => {
        if (configData) {
            console.log('=== Subject Selection Page ===');
            console.log('Config ID:', configId);
            console.log('Config Data:', configData);
            console.log('Academic Year ID:', academicYearId);
            console.log('Semester ID:', semesterId);
            console.log('Student ID:', studentId);
            console.log('==============================');
        }
    }, [configData]);

    if (!configData) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-600">No configuration data available.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Subject Selection</h1>
            </div>

            {/* Config Data Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Details</h2>

                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[120px]">Config ID:</span>
                        <span className="text-gray-600">{configId}</span>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[120px]">Academic Year:</span>
                        <span className="text-gray-600">{academicYearId}</span>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[120px]">Semester:</span>
                        <span className="text-gray-600">{semesterId}</span>
                    </div>

                    <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[120px]">Student ID:</span>
                        <span className="text-gray-600">{studentId}</span>
                    </div>
                </div>

                {/* Display Full Config Data */}
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Full Configuration:</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(configData, null, 2)}
                    </pre>
                </div>

                {/* Note */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This is a placeholder page. The actual subject selection interface
                        will be implemented based on the config data structure. Check the browser console for
                        detailed logs of the configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}
