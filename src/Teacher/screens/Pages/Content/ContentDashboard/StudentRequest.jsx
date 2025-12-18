import React, { useState, useEffect } from 'react';
import { contentService } from '../services/content.service.js';
import { Check, X, Eye } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';

const StudentRequest = ({ unitId, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});

    useEffect(() => {
        if (unitId) {
            fetchRequests();
        }
    }, [unitId]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await contentService.getStudentProjectsByUnit(unitId, 'PENDING');
            if (Array.isArray(response)) {
                setRequests(response);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (projectId) => {
        setProcessingId(projectId);
        try {
            await contentService.approveStudentProject(projectId);
            setAlertConfig({
                title: "Approved!",
                text: "Project approved successfully.",
                type: "success",
                onConfirm: () => {
                    setShowAlert(false);
                    fetchRequests();
                    if (onUpdate) onUpdate(); // Refresh main content list
                }
            });
            setShowAlert(true);
        } catch (error) {
            console.error("Error approving project:", error);
            setAlertConfig({
                title: "Error!",
                text: "Failed to approve project.",
                type: "error",
                onConfirm: () => setShowAlert(false)
            });
            setShowAlert(true);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (projectId) => {
        setProcessingId(projectId);
        // Could open a modal for remarks, for now simple rejection
        try {
            await contentService.rejectStudentProject(projectId);
            setAlertConfig({
                title: "Rejected!",
                text: "Project rejected.",
                type: "warning",
                onConfirm: () => {
                    setShowAlert(false);
                    fetchRequests();
                }
            });
            setShowAlert(true);
        } catch (error) {
            console.error("Error rejecting project:", error);
            setAlertConfig({
                title: "Error!",
                text: "Failed to reject project.",
                type: "error",
                onConfirm: () => setShowAlert(false)
            });
            setShowAlert(true);
        } finally {
            setProcessingId(null);
        }
    };

    if (!unitId) return null;

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return null; // Don't show anything if no requests
    }

    return (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Pending Student Projects
            </h3>

            <div className="space-y-4">
                {requests.map((req) => (
                    <div key={req.projectId} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800 text-lg">{req.projectTitle}</h4>
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Pending Review</span>
                            </div>

                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.projectDescription}</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Student:</span>
                                    <span>{req.studentName || `Student #${req.studentId}`}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Link:</span>
                                    <a href={req.projectLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                        View Project <Eye className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 border-gray-100">
                            <button
                                onClick={() => handleApprove(req.projectId)}
                                disabled={processingId === req.projectId}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button
                                onClick={() => handleReject(req.projectId)}
                                disabled={processingId === req.projectId}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAlert && (
                <SweetAlert
                    {...alertConfig}
                    onConfirm={alertConfig.onConfirm}
                />
            )}
        </div>
    );
};

export default StudentRequest;
