import React, { useState, useRef, useEffect } from 'react';
import { Loader2, HelpCircle, ChevronLeft, ChevronRight, ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PDFViewer({ content, colorCode, onClose, onQuizClick }) {
    const containerRef = useRef(null);
    const canvasRefs = useRef({});
    const renderTasksRef = useRef({});
    const [pdfDoc, setPdfDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [renderedPages, setRenderedPages] = useState(new Set());
    const [showQuizButtons, setShowQuizButtons] = useState([]);
    const [scale, setScale] = useState(1.2);

    // Update quiz buttons for specific page
    const updateQuizButtonsForPage = (pageNumber, quizAttachments) => {
        const quizzesForPage = quizAttachments.filter(quiz =>
            parseInt(quiz.attachment_place) === pageNumber
        );
        setShowQuizButtons(quizzesForPage);
    };

    // Load PDF document
    const loadPDF = async (url) => {
        try {
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
            setRenderedPages(new Set());
            updateQuizButtonsForPage(1, content?.quiz_attachments || []);
            
            // Start rendering pages progressively
            renderAllPages(pdf);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    };

    // Render all pages progressively
    const renderAllPages = async (pdf) => {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            try {
                await renderPage(pageNum, pdf);
                setRenderedPages(prev => new Set([...prev, pageNum]));
            } catch (error) {
                console.error(`Error rendering page ${pageNum}:`, error);
            }
        }
    };

    // Render individual page
    const renderPage = async (pageNum, pdf) => {
        if (!pdf || !canvasRefs.current[pageNum]) return;
        
        try {
            // Cancel any existing render task for this page
            if (renderTasksRef.current[pageNum]) {
                renderTasksRef.current[pageNum].cancel();
                delete renderTasksRef.current[pageNum];
            }

            const page = await pdf.getPage(pageNum);
            const canvas = canvasRefs.current[pageNum];
            const context = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            // Store the render task so we can cancel it if needed
            const renderTask = page.render(renderContext);
            renderTasksRef.current[pageNum] = renderTask;
            
            await renderTask.promise;
            
            // Clean up the render task reference
            delete renderTasksRef.current[pageNum];
        } catch (error) {
            // Only log errors that aren't cancellation errors
            if (error.name !== 'RenderingCancelledException') {
                console.error(`Error rendering page ${pageNum}:`, error);
            }
        }
    };

    // Handle page navigation
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            updateQuizButtonsForPage(newPage, content?.quiz_attachments || []);
            
            // Scroll to the specific page
            const pageElement = canvasRefs.current[newPage];
            if (pageElement && containerRef.current) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Handle scroll-based page detection
    const handleScroll = () => {
        if (!containerRef.current || !pdfDoc) return;
        
        const container = containerRef.current;
        
        // Find which page is most visible
        let mostVisiblePage = 1;
        let maxVisibleArea = 0;
        
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const canvas = canvasRefs.current[pageNum];
            if (!canvas) continue;
            
            const rect = canvas.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate visible area of this page
            const visibleTop = Math.max(rect.top, containerRect.top);
            const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            if (visibleHeight > maxVisibleArea) {
                maxVisibleArea = visibleHeight;
                mostVisiblePage = pageNum;
            }
        }
        
        if (mostVisiblePage !== currentPage) {
            setCurrentPage(mostVisiblePage);
            updateQuizButtonsForPage(mostVisiblePage, content?.quiz_attachments || []);
        }
    };

    // Cancel all render tasks
    const cancelAllRenderTasks = () => {
        Object.values(renderTasksRef.current).forEach(task => {
            if (task && task.cancel) {
                task.cancel();
            }
        });
        renderTasksRef.current = {};
    };

    // Zoom functions
    const handleZoomIn = () => {
        const newScale = Math.min(scale + 0.2, 3.0); // Max zoom 3x
        setScale(newScale);
    };

    const handleZoomOut = () => {
        const newScale = Math.max(scale - 0.2, 0.5); // Min zoom 0.5x
        setScale(newScale);
    };

    const handleResetZoom = () => {
        setScale(1.2); // Reset to default
    };

    // Load PDF when component mounts
    useEffect(() => {
        if (content?.content_link) {
            loadPDF(content.content_link);
        }
        
        // Cleanup function to cancel all render tasks when component unmounts
        return () => {
            cancelAllRenderTasks();
        };
    }, [content]);

    // Also cancel render tasks when scale changes
    useEffect(() => {
        if (pdfDoc) {
            cancelAllRenderTasks();
            setRenderedPages(new Set());
            renderAllPages(pdfDoc);
        }
    }, [scale]);

    return (
        <div className="relative w-full h-full bg-gray-50">
            <div 
                ref={containerRef}
                className="w-full h-full overflow-auto"
                onScroll={handleScroll}
                style={{ maxHeight: '80vh' }}
            >
                <div className="flex flex-col items-center py-4 space-y-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <div key={pageNum} className="relative">
                            <canvas
                                ref={el => canvasRefs.current[pageNum] = el}
                                className="shadow-lg border border-gray-200 max-w-full h-auto"
                                style={{ 
                                    display: 'block',
                                    opacity: renderedPages.has(pageNum) ? 1 : 0.3
                                }}
                            />
                            {!renderedPages.has(pageNum) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200">
                                    <div className="text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        <span className="text-sm text-gray-600">Loading page {pageNum}...</span>
                                    </div>
                                </div>
                            )}
                            {/* Page number indicator */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                {pageNum}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Quiz Buttons Overlay */}
        {showQuizButtons.length > 0 && (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 space-y-2 z-20">
        {showQuizButtons.map((quiz, index) => (
            <button
                key={quiz.attachment_id || index}
                onClick={() => onQuizClick(quiz)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg hover:opacity-90 transition-all animate-pulse"
                style={{ backgroundColor: colorCode }}
            >
                <HelpCircle className="w-5 h-5" />
                Quiz {quiz.quiz_id}
            </button>
        ))}
    </div>
)}


            {/* Current Page Indicator */}
            <div className="absolute top-4 left-4 bg-white shadow-lg border border-gray-200 px-3 py-2 rounded-lg z-20">
                <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
            </div>

            {/* Page Navigation Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white shadow-lg border border-gray-200 px-4 py-2 rounded-lg z-20">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Go to Page</span>
                    <input
                        type="number"
                        value={currentPage}
                        onChange={(e) => handlePageChange(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                        max={totalPages}
                    />
                    <span className="text-sm text-gray-600">of {totalPages}</span>
                </div>
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-16 right-4 flex items-center gap-2 bg-white shadow-lg border border-gray-200 px-3 py-2 rounded-lg z-20">
                <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                
                <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                </span>
                
                <button
                    onClick={handleZoomIn}
                    disabled={scale >= 3.0}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                
                <button
                    onClick={handleResetZoom}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Reset Zoom"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Back Button */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>
        </div>
    );
}