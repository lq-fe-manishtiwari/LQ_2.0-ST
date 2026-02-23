import React, { useEffect, useState, useRef } from "react";
import {
    Plus,
    Trash2,
    UserX,
    Edit,
    ChevronDown,
    Download,
    Upload,
    X,
    FileText,
    Eye,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import SweetAlert from "react-bootstrap-sweetalert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const CATEGORIES = [
    { value: "Copyright", label: "Copyright" },
    { value: "Patent", label: "Patent" },
    { value: "Trademark", label: "Trademark" },
    { value: "Other", label: "Other" },
];

const DOCUMENT_TYPES = [
    "Patent Certificate",
    "Grant Letter",
    "General Page",
    "Publish Copy",
    "Certificate",
    "Other",
];

/* ─────────────────────────────────────────
   REUSABLE UI COMPONENTS
───────────────────────────────────────── */
const Input = ({ label, type = "text", value, onChange, required = false, placeholder = "" }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            required={required}
        />
    </div>
);

const DocumentViewer = ({ documents, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Uploaded Documents</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-600 transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-3">
                {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{doc.document_type}</p>
                            <p className="text-xs text-gray-500 truncate">{doc.document.split('/').pop()}</p>
                        </div>
                        <a
                            href={doc.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white text-blue-600 rounded-lg border border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                            title="View Document"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ─────────────────────────────────────────
   IPR FORM MODAL
───────────────────────────────────────── */
const IPRForm = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        title: "",
        publication_date: "",
        field_of_invention: "",
        category: "Copyright",
        other_category: "",
        co_author: [""],
    });

    const [documents, setDocuments] = useState([{
        id: Date.now(),
        document_type: "",
        document: "",
        status: "idle",
        isOther: false,
        customType: ""
    }]);

    const [saving, setSaving] = useState(false);
    const nextId = useRef(Date.now());

    useEffect(() => {
        if (initialData) {
            const isKnownCategory = CATEGORIES.some(c => c.value === initialData.category);
            setFormData({
                title: initialData.title || "",
                publication_date: initialData.publication_date || "",
                field_of_invention: initialData.field_of_invention || "",
                category: isKnownCategory ? (initialData.category || "Copyright") : "Other",
                other_category: isKnownCategory ? "" : (initialData.category || ""),
                co_author: Array.isArray(initialData.co_author) ? (initialData.co_author.length ? initialData.co_author : [""]) : [""],
            });

            if (initialData.documents?.length) {
                setDocuments(initialData.documents.map(doc => ({
                    id: nextId.current++,
                    document_type: DOCUMENT_TYPES.includes(doc.document_type) ? doc.document_type : "Other",
                    document: doc.document,
                    status: "done",
                    isOther: !DOCUMENT_TYPES.includes(doc.document_type),
                    customType: DOCUMENT_TYPES.includes(doc.document_type) ? "" : doc.document_type
                })));
            }
        }
    }, [initialData]);

    const addCoAuthor = () => setFormData(p => ({ ...p, co_author: [...p.co_author, ""] }));
    const removeCoAuthor = (idx) => setFormData(p => ({ ...p, co_author: p.co_author.filter((_, i) => i !== idx) }));
    const updateCoAuthor = (idx, val) => setFormData(p => {
        const updated = [...p.co_author];
        updated[idx] = val;
        return { ...p, co_author: updated };
    });

    const addDocumentRow = () => {
        setDocuments(prev => [...prev, {
            id: nextId.current++,
            document_type: "",
            document: "",
            status: "idle",
            isOther: false,
            customType: ""
        }]);
    };

    const removeDocumentRow = (id) => {
        if (documents.length === 1) {
            setDocuments([{ id: Date.now(), document_type: "", document: "", status: "idle", isOther: false, customType: "" }]);
        } else {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const updateDocumentRow = (id, field, value) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === id) {
                let updated = { ...doc, [field]: value };
                if (field === "document_type") {
                    updated.isOther = value === "Other";
                    if (value !== "Other") updated.customType = "";
                }
                return updated;
            }
            return doc;
        }));
    };

    const handleFileUpload = async (id, file) => {
        if (!file) return;
        updateDocumentRow(id, "status", "uploading");
        try {
            const url = await listOfBooksService.uploadDocumentToS3(file);
            setDocuments(prev => prev.map(doc =>
                doc.id === id ? { ...doc, document: url, status: "done", error: null } : doc
            ));
        } catch (err) {
            console.error("Upload failed:", err);
            updateDocumentRow(id, "status", "error");
        }
    };

    const isUploading = documents.some(d => d.status === "uploading");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUploading) return;
        setSaving(true);
        try {
            const payload = {
                ...formData,
                category: formData.category === "Other" ? formData.other_category : formData.category,
                co_author: formData.co_author.filter(a => a.trim() !== ""),
                documents: documents
                    .filter(d => d.document)
                    .map(d => ({
                        document_type: d.isOther ? d.customType : d.document_type,
                        document: d.document
                    })),
            };
            onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? "Edit IPR Record" : "Add IPR Record"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <Input
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder="Enter title of IPR"
                                required
                            />
                        </div>
                        <Input
                            label="Publication Date"
                            type="date"
                            value={formData.publication_date}
                            onChange={(e) => setFormData(p => ({ ...p, publication_date: e.target.value }))}
                            required
                        />
                        <Input
                            label="Field of Invention"
                            value={formData.field_of_invention}
                            onChange={(e) => setFormData(p => ({ ...p, field_of_invention: e.target.value }))}
                            placeholder="e.g. Computer Science, Biotechnology"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value, other_category: "" }))}
                                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        {formData.category === "Other" && (
                            <Input
                                label="Specify Category"
                                value={formData.other_category}
                                onChange={(e) => setFormData(p => ({ ...p, other_category: e.target.value }))}
                                placeholder="Please specify"
                                required
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Co-Authors</label>
                            <button type="button" onClick={addCoAuthor} className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                                <Plus size={14} /> Add Co-Author
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.co_author.map((author, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => updateCoAuthor(idx, e.target.value)}
                                        placeholder={`Co-Author ${idx + 1} name`}
                                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    {formData.co_author.length > 1 && (
                                        <button type="button" onClick={() => removeCoAuthor(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-md font-bold text-gray-900 flex items-center gap-2">
                                <Upload size={18} className="text-blue-600" /> Upload Documents
                            </label>
                            <button type="button" onClick={addDocumentRow} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1">
                                <Plus size={14} /> Add Document Row
                            </button>
                        </div>
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Document Type</label>
                                            <select
                                                value={doc.document_type}
                                                onChange={(e) => updateDocumentRow(doc.id, "document_type", e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            >
                                                <option value="">Select Document Type</option>
                                                {DOCUMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Document File</label>
                                                <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 h-[38px]">
                                                    {doc.status === "done" ? (
                                                        <>
                                                            <FileText size={14} className="text-blue-500 flex-shrink-0" />
                                                            <span className="text-xs text-blue-700 truncate flex-1 font-medium">{doc.document.split('/').pop()}</span>
                                                            <a href={doc.document} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-blue-600"><Eye size={12} /></a>
                                                            <X size={12} className="text-gray-400 cursor-pointer" onClick={() => updateDocumentRow(doc.id, "document", "")} />
                                                        </>
                                                    ) : (
                                                        <input
                                                            type="file"
                                                            className="text-xs w-full outline-none"
                                                            onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                                                            disabled={doc.status === "uploading"}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeDocumentRow(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    {doc.isOther && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Custom Document Name</label>
                                            <input
                                                type="text"
                                                value={doc.customType}
                                                onChange={(e) => updateDocumentRow(doc.id, "customType", e.target.value)}
                                                placeholder="Enter document type name"
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium italic"
                                                required
                                            />
                                        </div>
                                    )}

                                    {doc.status === "uploading" && (
                                        <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold px-1">
                                            <Loader2 size={12} className="animate-spin" /> Uploading document...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} disabled={isUploading || saving} className="px-6 py-2 border rounded-xl hover:bg-gray-50 text-sm font-bold min-w-[100px]">Cancel</button>
                        <button type="submit" disabled={isUploading || saving} className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm flex items-center gap-2 shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 min-w-[140px] justify-center">
                            {isUploading ? (<><Loader2 size={18} className="animate-spin" /> ...</>) :
                                saving ? (<><Loader2 size={18} className="animate-spin" /> ...</>) :
                                    (initialData ? <><Edit size={16} /> Update Record</> : <><Plus size={16} /> Save Record</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   MAIN IPR COMPONENT
───────────────────────────────────────── */
const IPR = () => {
    const userProfile = useUserProfile();
    const userId = userProfile.getUserId();
    const college_id = userProfile.getCollegeId();
    const teacherId = userProfile.getTeacherId();
    const departmentId = userProfile.getDepartmentId();

    const [alert, setAlert] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [viewingDocs, setViewingDocs] = useState(null);

    const fetchRecords = async () => {
        if (!userId || !college_id) { setLoading(false); return; }
        setLoading(true);
        try {
            const data = await listOfBooksService.getIPRByUserAndCollege(userId, college_id);
            setRecords(Array.isArray(data) ? data : data?.content || []);
        } catch (err) {
            console.error("Error fetching IPR records:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, [userId, college_id]);

    const getCollegeName = () => {
        try {
            const activeCollegeStr = localStorage.getItem("activeCollege");
            if (!activeCollegeStr) return "";
            const activeCollege = JSON.parse(activeCollegeStr);
            return activeCollege?.name || activeCollege?.college_name || "";
        } catch (error) {
            console.error("Error parsing activeCollege:", error);
            return "";
        }
    };
    const collegeName = getCollegeName();

    const getExportData = () => {
        return records.map(rec => ({
            title: rec.title || '-',
            publication_date: rec.publication_date || '-',
            field_of_invention: rec.field_of_invention || '-',
            category: rec.category || '-',
            co_author: Array.isArray(rec.co_author) && rec.co_author.filter(Boolean).length > 0 ? rec.co_author.filter(Boolean).join(', ') : 'Self Only',
            docs: Array.isArray(rec.documents) ? rec.documents.filter(d => d && d.document).map(d => ({ url: d.document, type: d.document_type || 'Document' })) : []
        }));
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(16);
        doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text('Intellectual Property Rights Report', pageWidth / 2, 22, { align: 'center' });

        const data = getExportData();
        const headers = [['Title', 'Publication Date', 'Invention Field', 'Category', 'Co-Authors', 'Documents']];
        const rows = data.map(item => [
            item.title,
            item.publication_date,
            item.field_of_invention,
            item.category,
            item.co_author,
            item.docs.length > 0 ? item.docs.map(d => d.type).join('\n') : '-'
        ]);

        autoTable(doc, {
            head: headers,
            body: rows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { cellPadding: 3 },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const item = getExportData()[data.row.index];
                    if (item?.docs && item.docs.length > 0) {
                        const cell = data.cell;
                        doc.setFillColor(255, 255, 255);
                        doc.rect(cell.x + 0.1, cell.y + 0.1, cell.width - 0.2, cell.height - 0.2, 'F');

                        doc.setTextColor(37, 99, 235);
                        let currentY = cell.y + cell.padding('top') + 3;
                        const lineHeight = doc.internal.getLineHeight() / doc.internal.scaleFactor;

                        item.docs.forEach((docItem) => {
                            const text = docItem.type;
                            const textWidth = doc.getTextWidth(text);
                            const textX = cell.x + cell.padding('left');

                            doc.textWithLink(text, textX, currentY, { url: docItem.url });
                            doc.setDrawColor(37, 99, 235);
                            doc.setLineWidth(0.1);
                            doc.line(textX, currentY + 0.5, textX + textWidth, currentY + 0.5);

                            currentY += lineHeight + 2;
                        });
                        doc.setTextColor(0, 0, 0); // Reset
                    }
                }
            }
        });

        doc.save(`IPR_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        setShowExportDropdown(false);
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('IPR Records');

            const titleRow0 = worksheet.addRow([collegeName]);
            worksheet.mergeCells(`A1:F1`);
            titleRow0.getCell(1).font = { size: 16, bold: true };
            titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

            const titleRow = worksheet.addRow(['Intellectual Property Rights Report']);
            worksheet.mergeCells(`A2:F2`);
            titleRow.getCell(1).font = { size: 14, bold: true };
            titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.addRow([]);

            const headers = ['Title', 'Publication Date', 'Invention Field', 'Category', 'Co-Authors', 'Documents'];
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });

            const data = getExportData();
            data.forEach(item => {
                const docsText = item.docs.length > 0 ? item.docs.map(d => d.type).join('\n') : '-';
                const row = worksheet.addRow([item.title, item.publication_date, item.field_of_invention, item.category, item.co_author, docsText]);

                if (item.docs.length > 0) {
                    const docCell = row.getCell(6);
                    docCell.font = { color: { argb: 'FF2563EB' }, underline: true };
                    docCell.alignment = { wrapText: true, vertical: 'middle' };
                    if (item.docs.length === 1) {
                        docCell.value = { text: item.docs[0].type, hyperlink: item.docs[0].url };
                    }
                }
            });

            worksheet.columns.forEach(col => { col.width = 25; });
            worksheet.getColumn(6).width = 40; // Make documents column wider

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `IPR_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            setShowExportDropdown(false);
        } catch (err) {
            console.error('Export Excel failed:', err);
        }
    };

    const handleExportCSV = () => {
        const data = getExportData();
        const headers = ['Title', 'Publication Date', 'Invention Field', 'Category', 'Co-Authors', 'Documents'];
        let csvContent = `"${collegeName}"\n`;
        csvContent += `"Intellectual Property Rights Report"\n\n`;
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

        data.forEach(item => {
            csvContent += [
                item.title,
                item.publication_date,
                item.field_of_invention,
                item.category,
                item.co_author,
                item.docs.length > 0 ? item.docs.map(d => `${d.type}: ${d.url}`).join(' | ') : '-'
            ].map(val => `"${val}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `IPR_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setShowExportDropdown(false);
    };

    const handleSave = async (formPayload) => {
        try {
            if (!userId) {
                setAlert(<SweetAlert error title="Error" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>User information missing.</SweetAlert>);
                return;
            }
            const payload = {
                ...formPayload,
                user_id: userId,
                teacher_id: teacherId,
                college_id: Number(college_id),
                department_id: departmentId,
                id: editRecord ? editRecord.id : null
            };
            await listOfBooksService.saveIPR(payload);
            setAlert(<SweetAlert success title="Success" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>IPR record {editRecord ? "updated" : "saved"} successfully!</SweetAlert>);
            setShowForm(false);
            setEditRecord(null);
            fetchRecords();
        } catch (err) {
            setAlert(<SweetAlert error title="Error" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>{err?.message || "Failed to save record."}</SweetAlert>);
        }
    };

    const handleDelete = (id) => {
        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                title="Are you sure?"
                onConfirm={async () => {
                    try {
                        await listOfBooksService.deleteIPR(id);
                        setAlert(<SweetAlert success title="Deleted!" onConfirm={() => setAlert(null)}>Record deleted successfully.</SweetAlert>);
                        fetchRecords();
                    } catch {
                        setAlert(<SweetAlert error title="Error" onConfirm={() => setAlert(null)}>Failed to delete record.</SweetAlert>);
                    }
                }}
                onCancel={() => setAlert(null)}
                focusCancelBtn
                confirmBtnCssClass="btn-confirm"
                cancelBtnCssClass="btn-cancel"
            >
                This action cannot be undone!
            </SweetAlert>
        );
    };

    if (userProfile.loading) {
        return <p className="text-gray-500">Loading user profile...</p>;
    }

    return (
        <div className="bg-white rounded-xl border p-5 mt-4 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    Intellectual Property Rights (IPR)
                </h2>
                <div className="flex items-center gap-2">
                    {records.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm transition-colors shadow-sm font-medium"
                            >
                                <Download size={16} />
                                Export
                                <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showExportDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden font-medium">
                                    <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                                        <Download size={14} className="text-red-500" />
                                        Export as PDF
                                    </button>
                                    <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                                        <Download size={14} className="text-green-600" />
                                        Export as Excel
                                    </button>
                                    <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                        <Download size={14} className="text-gray-500" />
                                        Export as CSV
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => { setEditRecord(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                        <Plus size={18} /> Add New IPR
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <span className="text-gray-400 font-medium">Fetching Records...</span>
                </div>
            ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                    <FileText size={40} className="text-gray-200 mb-3" />
                    <p className="text-gray-500 italic font-medium">No IPR records found for this user.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Publication Date</th>
                                <th className="px-4 py-3 text-left">Invention Field</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Co-Authors</th>
                                <th className="px-4 py-3 text-center">Docs</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((rec, idx) => {
                                const docs = Array.isArray(rec.documents) ? rec.documents : [];
                                const coAuthors = Array.isArray(rec.co_author) ? rec.co_author.filter(Boolean) : [];
                                return (
                                    <tr key={rec.id || idx} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="px-4 py-4 leading-relaxed max-w-[200px]">
                                            <div className="font-bold text-gray-900 line-clamp-2" title={rec.title}>{rec.title || "Untitled"}</div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{rec.publication_date || "-"}</td>
                                        <td className="px-4 py-4 text-gray-500 font-medium italic">{rec.field_of_invention || "-"}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                                {rec.category || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {coAuthors.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                                    {coAuthors.map((a, i) => (
                                                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-blue-100">{a}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-gray-400 text-xs italic">Self Only</span>}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {docs.length > 0 ? (
                                                <button onClick={() => setViewingDocs(docs)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100 shadow-sm mx-auto" title="View Documents">
                                                    <Eye size={14} /> {docs.length}
                                                </button>
                                            ) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => { setEditRecord(rec); setShowForm(true); }} className="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all border border-yellow-100 active:scale-95 shadow-sm" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(rec.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 active:scale-95 shadow-sm" title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && <IPRForm onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={handleSave} initialData={editRecord} />}
            {viewingDocs && <DocumentViewer documents={viewingDocs} onClose={() => setViewingDocs(null)} />}
            {alert}
        </div>
    );
};

export default IPR;
