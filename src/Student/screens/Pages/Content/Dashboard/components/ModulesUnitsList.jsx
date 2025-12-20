import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, BookOpen, Loader2, Play, File, Eye, X, ExternalLink, HelpCircle, ZoomIn, ZoomOut, RotateCcw, Clock } from 'lucide-react';
import { ContentService } from '../../Service/Content.service';
import PDFViewer from './PDFViewer';
import QuizModal from './QuizModal';
import QuizHistoryModal from './QuizHistoryModal';


export default function ModulesUnitsList({ modules, colorCode }) {
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [unitContent, setUnitContent] = useState(null);
    const [moduleContent, setModuleContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadingModule, setLoadingModule] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, content: null });
    const [imageZoom, setImageZoom] = useState(1);
    const [quizModal, setQuizModal] = useState({ isOpen: false, quizId: null, contentId: null });
    const [quizHistoryModal, setQuizHistoryModal] = useState({
        isOpen: false,
        quizId: null,
        contentId: null,
        quizName: null
    });
    const [studentId, setStudentId] = useState(null);
    const [readingTimer, setReadingTimer] = useState(0);

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
                const response = await ContentService.getApprovedModuleLevelContent(moduleId);
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

    // Fetch student profile on component mount
    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await ContentService.getProfile();
                if (response.success && response.data) {
                    const extractedStudentId = response.data.student_id || response.data.id;
                    setStudentId(extractedStudentId);
                }
            } catch (error) {
                console.error('Error fetching student profile:', error);
            }
        };

        fetchStudentProfile();
    }, []);

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
            const response = await ContentService.getContentByUnits(unitId);
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
        setImageZoom(1); // Reset zoom when closing
        setReadingTimer(0);
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

    // Image zoom functions
    const handleImageZoomIn = () => {
        setImageZoom(prev => Math.min(prev + 0.25, 3.0)); // Max zoom 3x
    };

    const handleImageZoomOut = () => {
        setImageZoom(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 0.25x
    };

    const handleImageResetZoom = () => {
        setImageZoom(1); // Reset to default
    };

    const handleQuizClick = (quizAttachment, contentId, quizName = null) => {
        console.log('Quiz clicked:', quizAttachment, 'Content ID:', contentId);

        // First show quiz history modal to check previous attempts
        setQuizHistoryModal({
            isOpen: true,
            quizId: quizAttachment.quiz_id,
            contentId: contentId,
            quizName: quizName || `Quiz ${quizAttachment.quiz_id}`
        });
    };

    const closeQuizModal = () => {
        setQuizModal({ isOpen: false, quizId: null, contentId: null });
    };

    const closeQuizHistoryModal = () => {
        setQuizHistoryModal({
            isOpen: false,
            quizId: null,
            contentId: null,
            quizName: null
        });
    };

    const handleStartQuizFromHistory = () => {
        // Close history modal and open quiz modal
        const { quizId, contentId } = quizHistoryModal;
        closeQuizHistoryModal();
        setQuizModal({ isOpen: true, quizId: quizId, contentId: contentId });
    };

    const renderPreviewContent = (content) => {
        const link = content.content_link;
        const fileExtension = link?.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'pdf':
                return (
                    <PDFViewer
                        content={content}
                        colorCode={colorCode}
                        onClose={closePreviewModal}
                        onQuizClick={(quiz) => handleQuizClick(quiz, content.content_id, content.content_name)}
                    />
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <div className="relative w-full h-full flex items-center justify-center overflow-auto">
                        <img
                            src={link}
                            alt={content.content_name}
                            className="object-contain transition-transform duration-200"
                            style={{
                                transform: `scale(${imageZoom})`,
                                maxWidth: imageZoom > 1 ? 'none' : '100%',
                                maxHeight: imageZoom > 1 ? 'none' : '100%'
                            }}
                        />

                        {/* Image Zoom Controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white shadow-lg border border-gray-200 px-3 py-2 rounded-lg z-20">
                            <button
                                onClick={handleImageZoomOut}
                                disabled={imageZoom <= 0.25}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>

                            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                                {Math.round(imageZoom * 100)}%
                            </span>

                            <button
                                onClick={handleImageZoomIn}
                                disabled={imageZoom >= 3.0}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleImageResetZoom}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quiz Buttons for Images */}
                        {content.quiz_attachments && content.quiz_attachments.length > 0 && (
                            <div className="absolute top-4 left-4 space-y-2">
                                {content.quiz_attachments.map((quiz, index) => (
                                    <button
                                        key={quiz.attachment_id || index}
                                        onClick={() => handleQuizClick(quiz, content.content_id, content.content_name)}
                                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg hover:opacity-90 transition-colors"
                                        style={{ backgroundColor: colorCode }}
                                    >
                                        <HelpCircle className="w-5 h-5" />
                                        Quiz {quiz.quiz_id}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'mp4':
            case 'webm':
            case 'ogg':
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <video
                            src={link}
                            controls
                            className="max-w-full max-h-full"
                            title={content.content_name}
                        />

                        {/* Quiz Buttons for Videos */}
                        {content.quiz_attachments && content.quiz_attachments.length > 0 && (
                            <div className="absolute top-4 right-4 space-y-2">
                                {content.quiz_attachments.map((quiz, index) => (
                                    <button
                                        key={quiz.attachment_id || index}
                                        onClick={() => handleQuizClick(quiz, content.content_id, content.content_name)}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
                                    >
                                        <HelpCircle className="w-5 h-5" />
                                        Quiz {quiz.quiz_id}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                                    {/* Module Level Content */}
                                    {loadingModule ? (
                                        <div className="flex items-center gap-2 py-2 text-gray-500 mb-4">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Loading module content...</span>
                                        </div>
                                    ) : moduleContent && moduleContent.length > 0 && (
                                        <div className="mb-6 space-y-3">
                                            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: colorCode }}></div>
                                                Module Resources
                                            </h4>
                                            <div className="space-y-2 px-1">
                                                {moduleContent.map((content, index) => renderContentItem(content, index))}
                                            </div>
                                            <div className="border-b border-gray-100 my-4"></div>
                                        </div>
                                    )}

                                    {/* Units Header */}
                                    {module.units && module.units.length > 0 && (
                                        <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                                            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: colorCode }}></div>
                                            Learning Units
                                        </h4>
                                    )}

                                    {module.units && module.units.length > 0 ? (
                                        <ul className="space-y-2">
                                            {module.units.map((unit, idx) => (
                                                <li key={unit.unit_id || idx} className="space-y-2">
                                                    <div
                                                        onClick={() => handleUnitClick(unit.unit_id)}
                                                        className={`flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer group ${selectedUnitId === unit.unit_id
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'hover:bg-gray-50 border-gray-100'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`p-2 rounded-full transition-colors ${selectedUnitId === unit.unit_id
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

            {/* Content Preview Modal - Integrated with Layout */}
            {previewModal.isOpen && (
                <div className="fixed inset-0 bg-white z-40" style={{ marginLeft: '220px' }}>
                    <div className="relative w-full h-full bg-white">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {previewModal.content?.content_name || 'Content Preview'}
                                </h3>
                                {previewModal.content?.average_reading_time_seconds && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>Est. {formatReadingTime(previewModal.content.average_reading_time_seconds)} read</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Reading: {formatTime(readingTimer)}</span>
                                </div>
                                {previewModal.content?.quiz_attachments && previewModal.content.quiz_attachments.length > 0 && (
                                    <span
                                        className="px-3 py-1 text-white text-sm rounded-full"
                                        style={{ backgroundColor: colorCode }}
                                    >
                                        {previewModal.content.quiz_attachments.length} Quiz{previewModal.content.quiz_attachments.length > 1 ? 'zes' : ''} Available
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mr-10">
                                <button
                                    onClick={closePreviewModal}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                                    title="Close"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content - Full Height */}
                        <div className="bg-gray-50" style={{ height: 'calc(100vh - 80px)' }}>
                            {renderPreviewContent(previewModal.content)}
                        </div>

                        {/* Quiz Information Panel */}
                        {previewModal.content?.quiz_attachments && previewModal.content.quiz_attachments.length > 0 && (
                            <div className="absolute bottom-4 left-4 bg-white border border-gray-200 shadow-lg p-3 rounded-lg max-w-xs">
                                <h4 className="font-semibold mb-2 text-gray-800 text-sm">Available Quizzes:</h4>
                                <div className="space-y-1 text-xs">
                                    {previewModal.content.quiz_attachments.map((quiz, index) => (
                                        <div key={quiz.attachment_id || index} className="flex items-center justify-center">
                                            {/* <span className="text-gray-700">Quiz {quiz.quiz_id}</span> */}
                                            <span
                                                className="text-white px-2 py-0.5 rounded text-xs"
                                                style={{ backgroundColor: colorCode }}
                                            >
                                                Page {quiz.attachment_place}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            <QuizModal
                isOpen={quizModal.isOpen}
                onClose={closeQuizModal}
                quizId={quizModal.quizId}
                colorCode={colorCode}
                contentId={quizModal.contentId}
            />

            {/* Quiz History Modal */}
            <QuizHistoryModal
                isOpen={quizHistoryModal.isOpen}
                onClose={closeQuizHistoryModal}
                onStartQuiz={handleStartQuizFromHistory}
                quizId={quizHistoryModal.quizId}
                contentId={quizHistoryModal.contentId}
                studentId={studentId}
                colorCode={colorCode}
                quizName={quizHistoryModal.quizName}
            />
        </>
    );
}
