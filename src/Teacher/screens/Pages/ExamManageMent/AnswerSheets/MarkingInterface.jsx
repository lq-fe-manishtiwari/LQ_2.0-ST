import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import AnnotationCanvas from "./AnnotationCanvas_v2";
// import { answerSheetService } from "../Services/AnswerSheetService";
// import { uploadFileToS3 } from "../../../../_services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const MarkingInterface = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [answerSheet, setAnswerSheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const annotationCanvasRef = useRef(null);

    useEffect(() => {
        fetchAnswerSheet();
    }, [id]);

    const fetchAnswerSheet = async () => {
        try {
            setLoading(true);
            // In production, this will fetch from API
            // const response = await answerSheetService.getAnswerSheetById(id);
            // setAnswerSheet(response.data);

            // For now, using dummy data
            const dummyData = getDummyAnswerSheet(id);
            setAnswerSheet(dummyData);
        } catch (error) {
            console.error("Error fetching answer sheet:", error);
            toast.error("Failed to load answer sheet");
        } finally {
            setLoading(false);
        }
    };

    const getDummyAnswerSheet = (id) => {
        const dummySheets = [
            {
                id: "1",
                studentName: "Rahul Patil",
                rollNo: "CS101",
                ernNo: "ERN2025001",
                program: "PGDM",
                classYear: "First Year",
                course: "Data Structures",
                examSchedule: "Mid Term Exam 2025",
                fileUrl: "https://dev-learnqoch.s3.ap-south-1.amazonaws.com/naac/1768311662-merged_1768311662797.pdf",
                fileType: "pdf",
                status: "Pending",
            },
            {
                id: "2",
                studentName: "Sneha Kulkarni",
                rollNo: "MBA202",
                ernNo: "ERN2025002",
                program: "MBA",
                classYear: "Second Year",
                course: "Finance Management",
                examSchedule: "End Term Exam 2025",
                fileUrl: "https://via.placeholder.com/800x1200/EFEFEF/333333?text=Answer+Sheet+Image",
                fileType: "image",
                status: "Pending",
            },
        ];

        return dummySheets.find((sheet) => sheet.id === id) || dummySheets[0];
    };

    const handleSave = async () => {
        try {
            console.log('=== SAVE STARTED ===');

            if (!annotationCanvasRef.current) {
                console.error('Canvas ref is null');
                toast.error("Canvas not initialized");
                return;
            }

            setSaving(true);
            console.log('Saving state set to true');

            const currentSheet = answerSheet;
            if (!currentSheet) {
                console.error('Answer sheet not found');
                toast.error("Answer sheet not found");
                return;
            }
            console.log('Current sheet:', currentSheet);

            // Get total pages from canvas component
            const totalPages = annotationCanvasRef.current.getTotalPages ?
                annotationCanvasRef.current.getTotalPages() : 1;

            console.log('Total pages to save:', totalPages);

            if (totalPages === 1) {
                // Single page - simple save
                const canvas = annotationCanvasRef.current.exportCanvas();
                if (!canvas) {
                    toast.error("Failed to export canvas");
                    return;
                }

                const dataUrl = canvas.toDataURL('image/png');
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const fileName = `annotated_${currentSheet.rollNo}_${Date.now()}.png`;
                const file = new File([blob], fileName, { type: 'image/png' });

                console.log('Starting S3 upload...');
                toast.info("Uploading to S3...");
                const s3Url = await uploadFileToS3(file);
                console.log('S3 Upload successful! URL:', s3Url);

                const updateData = {
                    annotatedFileUrl: s3Url,
                    status: 'marked',
                    markedAt: new Date().toISOString()
                };

                console.log('Update data:', updateData);
                toast.success("Annotated sheet saved successfully!");

                setTimeout(() => {
                    navigate('/exam-management/answer-sheets');
                }, 1500);

            } else {
                // Multi-page - create PDF with all pages
                console.log('Exporting multi-page PDF...');
                toast.info(`Exporting ${totalPages} pages...`);

                const allPagesData = annotationCanvasRef.current.exportAllPages ?
                    await annotationCanvasRef.current.exportAllPages() : [];

                if (!allPagesData || allPagesData.length === 0) {
                    toast.error("Failed to export all pages");
                    return;
                }

                console.log('All pages exported:', allPagesData.length);

                // Create PDF with all pages
                toast.info('Creating PDF...');

                // Get dimensions from first page
                const firstImage = new Image();
                await new Promise((resolve) => {
                    firstImage.onload = resolve;
                    firstImage.src = allPagesData[0];
                });

                // Create PDF with proper dimensions
                const imgWidth = firstImage.width;
                const imgHeight = firstImage.height;
                const pdfWidth = 210; // A4 width in mm
                const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

                const pdf = new jsPDF({
                    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
                    unit: 'mm',
                    format: [pdfWidth, pdfHeight]
                });

                // Add all pages to PDF
                for (let i = 0; i < allPagesData.length; i++) {
                    console.log(`Adding page ${i + 1}/${allPagesData.length} to PDF`);
                    toast.info(`Adding page ${i + 1}/${allPagesData.length} to PDF...`);

                    if (i > 0) {
                        pdf.addPage();
                    }

                    pdf.addImage(allPagesData[i], 'PNG', 0, 0, pdfWidth, pdfHeight);
                }

                // Convert PDF to blob
                const pdfBlob = pdf.output('blob');
                console.log('PDF created, size:', pdfBlob.size, 'bytes');

                // Create file from blob
                const fileName = `annotated_${currentSheet.rollNo}_${Date.now()}.pdf`;
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                // Upload single PDF to S3
                console.log('Uploading PDF to S3...');
                toast.info("Uploading PDF to S3...");
                const s3Url = await uploadFileToS3(file);
                console.log('PDF uploaded to S3:', s3Url);

                const updateData = {
                    annotatedFileUrl: s3Url, // Single PDF URL
                    status: 'marked',
                    markedAt: new Date().toISOString(),
                    totalPages: totalPages
                };

                console.log('Update data:', updateData);
                toast.success(`PDF with ${totalPages} pages saved successfully!`);

                setTimeout(() => {
                    navigate('/exam-management/answer-sheets');
                }, 1500);
            }

        } catch (error) {
            console.error("=== ERROR IN SAVE ===");
            console.error("Error details:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setSaving(false);
            console.log('=== SAVE ENDED ===');
        }
    };

    const handleCancel = () => {
        navigate("/exam-management/answer-sheets");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading answer sheet...</div>
            </div>
        );
    }

    if (!answerSheet) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">Answer sheet not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Mark Answer Sheet
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {answerSheet.studentName} • {answerSheet.rollNo} •{" "}
                                {answerSheet.course}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            {saving ? "Saving..." : "Save Marked Sheet"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Info Bar */}
            <div className="bg-blue-50 border-b px-6 py-3">
                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-gray-600">ERN:</span>{" "}
                        <span className="font-medium">{answerSheet.ernNo}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Program:</span>{" "}
                        <span className="font-medium">{answerSheet.program}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Class:</span>{" "}
                        <span className="font-medium">{answerSheet.classYear}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Exam:</span>{" "}
                        <span className="font-medium">{answerSheet.examSchedule}</span>
                    </div>
                </div>
            </div>

            {/* Annotation Canvas */}
            <div className="flex-1 overflow-hidden">
                <AnnotationCanvas
                    ref={annotationCanvasRef}
                    fileUrl={answerSheet.fileUrl}
                    fileType={answerSheet.fileType}
                    onSave={handleSave}
                />
            </div>
        </div>
    );
};

export default MarkingInterface;
