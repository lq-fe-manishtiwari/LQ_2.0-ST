import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { feedbackService } from "@/_services/feedbackService";
import { useUserProfile } from "@/contexts/UserProfileContext";
import Pagination from "@/components/Pagination";

export default function Pending() {
    const navigate = useNavigate();
    const { profile, isLoaded, getUserId, getUserType, getDepartmentId } = useUserProfile();
    const [pendingForms, setPendingForms] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isFirst, setIsFirst] = useState(true);
    const [isLast, setIsLast] = useState(true);
    const pageSize = 10;

    useEffect(() => {
        if (isLoaded) {
            loadPendingForms(currentPage);
        }
    }, [isLoaded, currentPage]);

    const loadPendingForms = async (page) => {
        setLoading(true);
        try {
            // Construct profile object for service with required IDs
            const userContext = {
                user: {
                    user_id: getUserId(),
                    user_type: getUserType()
                },
                departmentId: getDepartmentId()
            };

            const response = await feedbackService.getMyFeedbackForms(userContext, page, pageSize);

            // Handle paginated response
            if (response?.data?.content) {
                console.log(response.data.content);
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

                // Update pagination state
                setTotalPages(response.data.total_pages || 0);
                setTotalElements(response.data.total_elements || 0);
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
                    <div className="grid gap-4">
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
