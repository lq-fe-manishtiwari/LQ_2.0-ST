import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { feedbackService } from "@/_services/feedbackService";
import { StudentService } from "../../Profile/Student.Service";
import Pagination from "@/components/Pagination";

export default function Pending() {
    const navigate = useNavigate();
    const [pendingForms, setPendingForms] = useState([]);
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
            loadPendingForms(currentPage);
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

    const loadPendingForms = async (page) => {
        setLoading(true);
        try {
            const response = await feedbackService.getMyFeedbackForms(userProfile, page, pageSize);

            // Handle paginated response
            if (response?.data?.content) {
                // Filter only pending forms (not submitted) and add status calculation
                const pending = response.data.content.filter(f => !f.has_submitted).map(form => {
                    // Calculate status based on dates
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
                    const startDate = new Date(form.start_date);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(form.end_date);
                    endDate.setHours(23, 59, 59, 999); // End of day

                    let status = 'Inactive';
                    let canFill = false;
                    
                    // Check date-based status
                    if (today < startDate) {
                        status = 'Scheduled';
                        canFill = false;
                    } else if (today >= startDate && today <= endDate) {
                        status = 'Active';
                        canFill = true;
                    } else if (today > endDate) {
                        status = 'Expired';
                        canFill = false;
                    }

                    return {
                        ...form,
                        status,
                        canFill
                    };
                });
                setPendingForms(pending);

                // Update pagination state with pending count
                const pendingCount = pending.length;
                setTotalPages(Math.ceil(pendingCount / pageSize));
                setTotalElements(pendingCount);
                setCurrentPage(response.data.number || 0);
                setIsFirst(response.data.first !== undefined ? response.data.first : true);
                setIsLast(response.data.last !== undefined ? response.data.last : true);
            } else {
                setPendingForms([]);
            }
        } catch (error) {
            console.error('Error loading pending forms:', error);
            setPendingForms([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleFillForm = (formId) => {
        navigate(`../fill/${formId}`);
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
                <h3 className="text-lg font-semibold text-gray-800">Pending Feedback Forms</h3>
                <span className="text-sm text-gray-500">{totalElements} form(s)</span>
            </div>

            {pendingForms.length === 0 ? (
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No pending feedback forms</p>
                    <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">End Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pendingForms.map((form) => (
                                        <tr key={form.feedback_form_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{form.form_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{form.code || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{form.start_date || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{form.end_date || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    form.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    form.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    form.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {form.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleFillForm(form.feedback_form_id)}
                                                    disabled={!form.canFill}
                                                    className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 mx-auto ${
                                                        form.canFill 
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                    title={!form.canFill ? 
                                                        form.status === 'Scheduled' ? 'Form not yet available' :
                                                        form.status === 'Expired' ? 'Form has expired' :
                                                        'Form not available' : 'Fill form'
                                                    }
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                    {form.status === 'Scheduled' ? 'Not Available' :
                                                     form.status === 'Expired' ? 'Expired' :
                                                     'Fill Form'}
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
                        {pendingForms.map((form) => (
                            <div
                                key={form.feedback_form_id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{form.form_name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">Code: {form.code || 'N/A'}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-xs text-gray-400">
                                                <i className="bi bi-calendar-event mr-1"></i>
                                                Start: {form.start_date || 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                <i className="bi bi-calendar-x mr-1"></i>
                                                End: {form.end_date || 'N/A'}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                form.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                form.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                form.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {form.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFillForm(form.feedback_form_id)}
                                        disabled={!form.canFill}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-2 ${
                                            form.canFill 
                                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                        title={!form.canFill ? 
                                            form.status === 'Scheduled' ? 'Form not yet available' :
                                            form.status === 'Expired' ? 'Form has expired' :
                                            'Form not available' : 'Fill form'
                                        }
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                        {form.status === 'Scheduled' ? 'Not Available' :
                                         form.status === 'Expired' ? 'Expired' :
                                         'Fill Form'}
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
