import React, { useRef, useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import AnnotationCanvas from "./AnnotationCanvas_v2";
import { uploadFileToS3 } from "../../../../../_services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { examMarksEntryService } from "../Services/ExamMarksEntry.Service";

const MarkingInterface = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const examMarksId = id;
    const { 
        examScheduleId,
        studentId,
        subjectId,
        answerSheetUrl, 
        answerSheetType, 
        questionPaperUrl, 
        studentData,
    } = location.state || {};

    const [answerSheet, setAnswerSheet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ★★★ NEW: State to hold current marks distribution ★★★
    const [marksDistribution, setMarksDistribution] = useState([]);

    console.log(marksDistribution);

    const annotationCanvasRef = useRef(null);

    // Handler that AnnotationCanvas will call whenever marks change
    const handleMarksUpdate = (updatedMarks) => {
        console.log("Marks updated from canvas:", updatedMarks); // good for debugging
        setMarksDistribution(updatedMarks);
    };

    useEffect(() => {
        if (answerSheetUrl && studentData && studentId) {
            setAnswerSheet({
                ...studentData,
                studentId: studentId,
                fileUrl: answerSheetUrl,
                fileType: answerSheetType,
            });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [answerSheetUrl, answerSheetType, studentData, studentId]);

    const handleSave = async () => {
        try {
            if (!annotationCanvasRef.current) {
                toast.error("Canvas not initialized");
                return;
            }

            if (!studentId || !examScheduleId || !subjectId) {
                toast.error("Missing required IDs");
                return;
            }

            setSaving(true);

            const currentSheet = answerSheet;
            if (!currentSheet) {
                toast.error("Answer sheet not found");
                return;
            }

            // ★★★ Use the state instead of ref method ★★★
            const currentMarks = marksDistribution;

            const marksObtained = currentMarks.reduce((sum, item) => {
                return sum + (Number(item.marks) || 0);
            }, 0);

            // Export & upload annotated sheet...
            const totalPages = annotationCanvasRef.current.getTotalPages?.() ?? 1;
            let annotatedSheetUrl = null;

            toast.info("Exporting and uploading annotated sheet...");

            // (your existing export logic remains the same)
            if (totalPages === 1) {
                const canvas = annotationCanvasRef.current.exportCanvas();
                if (!canvas) throw new Error("Failed to export canvas");

                const dataUrl = canvas.toDataURL("image/png");
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File(
                    [blob],
                    `annotated_${currentSheet.rollNo || studentId}_${Date.now()}.png`,
                    { type: "image/png" }
                );

                annotatedSheetUrl = await uploadFileToS3(file);
            } else {
                const allPagesData = await annotationCanvasRef.current.exportAllPages?.() ?? [];
                if (!allPagesData.length) throw new Error("Failed to export pages");

                const firstImage = new Image();
                await new Promise((resolve) => {
                    firstImage.onload = resolve;
                    firstImage.src = allPagesData[0];
                });

                const pdfWidth = 210;
                const pdfHeight = (firstImage.height * pdfWidth) / firstImage.width;

                const pdf = new jsPDF({
                    orientation: firstImage.height > firstImage.width ? "portrait" : "landscape",
                    unit: "mm",
                    format: [pdfWidth, pdfHeight],
                });

                for (let i = 0; i < allPagesData.length; i++) {
                    if (i > 0) pdf.addPage();
                    pdf.addImage(allPagesData[i], "PNG", 0, 0, pdfWidth, pdfHeight);
                }

                const pdfBlob = pdf.output("blob");
                const file = new File(
                    [pdfBlob],
                    `annotated_${currentSheet.rollNo || studentId}_${Date.now()}.pdf`,
                    { type: "application/pdf" }
                );

                annotatedSheetUrl = await uploadFileToS3(file);
            }

            // Add annotated URL as first item
            const enhancedMarksDistribution = [
                {
                    question: "annotated_sheet_url",
                    marks: null,
                    url: annotatedSheetUrl
                },
                ...currentMarks
            ];

            // Prepare payload
            const payload = [{
                exam_schedule_id: Number(examScheduleId),
                subject_id: Number(subjectId),
                student_id: Number(studentId),
                marks_obtained: marksObtained,
                marks_distribution: enhancedMarksDistribution,
                attendance_status: "PRESENT",
                exam_marks_id: examMarksId ? Number(examMarksId) : undefined,
            }];

            toast.info("Submitting marks...");
            await examMarksEntryService.submitMarksBatch(payload);

            toast.success(`Saved! Total: ${marksObtained.toFixed(1)} marks`);
            setTimeout(() => navigate("/exam-management/answer-sheets"), 1800);
        } catch (error) {
            console.error("Save failed:", error);
            toast.error(`Failed: ${error.message || "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };
const handleCancel = () => navigate("/exam-management/answer-sheets");
    // ────────────────────────────────────────────────────────────────
    //                           RENDER
    // ────────────────────────────────────────────────────────────────

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!answerSheet) return <div className="min-h-screen flex items-center justify-center text-red-600">Answer sheet not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mark Answer Sheet</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {answerSheet.studentName} • {answerSheet.rollNo} • {answerSheet.course}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/exam-management/answer-sheets")} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? "Saving..." : "Save & Submit"}
                    </button>
                </div>
            </div>

            {/* Student Info */}
            <div className="bg-blue-50 border-b px-6 py-3 flex gap-6 text-sm">
                <div><span className="text-gray-600">ERN:</span> <span className="font-medium">{answerSheet.ernNo}</span></div>
            </div>

            {/* Two-column Layout: Question Paper (Left) & Answer Sheet (Right) */}
            <div className="flex-1 flex overflow-hidden gap-4 p-4">
                {/* Left: Question Paper */}
                <div className="flex-1 border rounded-lg overflow-auto bg-white p-2">
                    <h2 className="font-medium mb-2 text-gray-700">Question Paper</h2>
                    {questionPaperUrl ? (
                        questionPaperUrl.endsWith(".pdf") ? (
                            <iframe 
                                src={questionPaperUrl} 
                                className="w-full h-full" 
                                title="Question Paper"
                            />
                        ) : (
                            <img src={questionPaperUrl} alt="Question Paper" className="w-full h-auto" />
                        )
                    ) : <p className="text-gray-500">No question paper provided</p>}
                </div>

                {/* Answer Sheet + Annotation (right) */}
                <div className="flex-1 border rounded-lg overflow-auto bg-white p-2">
                    <h2 className="font-medium mb-2 text-gray-700">Answer Sheet</h2>
                    
                    {/* ★★★ Important: pass onMarksUpdate prop here ★★★ */}
                    <AnnotationCanvas
                        ref={annotationCanvasRef}
                        fileUrl={answerSheet.fileUrl}
                        fileType={answerSheet.fileType}
                          onMarksUpdate={(marks) => {
    console.log("Received marks from canvas:", marks);
    setMarksDistribution(marks);
  }}        // ← ADD THIS LINE
                    />
                </div>
            </div>
        </div>
    );
};

export default MarkingInterface;