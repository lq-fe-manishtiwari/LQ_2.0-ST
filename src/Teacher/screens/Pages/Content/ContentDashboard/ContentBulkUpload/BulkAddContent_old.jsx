import React, { useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { contentService } from "../../Services/AddContent.service.js";
import { useUserProfile } from "../../../../../contexts/UserProfileContext.jsx";
import BulkContentRow from "./BulkContentRow.jsx";

// NOTE: useContentData is NOT imported here, as each row manages its own data fetching.

export default function BulkAddContent() {
    const { userID } = useUserProfile();

    // Context fields are now part of each item
    const initialItemState = {
        id: Date.now(),
        // Context Fields
        selectedProgram: "", selectedClass: "", selectedSemester: "", selectedSubject: "",
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
                selectedClass: lastItem.selectedClass,
                selectedSemester: lastItem.selectedSemester,
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
            item.selectedUnit &&
            item.selectedModule &&
            item.contentType &&
            item.contentTitle &&
            item.averageReadingTime
        );

        if (validItems.length !== items.length) {
            setAlert(<SweetAlert danger title="Validation Error" onConfirm={() => setAlert(null)}>Please fill in all required fields (Module, Unit, Type, Title, Time) for all items.</SweetAlert>);
            return;
        }

        for (const item of items) {
            if (item.status === 'uploading') {
                setAlert(<SweetAlert warning title="Wait" onConfirm={() => setAlert(null)}>Please wait for uploads to finish.</SweetAlert>);
                return;
            }

            if (item.status === 'error') {
                setAlert(<SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>Please fix failed uploads.</SweetAlert>);
                return;
            }
        }

        setLoading({ submitting: true });

        // Construct Payload with new structure
        const contents = items.map(item => {
            let contentLink = "";
            if (item.fileUrl) contentLink = item.fileUrl;
            else if (item.externalLink) contentLink = item.externalLink;

            return {
                contentName: item.contentTitle,
                contentDescription: item.description || "",
                contentLink: contentLink,
                unitId: parseInt(item.selectedUnit),
                moduleId: parseInt(item.selectedModule),
                contentTypeId: parseInt(item.contentType),
                contentLevelId: item.contentLevel ? parseInt(item.contentLevel) : null,
                averageReadingTimeSeconds: parseInt(item.averageReadingTime) * 60, // Convert minutes to seconds
                userId: userID,
                admin: true,
                quizAttachments: null
            };
        });

        const payload = { contents };

        try {
            console.log("Submitting bulk payload:", payload);
            const response = await contentService.AddContentBulk(payload);
            console.log("Bulk upload response:", response);

            // Handle different response statuses
            if (response.status === 'success') {
                // All items succeeded
                setAlert(
                    <SweetAlert
                        success
                        title="Bulk Upload Complete!"
                        onConfirm={() => {
                            setAlert(null);
                            window.history.back();
                        }}
                    >
                        Successfully added all {response.successCount} items! 🎉
                    </SweetAlert>
                );
            } else if (response.status === 'partial') {
                // Some items succeeded, some failed
                const failedDetails = response.failedEntries.map(entry =>
                    `Item ${entry.index + 1}: ${entry.errorMessage}`
                ).join('\n');

                setAlert(
                    <SweetAlert
                        warning
                        title="Partial Success"
                        onConfirm={() => setAlert(null)}
                    >
                        <div className="text-left">
                            <p className="mb-2">✅ Success: {response.successCount} items</p>
                            <p className="mb-2">❌ Failed: {response.failureCount} items</p>
                            <div className="mt-4 p-3 bg-red-50 rounded border border-red-200 max-h-48 overflow-y-auto">
                                <p className="font-semibold text-red-700 mb-2">Failed Items:</p>
                                {response.failedEntries.map((entry, idx) => (
                                    <div key={idx} className="text-sm text-red-600 mb-1">
                                        • Item {entry.index + 1}: {entry.errorMessage}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SweetAlert>
                );
            } else if (response.status === 'failed') {
                // All items failed
                setAlert(
                    <SweetAlert
                        danger
                        title="Upload Failed"
                        onConfirm={() => setAlert(null)}
                    >
                        <div className="text-left">
                            <p className="mb-2">All {response.failureCount} items failed to upload.</p>
                            <div className="mt-4 p-3 bg-red-50 rounded border border-red-200 max-h-48 overflow-y-auto">
                                <p className="font-semibold text-red-700 mb-2">Errors:</p>
                                {response.failedEntries.map((entry, idx) => (
                                    <div key={idx} className="text-sm text-red-600 mb-1">
                                        • Item {entry.index + 1}: {entry.errorMessage}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SweetAlert>
                );
            }
        } catch (error) {
            console.error("Error adding bulk content:", error);
            setAlert(
                <SweetAlert
                    danger
                    title="Error"
                    onConfirm={() => setAlert(null)}
                >
                    Failed to submit bulk content. Please try again.
                </SweetAlert>
            );
        } finally {
            setLoading({ submitting: false });
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
