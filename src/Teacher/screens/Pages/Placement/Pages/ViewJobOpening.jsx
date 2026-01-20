import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ViewJobOpening() {
    const { id } = useParams();
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobOpening();
    }, [id]);

    const loadJobOpening = async () => {
        try {
            // API call to fetch job opening by id
            // Mock data for now
            const mockData = {
                placement_id: 452,
                organization: 'LQ',
                openingDate: '15/12/2025',
                jobRole: 'frontend',
                department: 'BCOM',
                class: 'Grade A',
                semester: 'S1',
                division: 'A',
                selectionCriteria: 'A',
                ctc: '12 LPA',
                positionOpenTill: '15/12/2025',
                expectedJoiningDate: '24/12/2025',
                registrationLink: 'https://example.com',
                jobDescription: 'JD - Full job description here...'
            };
            setJobData(mockData);
            setLoading(false);
        } catch (error) {
            console.error("Error loading job opening:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    if (!jobData) {
        return (
            <div className="p-6">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">Job opening not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">View Job Opening</h2>
                <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                    onClick={() => window.history.back()}
                >
                    ✕
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6">
                {/* Header Section */}
                <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-900">{jobData.organization}</h3>
                    <p className="text-lg text-gray-700 mt-1">{jobData.jobRole}</p>
                    <p className="text-sm text-gray-500 mt-1">Placement ID: {jobData.placement_id}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Opening Date</label>
                        <p className="text-gray-900">{jobData.openingDate}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Department</label>
                        <p className="text-gray-900">{jobData.department}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Class</label>
                        <p className="text-gray-900">{jobData.class}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Semester</label>
                        <p className="text-gray-900">{jobData.semester}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Division</label>
                        <p className="text-gray-900">{jobData.division}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Selection Criteria</label>
                        <p className="text-gray-900">{jobData.selectionCriteria}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">CTC (LPA)</label>
                        <p className="text-gray-900 font-semibold text-green-600">{jobData.ctc}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Position Open Till</label>
                        <p className="text-gray-900">{jobData.positionOpenTill}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Expected Joining Date</label>
                        <p className="text-gray-900">{jobData.expectedJoiningDate}</p>
                    </div>
                </div>

                {/* Registration Link */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Registration Link</label>
                    <a
                        href={jobData.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                        {jobData.registrationLink}
                    </a>
                </div>

                {/* Job Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Job Description</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{jobData.jobDescription}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="button"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                        onClick={() => window.history.back()}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
