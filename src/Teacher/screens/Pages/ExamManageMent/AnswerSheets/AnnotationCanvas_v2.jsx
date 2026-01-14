import React, { useRef, useState, useEffect, useImperativeHandle } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Pen, Eraser, Type, Undo, Redo, Trash2, ZoomIn, ZoomOut, CheckCircle, XIcon } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const AnnotationCanvas = React.forwardRef(({ fileUrl, fileType }, ref) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#FF0000");
    const [brushSize, setBrushSize] = useState(3);
    const [zoom, setZoom] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [selectedStamp, setSelectedStamp] = useState(null);
    const [pageAnnotations, setPageAnnotations] = useState({}); // Store annotations per page

    const isPDF = fileType === "application/pdf" || fileType === "pdf";
    const lastPos = useRef({ x: 0, y: 0 });

    // Debug: Log component mount and props
    useEffect(() => {
        console.log('AnnotationCanvas mounted with props:', {
            fileUrl,
            fileType,
            isPDF
        });
    }, []);

    // Load PDF/Image as background
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (isPDF && pdfLoaded) {
            // PDF will be loaded via onPageLoadSuccess
            return;
        }

        if (!isPDF) {
            // Load image
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                setBackgroundImage(img);
                ctx.drawImage(img, 0, 0);
                saveToHistory();
            };
            img.src = fileUrl;
        }
    }, [fileUrl, fileType, isPDF, pdfLoaded]);

    // Restore page annotations when page changes
    useEffect(() => {
        if (canvasRef.current && pageAnnotations[pageNumber]) {
            const ctx = canvasRef.current.getContext('2d');
            // Small delay to ensure PDF background is drawn first
            setTimeout(() => {
                ctx.putImageData(pageAnnotations[pageNumber], 0, 0);
                console.log('Restored annotations for page', pageNumber);
            }, 300);
        }
    }, [pageNumber, pageAnnotations]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        console.log('PDF Document loaded successfully! Total pages:', numPages);
        setNumPages(numPages);
        setPageNumber(1);
        setPdfLoaded(true);
        console.log('PDF state updated, pdfLoaded:', true);
    };

    const onPageLoadSuccess = () => {
        console.log('PDF page loaded, attempting to draw on canvas');
        setTimeout(() => {
            const pdfCanvas = document.querySelector('.react-pdf__Page__canvas');
            console.log('PDF Canvas element:', pdfCanvas);

            if (pdfCanvas && canvasRef.current) {
                const canvas = canvasRef.current;
                console.log('Setting canvas dimensions:', pdfCanvas.width, 'x', pdfCanvas.height);
                canvas.width = pdfCanvas.width;
                canvas.height = pdfCanvas.height;

                const ctx = canvas.getContext('2d');
                console.log('Drawing PDF to canvas...');
                ctx.drawImage(pdfCanvas, 0, 0);

                // Save PDF as background image
                const img = new Image();
                img.src = pdfCanvas.toDataURL();
                setBackgroundImage(img);
                saveToHistory();

                console.log('PDF successfully drawn on canvas:', canvas.width, 'x', canvas.height);
            } else {
                console.error('Canvas or PDF canvas not found!', {
                    pdfCanvas: pdfCanvas,
                    canvasRef: canvasRef.current
                });
            }
        }, 200);
    };

    const saveToHistory = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Use ImageData for lossless storage
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(imageData);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const redrawCanvas = () => {
        if (!canvasRef.current || !backgroundImage) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0);
    };

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        const pos = getMousePos(e);

        // If stamp is selected, place it at click position
        if (selectedStamp) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            ctx.font = "bold 48px Arial";
            ctx.fillStyle = selectedStamp === "✓" ? "#10B981" : selectedStamp === "✗" ? "#EF4444" : "#3B82F6";
            ctx.fillText(selectedStamp, pos.x - 20, pos.y + 20);

            saveToHistory();
            setSelectedStamp(null); // Clear selection after placing
            return;
        }

        // Normal drawing
        setIsDrawing(true);
        lastPos.current = pos;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (tool === "pen" || tool === "highlighter") {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getMousePos(e);

        if (tool === "pen") {
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.globalAlpha = 1;
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (tool === "highlighter") {
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize * 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.globalAlpha = 0.3;
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (tool === "eraser") {
            ctx.clearRect(pos.x - brushSize, pos.y - brushSize, brushSize * 2, brushSize * 2);
        }

        lastPos.current = pos;
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const undo = () => {
        if (historyStep > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            // Restore ImageData directly - lossless
            ctx.putImageData(history[historyStep - 1], 0, 0);
            setHistoryStep(historyStep - 1);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            // Restore ImageData directly - lossless
            ctx.putImageData(history[historyStep + 1], 0, 0);
            setHistoryStep(historyStep + 1);
        }
    };

    const clearCanvas = () => {
        redrawCanvas();
        saveToHistory();
    };

    const addText = () => {
        const text = prompt("Enter text:");
        if (text && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.font = `${brushSize * 10}px Arial`;
            ctx.fillStyle = color;
            ctx.fillText(text, 100, 100);
            saveToHistory();
        }
    };

    const addStamp = (value) => {
        setSelectedStamp(value);
        setTool("stamp"); // Switch to stamp mode
    };

    const handlePrevPage = () => {
        if (pageNumber > 1) {
            // Save current page annotations
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                const currentPageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                setPageAnnotations(prev => ({
                    ...prev,
                    [pageNumber]: currentPageData
                }));
            }

            // Go to previous page
            setPageNumber(pageNumber - 1);
            setHistory([]);
            setHistoryStep(-1);
        }
    };

    const handleNextPage = () => {
        if (pageNumber < numPages) {
            // Save current page annotations
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                const currentPageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                setPageAnnotations(prev => ({
                    ...prev,
                    [pageNumber]: currentPageData
                }));
            }

            // Go to next page
            setPageNumber(pageNumber + 1);
            setHistory([]);
            setHistoryStep(-1);
        }
    };

    useImperativeHandle(ref, () => ({
        exportCanvas: () => {
            if (canvasRef.current) {
                // Return the canvas element itself for blob conversion
                return canvasRef.current;
            }
            return null;
        },
        getTotalPages: () => {
            return numPages || 1;
        },
        exportAllPages: async () => {
            if (!isPDF || !numPages) {
                // Single page - return current canvas
                if (canvasRef.current) {
                    return [canvasRef.current.toDataURL('image/png')];
                }
                return [];
            }

            // Multi-page PDF - export all pages
            const allPages = [];
            const currentPage = pageNumber;

            console.log('Exporting all pages, current page:', currentPage);

            // Export all pages including saved annotations
            for (let page = 1; page <= numPages; page++) {
                console.log(`Exporting page ${page}/${numPages}`);

                if (page === currentPage) {
                    // Current page - export current canvas
                    if (canvasRef.current) {
                        allPages.push(canvasRef.current.toDataURL('image/png'));
                    }
                } else {
                    // Other pages - check if we have saved annotations
                    if (pageAnnotations[page]) {
                        // Create temporary canvas to render saved page
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = canvasRef.current.width;
                        tempCanvas.height = canvasRef.current.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.putImageData(pageAnnotations[page], 0, 0);
                        allPages.push(tempCanvas.toDataURL('image/png'));
                    } else {
                        // No annotations on this page - would need to load PDF page
                        console.warn(`Page ${page} has no annotations, skipping`);
                    }
                }
            }

            console.log('Total pages exported:', allPages.length);
            return allPages;
        }
    }));

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="border-b p-3 bg-gray-50">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Drawing Tools */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTool("pen")}
                            className={`p-2 rounded-lg transition ${tool === "pen" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}`}
                            title="Pen"
                        >
                            <Pen size={20} />
                        </button>
                        <button
                            onClick={() => setTool("highlighter")}
                            className={`p-2 rounded-lg transition ${tool === "highlighter" ? "bg-yellow-500 text-white" : "bg-white hover:bg-gray-100"}`}
                            title="Highlighter"
                        >
                            <Pen size={20} />
                        </button>
                        <button
                            onClick={() => setTool("eraser")}
                            className={`p-2 rounded-lg transition ${tool === "eraser" ? "bg-gray-500 text-white" : "bg-white hover:bg-gray-100"}`}
                            title="Eraser"
                        >
                            <Eraser size={20} />
                        </button>
                        <button
                            onClick={addText}
                            className="p-2 rounded-lg bg-white hover:bg-gray-100 transition"
                            title="Add Text"
                        >
                            <Type size={20} />
                        </button>
                    </div>

                    <div className="w-px h-8 bg-gray-300"></div>

                    {/* Color Picker */}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                        title="Color"
                    />

                    {/* Brush Size */}
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-24"
                        title="Brush Size"
                    />

                    <div className="w-px h-8 bg-gray-300"></div>

                    {/* Undo/Redo */}
                    <button onClick={undo} disabled={historyStep <= 0} className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30" title="Undo">
                        <Undo size={20} />
                    </button>
                    <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30" title="Redo">
                        <Redo size={20} />
                    </button>
                    <button onClick={clearCanvas} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Clear All">
                        <Trash2 size={20} />
                    </button>

                    <div className="w-px h-8 bg-gray-300"></div>

                    {/* Zoom */}
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Zoom Out">
                        <ZoomOut size={20} />
                    </button>
                    <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 rounded-lg hover:bg-gray-100 transition" title="Zoom In">
                        <ZoomIn size={20} />
                    </button>

                    {/* PDF Page Navigation */}
                    {isPDF && numPages > 1 && (
                        <>
                            <div className="w-px h-8 bg-gray-300 mx-2"></div>
                            <button onClick={handlePrevPage} disabled={pageNumber <= 1} className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30" title="Previous Page">
                                ←
                            </button>
                            <span className="text-sm font-medium min-w-[80px] text-center">
                                Page {pageNumber} / {numPages}
                            </span>
                            <button onClick={handleNextPage} disabled={pageNumber >= numPages} className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30" title="Next Page">
                                →
                            </button>
                        </>
                    )}
                </div>

                {/* Quick Marks */}
                <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-600 self-center mr-2">
                        Quick Marks: {selectedStamp && <span className="text-blue-600">(Click on canvas to place "{selectedStamp}")</span>}
                    </span>
                    {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((mark) => (
                        <button
                            key={mark}
                            onClick={() => addStamp(mark.toString())}
                            className={`px-3 py-1.5 rounded font-bold text-sm transition ${selectedStamp === mark.toString()
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                                }`}
                        >
                            {mark}
                        </button>
                    ))}
                    <button
                        onClick={() => addStamp("✓")}
                        className={`px-3 py-1.5 rounded font-bold text-lg transition flex items-center gap-1 ${selectedStamp === "✓"
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                            }`}
                        title="Add checkmark"
                    >
                        <CheckCircle size={18} /> ✓
                    </button>
                    <button
                        onClick={() => addStamp("✗")}
                        className={`px-3 py-1.5 rounded font-bold text-lg transition flex items-center gap-1 ${selectedStamp === "✗"
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 hover:bg-red-200 text-red-800'
                            }`}
                        title="Add cross mark"
                    >
                        <XIcon size={18} /> ✗
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                <div className="w-full h-full flex items-center justify-center">
                    {isPDF && (
                        <div style={{ position: 'absolute', left: '-9999px' }}>
                            {console.log('Rendering PDF Document component with URL:', fileUrl)}
                            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                                <Page pageNumber={pageNumber} onLoadSuccess={onPageLoadSuccess} renderTextLayer={false} renderAnnotationLayer={false} />
                            </Document>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="border shadow-lg bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        style={{
                            display: 'block',
                            cursor: selectedStamp ? 'pointer' : 'crosshair'
                        }}
                    />
                </div>
            </div>
        </div>
    );
});

AnnotationCanvas.displayName = 'AnnotationCanvas';

export default AnnotationCanvas;
