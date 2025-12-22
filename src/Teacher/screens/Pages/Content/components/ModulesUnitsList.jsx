import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen, Loader2, Play, File, Eye, X, ExternalLink, Clock, Edit, Trash2, Layers } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { ContentApiService } from '../services/contentApi';
import { contentService } from '../services/content.service';

export default function ModulesUnitsList({ modules, colorCode }) {
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [unitContent, setUnitContent] = useState(null);
    const [moduleContent, setModuleContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadingModule, setLoadingModule] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, content: null });
    const [readingTimer, setReadingTimer] = useState(0);
    const [editModal, setEditModal] = useState({ isOpen: false, content: null });
    const [editFormData, setEditFormData] = useState({});
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, contentId: null });
    const [showAlert, setShowAlert] = useState(false);
    const [contentToDelete, setContentToDelete] = useState(null);
    const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
    const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
    const [showUpdateSuccessAlert, setShowUpdateSuccessAlert] = useState(false);
    const [showUpdateErrorAlert, setShowUpdateErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const toggleModule = async (moduleId) => {
        if (expandedModuleId === moduleId) {
            setExpandedModuleId(null);
            setModuleContent(null);
        } else {
            setExpandedModuleId(moduleId);
            setLoadingModule(true);
            setModuleContent(null);
            setUnitContent(null);
            setSelectedUnitId(null);

            try {
                const response = await ContentApiService.getApprovedModuleLevelContent(moduleId);
                if (response.success) {
                    setModuleContent(response.data);
                }
            } catch (error) {
                console.error('Error fetching module content:', error);
            } finally {
                setLoadingModule(false);
            }
        }
    };

    const handleUnitClick = async (unitId) => {
        if (selectedUnitId === unitId) {
            // If same unit is clicked, close it
            setSelectedUnitId(null);
            setUnitContent(null);
            return;
        }

        setSelectedUnitId(unitId);
        setLoadingContent(true);
        setContentError(null);

        try {
            const response = await ContentApiService.getContentByUnits(unitId);
            if (response.success) {
                setUnitContent(response.data);
            } else {
                setContentError('Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching unit content:', error);
            setContentError('Error loading content. Please try again.');
        } finally {
            setLoadingContent(false);
        }
    };

    const handleViewContent = (content) => {
        const link = content.content_link;

        // Check if it's an external link (starts with http/https)
        if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
            // Check if it's a file that can be previewed
            const fileExtension = link.split('.').pop()?.toLowerCase();
            const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'ogg'];

            if (previewableTypes.includes(fileExtension)) {
                // Reset timer and open in preview modal
                setReadingTimer(0);
                setPreviewModal({ isOpen: true, content });
            } else {
                // Open external link in new tab
                window.open(link, '_blank', 'noopener,noreferrer');
            }
        } else {
            // Handle relative links or show error
            console.warn('Invalid content link:', link);
        }
    };

    const closePreviewModal = () => {
        setPreviewModal({ isOpen: false, content: null });
        setReadingTimer(0);
    };

    const handleEditContent = (content) => {
        setEditFormData({
            contentName: content.content_name || '',
            contentDescription: content.content_description || '',
            contentLink: content.content_link || '',
            averageReadingTimeSeconds: content.average_reading_time_seconds || 0,
            file: null,
            fileName: content.content_link ? content.content_link.split('/').pop() : '',
            fileUrl: content.content_link || '',
        });
        setEditModal({ isOpen: true, content });
    };

    const closeEditModal = () => {
        setEditModal({ isOpen: false, content: null });
        setEditFormData({});
        setShowFilePreview(false);
        setUploadingFile(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingFile(true);
            setEditFormData(prev => ({ ...prev, file, fileName: file.name }));

            // Upload to S3 using the service
            const fileUrl = await contentService.uploadFileToS3(file);
            setEditFormData(prev => ({ ...prev, fileUrl, contentLink: fileUrl }));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
            setEditFormData(prev => ({ ...prev, file: null, fileName: prev.fileName }));
        } finally {
            setUploadingFile(false);
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateContent = async () => {
        try {
            const updateRequest = {
                content_name: editFormData.contentName,
                content_description: editFormData.contentDescription,
                content_link: editFormData.contentLink,
                unit_id: editModal.content.unit_id,
                average_reading_time_seconds: parseInt(editFormData.averageReadingTimeSeconds) || 0,
                content_type_id: editModal.content.content_type_id,
                content_level_id: editModal.content.content_level_id,
                quiz_attachments: editModal.content.quiz_attachments || [],
                admin: false,
                module_id: editModal.content.module_id,
            };

            await contentService.updateContent(editModal.content.content_id, updateRequest);
            setAlertMessage('Content updated successfully!');
            setShowUpdateSuccessAlert(true);
            closeEditModal();

            // Refresh the content
            if (selectedUnitId) {
                const response = await ContentApiService.getContentByUnits(selectedUnitId);
                if (response.success) {
                    setUnitContent(response.data);
                }
            }
            if (expandedModuleId) {
                const response = await ContentApiService.getApprovedModuleLevelContent(expandedModuleId);
                if (response.success) {
                    setModuleContent(response.data);
                }
            }
        } catch (error) {
            console.error('Error updating content:', error);
            setErrorMessage('Error updating content. Please try again.');
            setShowUpdateErrorAlert(true);
        }
    };

    const handleDeleteContent = (contentId) => {
        setContentToDelete(contentId);
        setShowAlert(true);
    };

    const handleConfirmDelete = async () => {
        setShowAlert(false);
        try {
            await contentService.softDeleteContent(contentToDelete);
            setAlertMessage('Content deleted successfully!');
            setShowDeleteSuccessAlert(true);
            setContentToDelete(null);

            // Refresh the content
            if (selectedUnitId) {
                const response = await ContentApiService.getContentByUnits(selectedUnitId);
                if (response.success) {
                    setUnitContent(response.data);
                }
            }
            if (expandedModuleId) {
                const response = await ContentApiService.getApprovedModuleLevelContent(expandedModuleId);
                if (response.success) {
                    setModuleContent(response.data);
                }
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            setErrorMessage('Error deleting content. Please try again.');
            setShowDeleteErrorAlert(true);
            setContentToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowAlert(false);
        setContentToDelete(null);
    };

    // Timer effect for reading time
    useEffect(() => {
        let interval;
        if (previewModal.isOpen) {
            interval = setInterval(() => {
                setReadingTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [previewModal.isOpen]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatReadingTime = (seconds) => {
        if (!seconds) return null;
        const minutes = Math.round(seconds / 60);
        return minutes > 0 ? `${minutes} min` : '< 1 min';
    };

    const renderPreviewContent = (content) => {
        const link = content.content_link;
        const fileExtension = link?.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'pdf':
                return (
                    <iframe
                        src={link}
                        className="w-full h-full border-0"
                        title={content.content_name}
                    />
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <img
                        src={link}
                        alt={content.content_name}
                        className="max-w-full max-h-full object-contain"
                    />
                );
            case 'mp4':
            case 'webm':
            case 'ogg':
                return (
                    <video
                        src={link}
                        controls
                        className="max-w-full max-h-full"
                        title={content.content_name}
                    />
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FileText className="w-16 h-16 mb-4" />
                        <p className="text-lg mb-2">Cannot preview this file type</p>
                        <button
                            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in New Tab
                        </button>
                    </div>
                );
        }
    };

    const getContentIcon = (contentTypeId) => {
        // You can map content_type_id to specific icons based on your system
        switch (contentTypeId) {
            case 1: // Assuming 1 is for documents/PDFs
                return <File className="w-4 h-4" />;
            case 2: // Assuming 2 is for videos
                return <Play className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const renderContentItem = (content, index, contentType = 'unit') => {
        const isModule = contentType === 'module';
        const borderColor = isModule ? 'border-amber-200' : 'border-blue-200';
        const bgColor = isModule ? 'bg-amber-50' : 'bg-blue-50';
        const iconBgColor = isModule ? 'bg-amber-100' : 'bg-blue-100';
        const iconColor = isModule ? 'text-amber-600' : 'text-blue-600';

        return (
            <div key={content.content_id || index} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 ${bgColor} rounded-lg border-2 ${borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                    <div
                        className={`p-2 sm:p-3 rounded-lg ${iconBgColor} shadow-sm flex-shrink-0`}
                    >
                        {getContentIcon(content.content_type_id)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                            {content.content_name || 'Untitled Content'}
                        </h4>
                        {content.content_description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{content.content_description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                            {content.quiz_attachments && content.quiz_attachments.length > 0 && (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 ${iconBgColor} ${iconColor} text-xs font-medium rounded-full`}>
                                    <FileText className="w-3 h-3" />
                                    {content.quiz_attachments.length} Quiz {content.quiz_attachments.length === 1 ? 'Attachment' : 'Attachments'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* View Button */}
                    <button
                        onClick={() => handleViewContent(content)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View Content"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                        onClick={() => handleEditContent(content)}
                        className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        title="Edit Content"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => handleDeleteContent(content.content_id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Delete Content"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (!modules || modules.length === 0) {
        return (
            <div className="text-center py-6 sm:py-8 text-gray-500 px-4">
                <span className="text-sm sm:text-base">No modules available for this subject.</span>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Header with clear title */}
                <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b-2" style={{ borderColor: `${colorCode}30` }}>
                    <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${colorCode}20` }}>
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colorCode }} />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Modules</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-5">
                    {modules.map((module) => (
                        <div
                            key={module.module_id}
                            className="border-2 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                            style={{
                                borderColor: expandedModuleId === module.module_id ? colorCode : `${colorCode}30`,
                            }}
                        >
                            {/* Module Header / Button */}
                            <button
                                onClick={() => toggleModule(module.module_id)}
                                className="w-full flex items-center justify-between p-3 sm:p-5 text-left transition-all duration-200 group"
                                style={{
                                    backgroundColor: expandedModuleId === module.module_id
                                        ? colorCode
                                        : `${colorCode}08`,
                                }}
                            >
                                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                    {/* Module Number Badge */}
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-lg ${expandedModuleId === module.module_id
                                            ? 'bg-white/90 shadow-md'
                                            : 'bg-white shadow-sm'
                                            }`}
                                        style={{
                                            color: expandedModuleId === module.module_id ? colorCode : '#6B7280'
                                        }}
                                    >
                                        {modules.findIndex(m => m.module_id === module.module_id) + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                            <span className={`text-xs font-semibold uppercase tracking-wide ${expandedModuleId === module.module_id ? 'text-white/90' : 'text-gray-500'
                                                }`}>
                                                Module {modules.findIndex(m => m.module_id === module.module_id) + 1}
                                            </span>
                                        </div>
                                        <h4 className={`text-sm sm:text-lg font-bold truncate ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {module.module_name}
                                        </h4>
                                    </div>

                                    {/* Units Count Badge */}
                                    <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg ${expandedModuleId === module.module_id
                                        ? 'bg-white/20 backdrop-blur-sm'
                                        : 'bg-white shadow-sm'
                                        }`}>
                                        <FileText className={`w-4 h-4 ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-600'
                                            }`} />
                                        <span className={`text-sm font-semibold ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {module.units ? module.units.length : 0} Units
                                        </span>
                                    </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                <div className={`ml-2 sm:ml-4 p-1 sm:p-2 rounded-lg transition-transform duration-200 ${expandedModuleId === module.module_id ? 'rotate-0 bg-white/20' : 'rotate-0 bg-white/50'
                                    }`}>
                                    {expandedModuleId === module.module_id ? (
                                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: colorCode }} />
                                    )}
                                </div>
                            </button>

                            {/* Units List (Expanded Content) */}
                            {expandedModuleId === module.module_id && (
                                <div className="bg-gradient-to-b from-gray-50 to-white p-3 sm:p-6 animate-in slide-in-from-top-2 duration-300">
                                    {/* Module Level Content */}
                                    {loadingModule ? (
                                        <div className="flex items-center justify-center gap-3 py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200 mb-6">
                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: colorCode }} />
                                            <span className="text-base font-medium">Loading module resources...</span>
                                        </div>
                                    ) : moduleContent && moduleContent.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-amber-50 border-2 border-amber-200">
                                                <div className="p-2 rounded-lg bg-amber-100">
                                                    <BookOpen className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-bold text-gray-900 text-base">Module Content</h4>
                                                </div>
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                                    {moduleContent.length} {moduleContent.length === 1 ? 'Resource' : 'Resources'}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {moduleContent.map((content, index) => renderContentItem(content, index, 'module'))}
                                            </div>
                                            <div className="border-b-2 border-gray-100 my-6"></div>
                                        </div>
                                    )}

                                    {/* Units Header */}
                                    {module.units && module.units.length > 0 && (
                                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                                            <div className="p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: `${colorCode}20` }}>
                                                <Layers className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: colorCode }} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">Units</h4>
                                            </div>
                                        </div>
                                    )}

                                    {module.units && module.units.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                {module.units.map((unit, idx) => (
                                                    <div key={unit.unit_id || idx} className="space-y-3">
                                                        {/* Unit Card */}
                                                        <div
                                                            onClick={() => handleUnitClick(unit.unit_id)}
                                                            className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${selectedUnitId === unit.unit_id
                                                                ? 'bg-white border-blue-400 shadow-md'
                                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                                }`}
                                                        >
                                                            {/* Unit Number */}
                                                            <div
                                                                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-sm sm:text-base ${selectedUnitId === unit.unit_id
                                                                    ? 'shadow-md'
                                                                    : 'shadow-sm'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: selectedUnitId === unit.unit_id ? `${colorCode}20` : '#F3F4F6',
                                                                    color: selectedUnitId === unit.unit_id ? colorCode : '#6B7280'
                                                                }}
                                                            >
                                                                {idx + 1}
                                                            </div>

                                                            {/* Unit Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-xs font-semibold uppercase tracking-wide ${selectedUnitId === unit.unit_id ? 'text-blue-600' : 'text-gray-500'
                                                                        }`}>
                                                                        Unit {idx + 1}
                                                                    </span>
                                                                    {selectedUnitId === unit.unit_id && (
                                                                        <span className="hidden sm:inline px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                                            Expanded
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h5 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                                                    {unit.unit_name || unit.name || `Unit ${idx + 1}`}
                                                                </h5>
                                                            </div>

                                                            {/* Loading or Arrow Icon */}
                                                            {loadingContent && selectedUnitId === unit.unit_id ? (
                                                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" />
                                                            ) : (
                                                                <ChevronRight
                                                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${selectedUnitId === unit.unit_id ? 'rotate-90 text-blue-500' : 'text-gray-400'
                                                                        }`}
                                                                />
                                                            )}
                                                        </div>

                                                    {/* Unit Content Display */}
                                                        {/* Unit Content Display */}
                                                        {selectedUnitId === unit.unit_id && (
                                                            <div className="ml-4 sm:ml-8 pl-3 sm:pl-6 border-l-4 rounded-bl-lg animate-in slide-in-from-top-2 duration-200"
                                                                style={{ borderColor: `${colorCode}40` }}>
                                                                {loadingContent ? (
                                                                    <div className="flex items-center justify-center gap-3 py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                                                                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: colorCode }} />
                                                                        <span className="text-sm font-medium">Loading unit content...</span>
                                                                    </div>
                                                                ) : contentError ? (
                                                                    <div className="py-4">
                                                                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                                                            <p className="text-red-700 font-medium text-sm mb-2">⚠️ {contentError}</p>
                                                                            <button
                                                                                onClick={() => handleUnitClick(unit.unit_id)}
                                                                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                                            >
                                                                                🔄 Try Again
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : unitContent && Array.isArray(unitContent) ? (
                                                                    <div className="py-4 space-y-4">
                                                                        {unitContent.length > 0 ? (
                                                                            <div className="space-y-3">
                                                                                {unitContent.map((content, index) => renderContentItem(content, index, 'unit'))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                                                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                                                <p className="text-sm text-gray-500 font-medium">No content available for this unit yet.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="py-4">
                                                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                                            <p className="text-sm text-gray-500 font-medium">No content available for this unit yet.</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-base text-gray-500 font-medium">No units found in this module.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Preview Modal */}
            {previewModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="relative w-full h-full max-w-7xl max-h-full m-4 bg-white rounded-2xl overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b-2 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {previewModal.content?.content_name || 'Content Preview'}
                                    </h3>
                                    <p className="text-xs text-gray-500">Preview Mode</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.open(previewModal.content?.content_link, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open in New Tab
                                </button>
                                <button
                                    onClick={closePreviewModal}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-6 h-full overflow-auto bg-gray-50">
                            <div className="w-full h-full flex items-center justify-center">
                                {renderPreviewContent(previewModal.content)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Content Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-full">
                                        <Edit className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Edit Content</h3>
                                        <p className="text-sm text-blue-100">Update content details and files</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeEditModal}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {/* Content Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Content Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="contentName"
                                    value={editFormData.contentName || ''}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter content name"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="contentDescription"
                                    value={editFormData.contentDescription || ''}
                                    onChange={handleEditFormChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Enter description"
                                />
                            </div>

                            {/* File Upload Section */}
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Content File
                                </label>

                                {/* Current File Display */}
                                {editFormData.fileUrl && !editFormData.file && (
                                    <div className="mb-3 p-3 bg-white border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <File className="w-5 h-5 text-blue-600" />
                                                <span className="text-sm text-gray-700 font-medium">
                                                    Current: {editFormData.fileName}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowFilePreview(true)}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Upload New File */}
                                <div className="flex gap-3">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    />
                                </div>

                                {uploadingFile && (
                                    <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading file...
                                    </p>
                                )}

                                {editFormData.file && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-700 flex items-center gap-2">
                                            <span className="text-lg">✅</span>
                                            <strong>{editFormData.fileName}</strong> uploaded successfully
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Reading Time */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Average Reading Time (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="averageReadingTimeSeconds"
                                    value={editFormData.averageReadingTimeSeconds || 0}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
                            <button
                                onClick={closeEditModal}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateContent}
                                disabled={uploadingFile}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploadingFile ? 'Uploading...' : 'Update Content'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Modal */}
            {showFilePreview && editFormData.fileUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold">File Preview</h3>
                            <button
                                onClick={() => setShowFilePreview(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto">
                            <iframe
                                src={editFormData.fileUrl}
                                className="w-full h-[70vh] border-0 rounded-lg"
                                title="File Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Alert */}
            {showAlert && (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Yes, Delete!"
                    cancelBtnText="Cancel"
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                    title="Are you sure?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                >
                    You won't be able to recover this content!
                </SweetAlert>
            )}

            {/* Success Alert */}
            {showDeleteSuccessAlert && (
                <SweetAlert
                    success
                    title="Deleted!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setShowDeleteSuccessAlert(false)}
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {/* Error Alert */}
            {showDeleteErrorAlert && (
                <SweetAlert
                    danger
                    title="Error!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setShowDeleteErrorAlert(false)}
                >
                    {errorMessage}
                </SweetAlert>
            )}

            {/* Update Success Alert */}
            {showUpdateSuccessAlert && (
                <SweetAlert
                    success
                    title="Updated!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setShowUpdateSuccessAlert(false)}
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {/* Update Error Alert */}
            {showUpdateErrorAlert && (
                <SweetAlert
                    danger
                    title="Error!"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setShowUpdateErrorAlert(false)}
                >
                    {errorMessage}
                </SweetAlert>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Icon Header */}
                        <div className="pt-8 pb-4 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <Trash2 className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Content?</h3>
                            <p className="text-gray-600 text-center px-6">
                                Are you sure you want to delete this content? This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-3 border-t">
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, contentId: null })}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium btn-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium btn-confirm"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
