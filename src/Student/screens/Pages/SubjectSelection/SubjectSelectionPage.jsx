import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Clock, CheckCircle2, AlertCircle, BookOpen, Loader2, FileText } from 'lucide-react';
import { saveStudentSubjectSelection } from './Service/subjectSelection.service';
import { useUserProfile } from '@/contexts/UserProfileContext';
import SweetAlert from 'react-bootstrap-sweetalert';

export default function SubjectSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { configData, configId, academicYearId, semesterId, studentId } = location.state || {};

    // Get student ID from profile context
    const { profile } = useUserProfile();
    const currentStudentId = profile?.student_id || studentId;

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    useEffect(() => {
        if (configData) {
            console.log('=== Subject Selection Page ===');
            console.log('Config Data:', configData);
            console.log('==============================');

            // Calculate time remaining
            if (configData.end_time) {
                const updateTimer = () => {
                    const endTime = new Date(configData.end_time);
                    const now = new Date();
                    const diff = endTime - now;

                    if (diff > 0) {
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        setTimeRemaining(`${hours}h ${minutes}m remaining`);
                    } else {
                        setTimeRemaining('Selection time expired');
                    }
                };

                updateTimer();
                const interval = setInterval(updateTimer, 60000); // Update every minute
                return () => clearInterval(interval);
            }
        }
    }, [configData]);

    const handleSubjectToggle = (subjectId) => {
        // Prevent changes during submission or after successful submission
        if (isSubmitting || submitSuccess) {
            return;
        }

        // Clear any previous error when user makes changes
        if (submitError) {
            setSubmitError('');
        }

        setSelectedSubjects(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                // Check max selections
                if (prev.length < configData.maximum_selections) {
                    return [...prev, subjectId];
                }
                return prev;
            }
        });
    };

    const handleSubmitConfirm = async () => {
        setShowSubmitConfirm(false);
        await handleSubmit();
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setSubmitError('');

        // Validation
        if (selectedSubjects.length < configData.minimum_selections) {
            setSubmitError(`Please select at least ${configData.minimum_selections} papers`);
            return;
        }

        if (selectedSubjects.length > configData.maximum_selections) {
            setSubmitError(`Please select no more than ${configData.maximum_selections} papers`);
            return;
        }

        if (!currentStudentId) {
            setSubmitError('Student ID not found. Please refresh the page and try again.');
            return;
        }

        if (!configId) {
            setSubmitError('Configuration ID not found. Please go back and try again.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare the request payload according to the API specification
            const selectionRequest = {
                subject_selection_config_id: configId,
                subject_ids: selectedSubjects // This is already a Set/Array of Long values
            };

            console.log('Submitting subject selection:', {
                currentStudentId,
                selectionRequest
            });

            const response = await saveStudentSubjectSelection(currentStudentId, selectionRequest);

            if (response.success) {
                setSubmitSuccess(true);
                console.log('Paper selection saved successfully:', response.data);

                // Show success message and redirect after a delay
                setTimeout(() => {
                    navigate(-1, {
                        state: {
                            message: 'Paper selection submitted successfully!',
                            type: 'success'
                        }
                    });
                }, 2000);
            } else {
                setSubmitError(response.message || 'Failed to save subject selection. Please try again.');
                setShowErrorAlert(true);
            }
        } catch (error) {
            console.error('Error submitting subject selection:', error);
            setSubmitError('An unexpected error occurred. Please try again.');
            setShowErrorAlert(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!configData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <p className="text-gray-600 mb-4">No configuration data available.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canSubmit = selectedSubjects.length >= configData.minimum_selections &&
        selectedSubjects.length <= configData.maximum_selections &&
        !isSubmitting &&
        !submitSuccess;

    return (
        <div className="min-h-screen bg-white p-4 sm:p-6">
            <div className="max-w-6xl mx-auto p-6 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Paper Selection</h1>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className="mb-6">
                    <p className="text-gray-600">
                        {configData.academic_year_name} - {configData.semester_name} - {configData.subject_type_name}
                        {configData.vertical_type_name && ` - ${configData.vertical_type_name}`}
                    </p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Selection Requirements */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Requirements</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Minimum: <span className="font-semibold text-gray-900">{configData.minimum_selections}</span> papers
                            </p>
                            <p className="text-gray-600">
                                Maximum: <span className="font-semibold text-gray-900">{configData.maximum_selections}</span> papers
                            </p>
                            <p className="text-gray-600">
                                Selected: <span className={`font-semibold ${selectedSubjects.length >= configData.minimum_selections ? 'text-green-600' : 'text-orange-600'
                                    }`}>{selectedSubjects.length}</span> / {configData.maximum_selections}
                            </p>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Timeline</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Starts: <span className="font-semibold text-gray-900">
                                    {new Date(configData.start_time).toLocaleString()}
                                </span>
                            </p>
                            <p className="text-gray-600">
                                Ends: <span className="font-semibold text-gray-900">
                                    {new Date(configData.end_time).toLocaleString()}
                                </span>
                            </p>
                            <p className={`font-semibold ${timeRemaining.includes('expired') ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                {timeRemaining}
                            </p>
                        </div>
                    </div>


                </div>

                {/* Subject Sets */}
                <div className="space-y-4">
                    {configData.subject_sets?.map((set, setIndex) => (
                        <div key={setIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Set Header */}
                            <div className="bg-blue-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {set.subject_set_name}
                                    <span className="text-sm font-normal opacity-90">
                                        ({set.subjects?.length || 0} papers)
                                    </span>
                                </h2>
                            </div>

                            {/* Subjects Grid */}
                            <div className="p-6">
                                {set.subjects && set.subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {set.subjects.map((subject) => {
                                            const isSelected = selectedSubjects.includes(subject.subject_id);

                                            return (
                                                <button
                                                    key={subject.subject_id}
                                                    onClick={() => handleSubjectToggle(subject.subject_id)}
                                                    disabled={isSubmitting || submitSuccess}
                                                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSubmitting || submitSuccess
                                                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                                            : isSelected
                                                                ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02] hover:border-blue-600'
                                                                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Selection Indicator */}
                                                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'bg-white border-gray-300'
                                                        }`}>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Subject Info */}
                                                    <div className="pr-8">
                                                        <h3 className={`font-semibold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                                            }`}>
                                                            {subject.subject_name}
                                                        </h3>
                                                        {subject.paper_code && (
                                                            <p className="text-xs text-gray-500">
                                                                Paper: {subject.paper_code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No papers available in this set</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 font-medium">{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {submitSuccess && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-800 font-medium">
                                Paper selection submitted successfully! Redirecting...
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="sticky bottom-6 mt-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                {submitSuccess ? (
                                    <span className="text-green-600 font-medium">
                                        ✓ Selection submitted successfully!
                                    </span>
                                ) : selectedSubjects.length < configData.minimum_selections ? (
                                    <span className="text-orange-600 font-medium">
                                        ⚠️ Please select at least {configData.minimum_selections - selectedSubjects.length} more paper(s)
                                    </span>
                                ) : (
                                    <span className="text-green-600 font-medium">
                                        ✓ You have selected {selectedSubjects.length} paper(s)
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    disabled={isSubmitting || submitSuccess || selectedSubjects.length === 0}
                                    className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors ${isSubmitting || submitSuccess || selectedSubjects.length === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setShowSubmitConfirm(true)}
                                    disabled={!canSubmit}
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${canSubmit && !isSubmitting && !submitSuccess
                                            ? 'bg-blue-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {submitSuccess ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Submitted
                                        </>
                                    ) : isSubmitting ? (
                                        'Submitting...'
                                    ) : (
                                        'Submit Selection'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clear Confirmation Alert */}
                {showClearConfirm && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, Clear All"
                        cancelBtnText="Cancel"
                        confirmBtnCssClass="btn-confirm"
                        cancelBtnCssClass="btn-cancel"
                        title="Clear All Selections?"
                        onConfirm={() => {
                            setSelectedSubjects([]);
                            setSubmitError('');
                            setShowClearConfirm(false);
                        }}
                        onCancel={() => setShowClearConfirm(false)}
                    >
                        Are you sure you want to clear all selected papers?
                    </SweetAlert>
                )}

                {/* Submit Confirmation Alert */}
                {showSubmitConfirm && (
                    <SweetAlert
                        warning
                        showCancel
                        confirmBtnText="Yes, Submit"
                        cancelBtnText="Cancel"
                        confirmBtnCssClass="btn-confirm"
                        cancelBtnCssClass="btn-cancel"
                        title="Submit Paper Selection?"
                        onConfirm={handleSubmitConfirm}
                        onCancel={() => setShowSubmitConfirm(false)}
                    >
                        You have selected {selectedSubjects.length} paper(s). Are you sure you want to submit?
                    </SweetAlert>
                )}

                {/* Error Alert */}
                {showErrorAlert && (
                    <SweetAlert
                        error
                        title="Error!"
                        confirmBtnText="OK"
                        confirmBtnCssClass="btn-confirm"
                        onConfirm={() => {
                            setShowErrorAlert(false);
                            setSubmitError('');
                        }}
                    >
                        {submitError}
                    </SweetAlert>
                )}
            </div>
        </div>
    );
}
