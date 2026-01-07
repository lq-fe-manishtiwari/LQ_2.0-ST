import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

                // Update pagination state
                setTotalPages(response.data.total_pages || 0);
                setTotalElements(response.data.total_elements || 0);
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
                <div className="text-center py-12">
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
                    <div className="grid gap-4">
                        {submittedForms.map((form) => (
                            <div
                                key={form.feedback_form_id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900">{form.form_name}</h4>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Submitted
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Code: {form.code || 'N/A'}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-xs text-gray-400">
                                                <i className="bi bi-check-circle mr-1"></i>
                                                Submitted on: {form.submitted_at ? new Date(form.submitted_at).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewSubmission(form.response_id)}
                                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
                                    >
                                        <i className="bi bi-eye"></i>
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={handlePageChange}
                        isFirst={isFirst}
                        isLast={isLast}
                    />
                </>
            )}
        </div>
    );
}
