import React, { useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { contentService } from '../../services/AddContent.service.js';
import { useUserProfile } from "../../../../../../contexts/UserProfileContext.jsx";
import BulkContentRow from "./BulkContentRow.jsx";

// NOTE: useContentData is NOT imported here, as each row manages its own data fetching.

export default function BulkAddContent() {
    const { getUserId } = useUserProfile();
    const userId = getUserId();

    // Context fields are now part of each item
    const initialItemState = {
        id: Date.now(),
        // Context Fields
        selectedProgram: "", selectedAcademicSemester: "", selectedBatch: "", selectedSubject: "",
        selectedModule: "", selectedUnit: "",

        // Content Fields
        contentType: "",
        contentLevel: "",
        contentTitle: "",
        averageReadingTime: "",
        description: "",
        file: null,
        fileUrl: "",
        fileName: "",
        filePageCount: 0,
        externalLink: "",
        status: 'pending', // pending, uploading, done, error
        uploading: false
    };

    const [items, setItems] = useState([initialItemState]);
    const [loading, setLoading] = useState({ submitting: false });
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, message: "" });
    const [alert, setAlert] = useState(null);
    const [previewModal, setPreviewModal] = useState({ show: false, url: "", title: "" });

    // Add New Row
    const addNewRow = () => {
        setItems(prev => {
            const lastItem = prev[prev.length - 1];
            // ID must be unique
            const newId = Date.now() + Math.random();

            // Create new item inheriting context from the last one
            const newItem = {
                ...initialItemState, // Reset basic fields
                id: newId,
                // Inherit Context
                selectedProgram: lastItem.selectedProgram,
                selectedAcademicSemester: lastItem.selectedAcademicSemester,
                selectedBatch: lastItem.selectedBatch,
                selectedSubject: lastItem.selectedSubject,
                selectedModule: lastItem.selectedModule,
                selectedUnit: lastItem.selectedUnit,

                // Keep Reading Time and Level? User didn't specify, but often useful. 
                // Let's copy Level and Time too for convenience.
                contentLevel: lastItem.contentLevel,
                averageReadingTime: lastItem.averageReadingTime,
                contentType: lastItem.contentType, // Copy Type too? Probably useful.
            };

            return [...prev, newItem];
        });
    };

    // Remove Row
    const removeRow = (id) => {
        if (items.length === 1) {
            setAlert(<SweetAlert warning title="Cannot Remove" onConfirm={() => setAlert(null)}>You must have at least one item.</SweetAlert>);
            return;
        }
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Handle Item Update from Child
    const handleItemUpdate = (id, changes) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
    };

    const handlePreview = (url, title) => {
        setPreviewModal({ show: true, url, title });
    };

    // Submit All
    const handleSubmitAll = async () => {
        // Validation
        const validItems = items.filter(item =>
            item.selectedModule &&
            item.contentType &&
            item.contentTitle &&
            item.averageReadingTime
        );

        if (validItems.length !== items.length) {
            setAlert(
                <SweetAlert
                    danger
                    title="Validation Error"
                    onConfirm={() => setAlert(null)}
                >
                    <div className="text-left">
                        <p className="mb-2">Please fill in all required fields for all items:</p>
                        <ul className="list-disc pl-5 text-sm">
                            <li>Module *</li>
                            <li>Unit </li>
                            <li>Content Type *</li>
                            <li>Content Title *</li>
                            <li>Average Reading Time *</li>
                        </ul>
                    </div>
                </SweetAlert>
            );
            return;
        }

        for (const item of items) {
            if (item.status === 'uploading') {
                setAlert(<SweetAlert warning title="Wait" onConfirm={() => setAlert(null)}>Please wait for file uploads to finish.</SweetAlert>);
                return;
            }

            if (item.status === 'error') {
                setAlert(<SweetAlert danger title="Upload Error" onConfirm={() => setAlert(null)}>Please fix failed file uploads before submitting.</SweetAlert>);
                return;
            }
        }

        setLoading({ submitting: true });
        setUploadProgress({ current: 0, total: items.length, message: "Preparing upload..." });

        try {
            // Construct Payload with new structure
            const contents = items.map(item => {
                let contentLink = "";
                if (item.fileUrl) contentLink = item.fileUrl;
                else if (item.externalLink) contentLink = item.externalLink;

                return {
                    content_name: item.contentTitle,
                    content_description: item.description || "",
                    content_link: contentLink,
                    unit_id: item.selectedUnit ? parseInt(item.selectedUnit) : null,
                    module_id: parseInt(item.selectedModule),
                    content_type_id: parseInt(item.contentType),
                    content_level_id: item.contentLevel ? parseInt(item.contentLevel) : null,
                    average_reading_time_seconds: parseInt(item.averageReadingTime) * 60,
                    quiz_attachments: null,
                    admin: false,
                    user_id: userId
                };
            });

            const payload = { contents };

            console.log("Submitting bulk payload:", payload);
            setUploadProgress({ current: 0, total: items.length, message: "Uploading content to server..." });

            const response = await contentService.AddContentBulk(payload);
            console.log("Bulk upload response:", response);

            setUploadProgress({ current: items.length, total: items.length, message: "Processing response..." });

            // Handle different response statuses
            if (response.status === 'success') {
                // All items succeeded
                setAlert(
                    <SweetAlert
                        success
                        title="✅ Upload Successful!"
                        onConfirm={() => {
                            setAlert(null);
                            window.history.back();
                        }}
                    >
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <p className="text-lg font-semibold mb-2">All content uploaded successfully!</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                <p className="text-green-700 font-medium">
                                    ✅ {response.success_count} of {response.total_requested} items saved
                                </p>
                            </div>
                        </div>
                    </SweetAlert>
                );
            } else if (response.status === 'partial') {
                // Some items succeeded, some failed
                setAlert(
                    <SweetAlert
                        warning
                        title="⚠️ Partial Success"
                        onConfirm={() => setAlert(null)}
                        confirmBtnText="OK"
                        confirmBtnBsStyle="warning"
                    >
                        <div className="text-left">
                            <div className="mb-4">
                                <div className="flex justify-around mb-4">
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">✅</div>
                                        <p className="text-green-600 font-semibold">{response.success_count} Saved</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl mb-1">❌</div>
                                        <p className="text-red-600 font-semibold">{response.failure_count} Failed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <p className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                                    <span className="text-xl">⚠️</span>
                                    Failed Items Details:
                                </p>
                                {response.failed_entries.map((entry, idx) => (
                                    <div key={idx} className="mb-3 pb-3 border-b border-red-200 last:border-0">
                                        <p className="text-sm font-semibold text-red-800 mb-1">
                                            Item #{entry.index + 1}
                                        </p>
                                        <p className="text-sm text-red-600 mb-1">
                                            <span className="font-medium">Error:</span> {entry.error_message}
                                        </p>
                                        {entry.request_data?.content_name && (
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Title:</span> {entry.request_data.content_name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-3 text-center">
                                💡 Please fix the errors and try uploading the failed items again.
                            </p>
                        </div>
                    </SweetAlert>
                );
            } else if (response.status === 'failed') {
                // All items failed
                setAlert(
                    <SweetAlert
                        danger
                        title="❌ Upload Failed"
                        onConfirm={() => setAlert(null)}
                    >
                        <div className="text-left">
                            <div className="text-center mb-4">
                                <p className="text-lg font-semibold text-red-600">
                                    All {response.failureCount} items failed to upload
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <p className="font-semibold text-red-700 mb-3">Error Details:</p>
                                {response.failed_entries.map((entry, idx) => (
                                    <div key={idx} className="mb-3 pb-3 border-b border-red-200 last:border-0">
                                        <p className="text-sm font-semibold text-red-800 mb-1">
                                            Item #{entry.index + 1}
                                        </p>
                                        <p className="text-sm text-red-600 mb-1">
                                            <span className="font-medium">Error:</span> {entry.error_message}
                                        </p>
                                        {entry.request_data?.content_name && (
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Title:</span> {entry.request_data.content_name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-3 text-center">
                                💡 Please check the errors above and try again.
                            </p>
                        </div>
                    </SweetAlert>
                );
            } else {
                // Unexpected response format
                setAlert(
                    <SweetAlert
                        warning
                        title="Unexpected Response"
                        onConfirm={() => setAlert(null)}
                    >
                        The server returned an unexpected response. Please check if your content was saved.
                    </SweetAlert>
                );
            }
        } catch (error) {
            console.error("Error adding bulk content:", error);

            // Detailed error handling
            let errorMessage = "Failed to submit bulk content.";
            let errorDetails = "";

            // Check if error response has the API error structure
            if (error) {
                const apiError = error;

                // If API returned failed_entries with error messages
                if (apiError.failed_entries && apiError.failed_entries.length > 0) {
                    const firstError = apiError.failed_entries[0];
                    errorMessage = firstError.error_message || "Failed to submit content.";

                    // Show all error messages if multiple
                    if (apiError.failed_entries.length > 1) {
                        errorDetails = apiError.failed_entries
                            .map((entry, idx) => `Item ${entry.index + 1}: ${entry.error_message}`)
                            .join('\n');
                    }
                } else if (apiError.message) {
                    errorMessage = apiError.message;
                } else if (apiError.error) {
                    errorMessage = apiError.error;
                }
            } else if (error.message) {
                errorDetails = error.message;
            }

            if (error.response) {
                // Server responded with error
                if (!errorDetails && error.response.statusText) {
                    errorDetails = error.response.statusText;
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = "Network error: Unable to reach the server.";
                errorDetails = "Please check your internet connection and try again.";
            }

            setAlert(
                <SweetAlert
                    danger
                    title="❌ Upload Error"
                    onConfirm={() => setAlert(null)}
                >
                    <div className="text-left">
                        <p className="mb-2 font-semibold text-red-700">{errorMessage}</p>
                        {errorDetails && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                                <p className="text-sm text-red-600 whitespace-pre-line">
                                    <span className="font-medium">Details:</span><br />
                                    {errorDetails}
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-gray-600 mt-3">
                            💡 Please fix the error and try again.
                        </p>
                    </div>
                </SweetAlert>
            );
        } finally {
            setLoading({ submitting: false });
            setUploadProgress({ current: 0, total: 0, message: "" });
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Bulk Add Content</h2>
                <div className="flex gap-2">
                    {/* Add Row Button at Top as well? Maybe not needed if at bottom. */}
                    <button type="button" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition" onClick={() => window.history.back()}>✕</button>
                </div>
            </div>

            {/* Content Items List */}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <BulkContentRow
                        key={item.id}
                        item={item}
                        onUpdate={handleItemUpdate}
                        onRemove={removeRow}
                        onPreview={handlePreview}
                    />
                ))}
            </div>

            {/* Add Row Button */}
            <div className="mt-4 flex justify-center">
                <button
                    type="button"
                    onClick={addNewRow}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                >
                    <span className="text-xl">+</span> Add Another Content
                </button>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleSubmitAll}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
                    disabled={loading.submitting}
                >
                    {loading.submitting ? 'Submitting...' : `Submit All (${items.length})`}
                </button>
                <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium" onClick={() => window.history.back()}>
                    Cancel
                </button>
            </div>

            {alert}

            {/* Loading Modal with Animation */}
            {loading.submitting && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <div className="text-center">
                            {/* Animated Spinner */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                                </div>
                            </div>

                            {/* Progress Message */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Uploading Content...
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {uploadProgress.message || "Please wait while we save your content"}
                            </p>

                            {/* Progress Bar */}
                            {uploadProgress.total > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{uploadProgress.current} / {uploadProgress.total}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Animated Dots */}
                            <div className="flex justify-center gap-2 mt-6">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                ⏳ This may take a few moments
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Preview - {previewModal.title}</h3>
                            <button
                                onClick={() => setPreviewModal({ show: false, url: "", title: "" })}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                            <iframe
                                src={previewModal.url}
                                className="w-full h-96 border rounded"
                                title="File Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
