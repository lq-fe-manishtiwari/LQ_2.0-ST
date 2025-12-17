import React, { useState } from "react";
import { contentService } from "../services/AddContent.service.js";
import { getPDFPageCount } from "./utils/pdfUtils.js";
import { useContentData } from "./hooks/useContentData.js";
import { useQuizManagement } from "./hooks/useQuizManagement.js";
import CustomSelect from "./components/CustomSelect.jsx";
import QuizIntegration from "./components/QuizIntegration.jsx";
import {useUserProfile} from "../../../../../contexts/UserProfileContext.jsx";

export default function AddContent() {
    // State management
    const [formData, setFormData] = useState({
        selectedProgram: "", selectedAcademicSemester: "", selectedBatch: "", selectedSubject: "",
        selectedModule: "", selectedUnit: "", contentType: "", contentLevel: "",
        contentTitle: "", averageReadingTime: "", description: "",
        file: null, fileUrl: "", fileName: "", filePageCount: 0, externalLink: "",
        addQuizToContent: false, quizSelections: []
    });

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const {getUserId} = useUserProfile();
    const userId = getUserId();
    // Custom hooks
    const { options, loading, setLoading, updateUnitsForModule, loadProgramRelatedData, loadBatchesForAcademicSemester } = useContentData(formData);
    const { addQuizSelection, updateQuizSelection, removeQuizSelection } = useQuizManagement(formData, setFormData);

    // Handle program selection
    const handleProgramChange = (value) => {
        setFormData(prev => ({
            ...prev,
            selectedProgram: value,
            selectedAcademicSemester: "",
            selectedBatch: "",
            selectedSubject: "",
            selectedModule: "",
            selectedUnit: ""
        }));
    };

    // Handle academic semester selection with auto batch selection
    const handleAcademicSemesterChange = (value) => {
        setFormData(prev => ({
            ...prev,
            selectedAcademicSemester: value,
            selectedBatch: "",
            selectedSubject: "",
            selectedModule: "",
            selectedUnit: ""
        }));

        // Auto-select batch if only one option after batch loading
        setTimeout(() => {
            const autoSelectedBatch = loadBatchesForAcademicSemester();
            if (autoSelectedBatch) {
                setFormData(prev => ({
                    ...prev,
                    selectedBatch: autoSelectedBatch
                }));
            }
        }, 100);
    };

    // Handle input changes
    const handleInputChange = async (e) => {
        const { name, value, files } = e.target;
        
        if (files && files[0]) {
            // Handle file upload immediately
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file, fileName: file.name }));
            
            // Get page count for PDF files
            let pageCount = 0;
            if (file.type === 'application/pdf') {
                try {
                    console.log("Detecting PDF page count...");
                    pageCount = await getPDFPageCount(file);
                    console.log("PDF page count detected:", pageCount);
                } catch (error) {
                    console.log("Could not determine page count, using fallback");
                    pageCount = Math.max(1, Math.ceil(file.size / 50000)); // 50KB per page average
                }
            } else if (file.type.startsWith('image/')) {
                pageCount = 1; // Images are always 1 page
            }
            
            // Upload to S3 immediately
            try {
                setLoading(prev => ({ ...prev, uploading: true }));
                console.log("Uploading file immediately:", file);
                const fileUrl = await contentService.uploadFileToS3(file);
                console.log("File uploaded successfully, URL:", fileUrl);
                setFormData(prev => ({ ...prev, fileUrl: fileUrl, filePageCount: pageCount }));
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("Error uploading file. Please try again.");
                setFormData(prev => ({ ...prev, file: null, fileName: "", fileUrl: "", filePageCount: 0 }));
                e.target.value = "";
            } finally {
                setLoading(prev => ({ ...prev, uploading: false }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle module selection to update units
    const handleModuleChange = (moduleId) => {
        setFormData(prev => ({ ...prev, selectedModule: moduleId, selectedUnit: "" }));
        updateUnitsForModule(moduleId);
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data on userId:", userId);
        // Validate required fields for new payload structure
        if (!formData.selectedUnit || !formData.contentType || !formData.contentTitle) {
            alert("Please fill in all required fields: Unit, Content Type, and Content Title");
            return;
        }

        // Get selected content type details for validation
        const selectedContentType = options.contentTypes.find(ct => ct.value === formData.contentType);
        const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";

        // Validate content type specific fields
        if (contentTypeName.toLowerCase().includes("file") && !formData.fileUrl) {
            alert("Please upload a file");
            return;
        }
        if (contentTypeName.toLowerCase().includes("link") && !formData.externalLink) {
            alert("Please provide an external link");
            return;
        }

        // Validate quiz selections if enabled
        if (formData.addQuizToContent && formData.quizSelections.length > 0) {
            for (const quiz of formData.quizSelections) {
                if (!quiz.quizId || !quiz.pageNumber) {
                    alert("Please complete all quiz selections or remove incomplete ones");
                    return;
                }
            }
        }

        try {
            // Get selected content type details
            const selectedContentType = options.contentTypes.find(ct => ct.value === formData.contentType);
            const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";

            // Determine content link based on content type
            let contentLink = "";
            if (contentTypeName.toLowerCase().includes("file") && formData.fileUrl) {
                contentLink = formData.fileUrl;
            } else if (contentTypeName.toLowerCase().includes("link") && formData.externalLink) {
                contentLink = formData.externalLink;
            }

            // Transform quiz selections to ContentQuizAttachmentDto format
            const quizAttachments = formData.addQuizToContent && formData.quizSelections.length > 0
                ? formData.quizSelections.map((quiz, index) => ({
                    attachment_id: null, // Will be generated by backend
                    quiz_id: parseInt(quiz.quizId),
                    attachment_place: quiz.pageNumber,
                    display_order: index + 1
                }))
                : [];

            // Convert average reading time from minutes to seconds
            const averageReadingTimeSeconds = formData.averageReadingTime ? 
                parseInt(formData.averageReadingTime) * 60 : 0;

            // Create payload matching CreateContentRequest structure
            const submitData = {
                content_name: formData.contentTitle,
                content_description: formData.description || "",
                content_link: contentLink,
                unit_id: parseInt(formData.selectedUnit),
                content_type_id: parseInt(formData.contentType), // Use actual ID from API
                content_level_id: parseInt(formData.contentLevel), // Use actual ID from API
                average_reading_time_seconds: averageReadingTimeSeconds,
                quiz_attachments: quizAttachments.length > 0 ? quizAttachments : null,
                admin:false,
                user_id:userId,
            };

            console.log("Submitting data:", submitData);
            const result = await contentService.AddContent(submitData);
            alert("Content added successfully!");
            console.log("AddContent result:", result);
            // Reset form
            setFormData({
                selectedProgram: "", selectedClass: "", selectedSemester: "", selectedSubject: "",
                selectedModule: "", selectedUnit: "", contentType: "", contentLevel: "",
                contentTitle: "", averageReadingTime: "", description: "",
                file: null, fileUrl: "", fileName: "", filePageCount: 0, externalLink: "",
                addQuizToContent: false, quizSelections: []
            });
        } catch (error) {
            console.error("Error adding content:", error);
            alert("Error adding content. Please try again.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Add Content</h2>
                <button type="button" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition" onClick={() => window.history.back()}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Academic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect
                        label="Program"
                        value={formData.selectedProgram}
                        onChange={handleProgramChange}
                        options={options.programs}
                        placeholder="Select Program"
                        required
                    />
                    <CustomSelect
                        label="Academic Year / Semester"
                        value={formData.selectedAcademicSemester}
                        onChange={handleAcademicSemesterChange}
                        options={options.academicSemesters}
                        placeholder="Select Academic Year / Semester"
                        disabled={!formData.selectedProgram}
                        required
                    />
                    <CustomSelect
                        label="Batch"
                        value={formData.selectedBatch}
                        onChange={(value) => setFormData(prev => ({ ...prev, selectedBatch: value }))}
                        options={options.batches}
                        placeholder="Select Batch"
                        disabled={!formData.selectedProgram}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <CustomSelect
                        label="Paper"
                        value={formData.selectedSubject}
                        onChange={(value) => setFormData(prev => ({ ...prev, selectedSubject: value }))}
                        options={options.subjects}
                        placeholder="Select Paper"
                        disabled={!formData.selectedProgram}
                        loading={loading.subjects}
                        required
                    />
                    <CustomSelect
                        label="Module"
                        value={formData.selectedModule}
                        onChange={handleModuleChange}
                        options={options.modules}
                        placeholder="Select Module"
                        disabled={!formData.selectedSubject}
                        loading={loading.modules}
                        required
                    />
                    <CustomSelect
                        label="Unit"
                        value={formData.selectedUnit}
                        onChange={(value) => setFormData(prev => ({ ...prev, selectedUnit: value }))}
                        options={options.units}
                        placeholder="Select Unit"
                        disabled={!formData.selectedModule}
                        loading={loading.units}
                        required
                    />
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomSelect
                        label="Content Type"
                        value={formData.contentType}
                        onChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                        options={options.contentTypes}
                        placeholder="Select Content Type"
                        required
                    />
                    <CustomSelect
                        label="Content Level"
                        value={formData.contentLevel}
                        onChange={(value) => setFormData(prev => ({ ...prev, contentLevel: value }))}
                        options={options.contentLevels}
                        placeholder="Select Content Level"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Content Title <span className="text-red-500">*</span></label>
                        <input type="text" name="contentTitle" value={formData.contentTitle} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="Enter Title" required />
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">Average Reading Time (minutes) <span className="text-red-500">*</span></label>
                        <input type="number" name="averageReadingTime" value={formData.averageReadingTime} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="30" min="1" required />
                    </div>
                </div>

                {/* Content Type Specific Fields */}
                {(() => {
                    const selectedContentType = options.contentTypes.find(ct => ct.value === formData.contentType);
                    const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";
                    return contentTypeName.toLowerCase().includes("file");
                })() && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">File Upload</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block font-medium mb-1 text-gray-700">Upload File <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleInputChange}
                                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    required={!formData.fileUrl}
                                />
                            </div>
                            {formData.fileUrl && (
                                <button
                                    type="button"
                                    onClick={() => setShowPreviewModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Preview
                                </button>
                            )}
                        </div>
                        
                        {loading.uploading && (
                            <p className="text-sm text-blue-600 mt-2">⏳ Uploading file...</p>
                        )}
                        
                        {formData.fileUrl && formData.fileName && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-700">
                                    ✅ <strong>{formData.fileName}</strong> uploaded successfully
                                </p>
                                {formData.filePageCount > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        📄 Detected {formData.filePageCount} page{formData.filePageCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {(() => {
                    const selectedContentType = options.contentTypes.find(ct => ct.value === formData.contentType);
                    const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";
                    return contentTypeName.toLowerCase().includes("link");
                })() && (
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">External Link <span className="text-red-500">*</span></label>
                        <input type="url" name="externalLink" value={formData.externalLink} onChange={handleInputChange} placeholder="https://example.com" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" required />
                    </div>
                )}


                {/* Quiz Integration Component */}
                <QuizIntegration
                    formData={formData}
                    setFormData={setFormData}
                    options={options}
                    loading={loading}
                    addQuizSelection={addQuizSelection}
                    updateQuizSelection={updateQuizSelection}
                    removeQuizSelection={removeQuizSelection}
                />

                {/* Description */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" rows="4" placeholder="Enter content description..."></textarea>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors" disabled={Object.values(loading).some(Boolean)}>
                        {loading.uploading ? 'Uploading...' : Object.values(loading).some(Boolean) ? 'Loading...' : 'Submit'}
                    </button>
                    <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors" onClick={() => window.history.back()}>Cancel</button>
                </div>
            </form>

            {/* Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">File Preview - {formData.fileName}</h3>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                            {formData.fileUrl && (
                                <iframe
                                    src={formData.fileUrl}
                                    className="w-full h-96 border rounded"
                                    title="File Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
