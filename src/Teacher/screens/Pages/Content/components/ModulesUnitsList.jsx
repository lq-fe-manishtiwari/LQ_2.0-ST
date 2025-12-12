import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen, Loader2, Play, File, Eye, X, ExternalLink } from 'lucide-react';
import { ContentApiService } from '../services/contentApi';

export default function ModulesUnitsList({ modules, colorCode }) {
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [unitContent, setUnitContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, content: null });

    const toggleModule = (moduleId) => {
        if (expandedModuleId === moduleId) {
            setExpandedModuleId(null);
        } else {
            setExpandedModuleId(moduleId);
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
                // Open in preview modal
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

    const renderContentItem = (content, index) => {
        return (
            <div key={content.content_id || index} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center gap-3 flex-1">
                    <div 
                        className="p-2 rounded-full bg-white"
                        style={{ color: colorCode }}
                    >
                        {getContentIcon(content.content_type_id)}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                            {content.content_name || 'Untitled Content'}
                        </h4>
                        {content.content_description && (
                            <p className="text-xs text-gray-600 mt-1">{content.content_description}</p>
                        )}
                        {content.quiz_attachments && content.quiz_attachments.length > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                {content.quiz_attachments.length} Quiz Attachments
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => handleViewContent(content)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                >
                    <Eye className="w-3 h-3" />
                    View
                </button>
            </div>
        );
    };

    if (!modules || modules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No modules available for this subject.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: colorCode }} />
                    Modules & Units
                </h3>

                <div className="grid grid-cols-1 gap-4">
                    {modules.map((module) => (
                        <div
                            key={module.module_id}
                            className="border rounded-lg overflow-hidden shadow-sm transition-all duration-200"
                            style={{
                                borderColor: `${colorCode}40`, // Low opacity border
                            }}
                        >
                            {/* Module Header / Button */}
                            <button
                                onClick={() => toggleModule(module.module_id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:opacity-95 transition-opacity"
                                style={{
                                    backgroundColor: expandedModuleId === module.module_id
                                        ? colorCode // Full color when active
                                        : `${colorCode}15`, // Very light bg when inactive
                                    color: expandedModuleId === module.module_id
                                        ? '#ffffff'
                                        : '#1f2937' // Text color logic
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-900'}`}>
                                        {module.module_name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${expandedModuleId === module.module_id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {module.units ? module.units.length : 0} Units
                                    </span>
                                </div>

                                {expandedModuleId === module.module_id ? (
                                    <ChevronDown className={`w-5 h-5 ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-500'}`} />
                                ) : (
                                    <ChevronRight className={`w-5 h-5 ${expandedModuleId === module.module_id ? 'text-white' : 'text-gray-500'}`} />
                                )}
                            </button>

                            {/* Units List (Expanded Content) */}
                            {expandedModuleId === module.module_id && (
                                <div className="bg-white p-4 animate-in slide-in-from-top-2 duration-200">
                                    {module.units && module.units.length > 0 ? (
                                        <ul className="space-y-2">
                                            {module.units.map((unit, idx) => (
                                                <li key={unit.unit_id || idx} className="space-y-2">
                                                    <div
                                                        onClick={() => handleUnitClick(unit.unit_id)}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer group ${
                                                            selectedUnitId === unit.unit_id 
                                                                ? 'bg-blue-50 border-blue-200' 
                                                                : 'hover:bg-gray-50 border-gray-100'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`p-2 rounded-full transition-colors ${
                                                                selectedUnitId === unit.unit_id
                                                                    ? 'bg-white'
                                                                    : 'bg-gray-100 group-hover:bg-white'
                                                            }`}
                                                            style={{ color: colorCode }}
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-gray-700 font-medium text-sm flex-1">
                                                            {unit.unit_name || unit.name || `Unit ${idx + 1}`}
                                                        </span>
                                                        {loadingContent && selectedUnitId === unit.unit_id && (
                                                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                                        )}
                                                    </div>

                                                    {/* Unit Content Display */}
                                                    {selectedUnitId === unit.unit_id && (
                                                        <div className="ml-6 pl-4 border-l-2 border-gray-200">
                                                            {loadingContent ? (
                                                                <div className="flex items-center gap-2 py-4 text-gray-500">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    <span className="text-sm">Loading content...</span>
                                                                </div>
                                                            ) : contentError ? (
                                                                <div className="py-4">
                                                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                                                        <p className="text-red-600 text-sm">{contentError}</p>
                                                                        <button
                                                                            onClick={() => handleUnitClick(unit.unit_id)}
                                                                            className="mt-2 text-red-600 text-sm underline hover:no-underline"
                                                                        >
                                                                            Try again
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : unitContent && Array.isArray(unitContent) ? (
                                                                <div className="py-4 space-y-3">
                                                                    <h4 className="font-medium text-gray-800 text-sm mb-3">
                                                                        Unit Content ({unitContent.length}):
                                                                    </h4>
                                                                    {unitContent.length > 0 ? (
                                                                        unitContent.map((content, index) => renderContentItem(content, index))
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 italic">No content available for this unit.</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="py-4">
                                                                    <p className="text-sm text-gray-500 italic">No content available for this unit.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic px-2">No units found in this module.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Preview Modal */}
            {previewModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative w-full h-full max-w-7xl max-h-full m-4 bg-white rounded-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {previewModal.content?.content_name || 'Content Preview'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.open(previewModal.content?.content_link, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open in New Tab
                                </button>
                                <button
                                    onClick={closePreviewModal}
                                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-4 h-full overflow-auto">
                            <div className="w-full h-full flex items-center justify-center">
                                {renderPreviewContent(previewModal.content)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
