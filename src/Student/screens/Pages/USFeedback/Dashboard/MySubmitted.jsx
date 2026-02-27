import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from 'lucide-react';
import { feedbackService } from "@/_services/feedbackService";
import { StudentService } from "../../Profile/Student.Service";
import Pagination from "@/components/Pagination";

export default function MySubmitted() {
    const navigate = useNavigate();
    const [submittedForms, setSubmittedForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isFirst, setIsFirst] = useState(true);
    const [isLast, setIsLast] = useState(true);
    const pageSize = 10;

    useEffect(() => {
        loadUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile) {
            loadSubmittedForms(currentPage);
        }
    }, [userProfile, currentPage]);

    const loadUserProfile = async () => {
        const storedProfile = localStorage.getItem('userProfile');
        const contentFilters = localStorage.getItem('studentContentDashboardFilters');

        if (storedProfile) {
            let profile = JSON.parse(storedProfile);
            const studentId = profile?.student_id;

            if (studentId) {
                try {
                    const history = await StudentService.getStudentHistory(studentId);
                    if (history && history.length > 0) {
                        const activeHistory = history[0]; // Assuming the first one is active as per API path
                        profile = {
                            ...profile,
                            academicYearId: activeHistory.academic_year_id,
                            semesterId: activeHistory.semester_id,
                            programId: activeHistory.academic_year?.program?.program_id,
                            batchId: activeHistory.academic_year?.batch?.batch_id,
                            divisionId: activeHistory.division_id
                        };
                    }
                } catch (error) {
                    console.error('Error fetching student history:', error);
                }
            }

            // Merge filters from content dashboard if they exist (override history if needed)
            if (contentFilters) {
                const filters = JSON.parse(contentFilters);
                profile = {
                    ...profile,
                    programId: filters.program || profile.programId,
                    batchId: filters.batch || profile.batchId,
                    semesterId: filters.semester || profile.semesterId,
                    academicYearId: filters.academicYear || profile.academicYearId
                };
            }

            setUserProfile(profile);
        } else {
            console.error('User profile not found');
        }
    };

    const loadSubmittedForms = async (page) => {
        setLoading(true);
        try {
            const response = await feedbackService.getMyFeedbackForms(userProfile, page, pageSize);

            // Handle paginated response
            if (response?.data?.content) {
                // Filter only submitted forms
                const submitted = response.data.content.filter(f => f.has_submitted);
                setSubmittedForms(submitted);

                // Update pagination state with submitted count
                const submittedCount = submitted.length;
                setTotalPages(Math.ceil(submittedCount / pageSize));
                setTotalElements(submittedCount);
                setCurrentPage(response.data.number || 0);
                setIsFirst(response.data.first !== undefined ? response.data.first : true);
                setIsLast(response.data.last !== undefined ? response.data.last : true);
            } else {
                setSubmittedForms([]);
            }
        } catch (error) {
            console.error('Error loading submitted forms:', error);
            setSubmittedForms([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleViewSubmission = (responseId) => {
        navigate(`../view/${responseId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">My Submitted Feedback</h3>
                <span className="text-sm text-gray-500">{totalElements} submission(s)</span>
            </div>

            {submittedForms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                    <div className="text-gray-400 mb-2">
                        <svg
                            className="mx-auto h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No submitted feedback yet</p>
                    <p className="text-gray-400 text-xs mt-1">Complete pending forms to see them here</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Form Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Submitted On</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submittedForms.map((form) => (
                                        <tr key={form.feedback_form_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-left text-gray-500">{form.form_name}</td>
                                            <td className="px-6 py-4 text-sm text-left text-gray-500">{form.code || 'N/A'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Submitted
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-left text-gray-500">
                                                {form.submitted_at ? new Date(form.submitted_at).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewSubmission(form.response_id)}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalElements > 0 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={isFirst}
                                    className={`px-4 py-2 rounded-md ${
                                        isFirst
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700 font-medium">
                                    Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} entries
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={isLast}
                                    className={`px-4 py-2 rounded-md ${
                                        isLast
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                        {submittedForms.map((form) => (
                            <div
                                key={form.feedback_form_id}
                                className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{form.form_name}</p>
                                        <p className="text-sm text-gray-500">Code: {form.code || 'N/A'}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                        Submitted
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-700 mb-4">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <span className="font-medium">Submitted on:</span>{' '}
                                            {form.submitted_at ? new Date(form.submitted_at).toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center">
                                    <button
                                        onClick={() => handleViewSubmission(form.response_id)}
                                        className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Pagination */}
                    {totalElements > 0 && (
                        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={isFirst}
                                className={`px-4 py-2 rounded-md ${
                                    isFirst
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                Previous
                            </button>
                            <span className="text-gray-700 font-medium text-xs">
                                {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={isLast}
                                className={`px-4 py-2 rounded-md ${
                                    isLast
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
