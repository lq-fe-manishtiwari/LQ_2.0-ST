import React, { useEffect } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { getPDFPageCount } from "../../AddContent/utils/pdfUtils.js";
import { useContentData } from "../../AddContent/hooks/useContentData.js";
import CustomSelect from "../../AddContent/components/CustomSelect.jsx";
import { contentService } from '../../services/AddContent.service.js';
// import { contentService } from "../../Services/AddContent.service.js";

const BulkContentRow = ({ item, onUpdate, onRemove, onPreview }) => {
    const { options, loading, updateUnitsForModule } = useContentData(item);

    useEffect(() => {
        if (item.selectedModule && options.modules.length > 0) {

            updateUnitsForModule(item.selectedModule);
        }
    }, [item.selectedModule, options.modules.length]); // Run when modules load or selection changes


    const handleChange = (field, value) => {
        // Prepare update object
        let changes = { [field]: value };

        // Handle Cascading Resets
        if (field === 'selectedProgram') {
            changes = { ...changes, selectedAcademicSemester: "", selectedBatch: "", selectedSubject: "", selectedModule: "", selectedUnit: "" };
        } else if (field === 'selectedAcademicSemester') {
            changes = { ...changes, selectedBatch: "", selectedSubject: "", selectedModule: "", selectedUnit: "" };
        } else if (field === 'selectedBatch') {
            changes = { ...changes, selectedSubject: "", selectedModule: "", selectedUnit: "" };
        } else if (field === 'selectedSubject') {
            changes = { ...changes, selectedModule: "", selectedUnit: "" };
        } else if (field === 'selectedModule') {
            changes = { ...changes, selectedUnit: "" };
            // Also need to update units options
            updateUnitsForModule(value);

            // Auto-fill title (Live Update)
            if (options.modules) {
                const selectedMod = options.modules.find(m => m.value == value);
                if (selectedMod) {
                    changes = { ...changes, contentTitle: selectedMod.label };
                }
            }
        } else if (field === 'selectedUnit') {
            // Auto-fill title (Live Update)
            if (options.units) {
                const selectedUnitOption = options.units.find(u => u.value == value);
                if (selectedUnitOption) {
                    changes = { ...changes, contentTitle: selectedUnitOption.label };
                }
            }
        }

        onUpdate(item.id, changes);
    };

    const handleFileChange = async (files) => {
        if (files && files[0]) {
            const file = files[0];

            // Notify parent uploading started
            onUpdate(item.id, {
                uploading: true,
                fileName: file.name,
                file: file,
                status: 'uploading'
            });

            try {
                let pageCount = 0;
                if (file.type === 'application/pdf') {
                    try {
                        pageCount = await getPDFPageCount(file);
                    } catch (error) {
                        pageCount = Math.max(1, Math.ceil(file.size / 50000));
                    }
                } else if (file.type.startsWith('image/')) {
                    pageCount = 1;
                }

                // Internal Upload
                const fileUrl = await contentService.uploadFileToS3(file);

                onUpdate(item.id, {
                    uploading: false,
                    fileUrl: fileUrl,
                    filePageCount: pageCount,
                    status: 'done',
                    contentTitle: item.contentTitle || file.name.replace(/\.[^/.]+$/, "")
                });

            } catch (error) {
                console.error("Upload error:", error);
                onUpdate(item.id, {
                    uploading: false,
                    status: 'error'
                });
            }
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm relative mb-4">
            <div className="absolute top-2 right-2">
                {/* Only show remove if not the only item? User said "alag alag module", implying flexibility. 
                     Typically we allow removing any row if there's >1, or event if 1 and we want to clear? 
                     Parent handles the 'items.length === 1' check usually. */}
                <button onClick={() => onRemove(item.id)} className="text-red-500 hover:text-red-700 p-1">✕</button>
            </div>


            {/* Filters Section */}
            <div className="bg-gray-50 p-3 rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <CustomSelect
                        label="Program"
                        value={item.selectedProgram}
                        onChange={(value) => handleChange('selectedProgram', value)}
                        options={options.programs}
                        placeholder="Select Program"
                        required
                    />
                    <CustomSelect
                        label="Academic Year / Semester"
                        value={item.selectedAcademicSemester}
                        onChange={(value) => handleChange('selectedAcademicSemester', value)}
                        options={options.academicSemesters}
                        placeholder="Select Academic Year / Semester"
                        disabled={!item.selectedProgram}
                        required
                    />
                    <CustomSelect
                        label="Batch"
                        value={item.selectedBatch}
                        onChange={(value) => handleChange('selectedBatch', value)}
                        options={options.batches}
                        placeholder="Select Batch"
                        disabled={!item.selectedProgram}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <CustomSelect
                        label="Paper"
                        value={item.selectedSubject}
                        onChange={(value) => handleChange('selectedSubject', value)}
                        options={options.subjects}
                        placeholder="Select Paper"
                        disabled={!item.selectedProgram}
                        loading={loading.subjects}
                        required
                    />
                    <CustomSelect
                        label="Module"
                        value={item.selectedModule}
                        onChange={(value) => handleChange('selectedModule', value)}
                        options={options.modules}
                        placeholder="Select Module"
                        disabled={!item.selectedSubject}
                        loading={loading.modules}
                        required
                    />
                    <CustomSelect
                        label="Unit"
                        value={item.selectedUnit}
                        onChange={(value) => handleChange('selectedUnit', value)}
                        options={options.units}
                        placeholder="Select Unit"
                        disabled={!item.selectedModule}
                        loading={loading.units}
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <CustomSelect
                    label="Type"
                    value={item.contentType}
                    onChange={(value) => handleChange('contentType', value)}
                    options={options.contentTypes}
                    placeholder="Type"
                    required
                />
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={item.contentTitle}
                        onChange={(e) => handleChange('contentTitle', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Content Title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time (mins) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        value={item.averageReadingTime}
                        onChange={(e) => handleChange('averageReadingTime', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="30"
                        min="1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect
                    label="Level"
                    value={item.contentLevel}
                    onChange={(value) => handleChange('contentLevel', value)}
                    options={options.contentLevels}
                    placeholder="Level"
                />

                {/* File/Link Input based on Type */}
                {(() => {
                    const selectedContentType = options.contentTypes.find(ct => ct.value === item.contentType);
                    const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";

                    if (contentTypeName.toLowerCase().includes("file")) {
                        return (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">File <span className="text-red-500">*</span></label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e.target.files)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        disabled={loading.uploading || item.status === 'uploading'}
                                    />
                                    {item.fileUrl && (
                                        <button
                                            type="button"
                                            onClick={() => onPreview(item.fileUrl, item.fileName)}
                                            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Preview
                                        </button>
                                    )}
                                </div>
                                {item.status === 'uploading' && <span className="text-xs text-blue-600">Uploading...</span>}
                                {item.status === 'done' && <span className="text-xs text-green-600">✓ {item.fileName}</span>}
                                {item.status === 'error' && <span className="text-xs text-red-600">⚠ Upload Failed</span>}
                            </div>
                        );
                    } else if (contentTypeName.toLowerCase().includes("link")) {
                        return (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">External Link <span className="text-red-500">*</span></label>
                                <input
                                    type="url"
                                    value={item.externalLink}
                                    onChange={(e) => handleChange('externalLink', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                        );
                    } else {
                        return <div></div>;
                    }
                })()}
            </div>
        </div>
    );
};

export default BulkContentRow;
