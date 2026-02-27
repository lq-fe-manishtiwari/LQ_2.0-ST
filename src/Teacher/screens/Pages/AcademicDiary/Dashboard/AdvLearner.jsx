import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BookOpen,
  Edit,
  Save,
  XCircle,
  Upload,
  Plus,
  Trash2,
  FileText,
  UserX,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Download,
  ChevronDown
} from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import ExcelUploadModal from "../Component/ExcelUploadModal";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import { teacherProfileService } from "../Services/academicDiary.service";

export default function AdvLearner() {
  const { filters } = useOutletContext();
  const userProfile = useUserProfile();

  /* ================= STATE FOR TEACHER ID ================= */
  const [teacherId, setTeacherId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ================= TABLE STATES ================= */
  const [columns, setColumns] = useState([
    { key: "date", label: "Date" },
    { key: "class", label: "Class" },
    { key: "topic", label: "Topic" },
    { key: "no_of_students_present", label: "No. of Students Present" },
    { key: "hod_signature_with_date", label: "Sign of HOD with Date" }
  ]);
  const [rows, setRows] = useState([]);
  const [backupRows, setBackupRows] = useState([]);

  /* ================= ADVANCE LEARNER DATA ================= */
  const [advanceLearnerId, setAdvanceLearnerId] = useState(null);
  const [existingData, setExistingData] = useState(null);

  /* ================= UI STATES ================= */
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isExcelMode, setIsExcelMode] = useState(false);

  /* ================= SUPPORTING DOCS ================= */
  const [supportDocs, setSupportDocs] = useState([]);
  const [docTitle, setDocTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ================= MOBILE STATES ================= */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportMenuRefs = React.useRef([]);

  // Helper to add ref to the array
  const setExportRef = (index) => (el) => {
    exportMenuRefs.current[index] = el;
  };

  /* ================= ALERT STATE ================= */
  const [alertConfig, setAlertConfig] = useState(null);

  /* ================= HELPER FUNCTIONS ================= */
  const showAlert = (title, message, type = "success", onConfirm = null, showCancel = false, confirmBtnText = "OK", cancelBtnText = "Cancel") => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig(null)),
      showCancel,
      confirmBtnText,
      cancelBtnText
    });
  };

  /* ================= FETCH TEACHER ID FROM PROFILE ================= */
  useEffect(() => {
    const fetchTeacherIdFromProfile = async () => {
      try {
        setIsLoadingProfile(true);

        if (userProfile && userProfile.getTeacherId) {
          const profileTeacherId = userProfile.getTeacherId();
          const profileUserId = userProfile.getUserId ? userProfile.getUserId() : null;

          setTeacherId(profileTeacherId);
          setUserId(profileUserId);
        } else {
          console.warn("UserProfile context not available or getTeacherId method missing");
        }
      } catch (error) {
        console.error("Error fetching teacher id from profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchTeacherIdFromProfile();
  }, [userProfile]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = exportMenuRefs.current.some(ref => ref && ref.contains(event.target));
      if (!isClickInside) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    if (teacherId && userId) {
      loadTeacherData();
    }
  }, [teacherId, userId]);

  /* ================= DATA MAPPING FUNCTIONS ================= */

  const mapAdvanceLearnerTableToRows = (advanceLearnerTable) => {
    if (!advanceLearnerTable || !Array.isArray(advanceLearnerTable) || advanceLearnerTable.length === 0) {
      return [];
    }

    const firstRow = advanceLearnerTable[0];
    const columnKeys = Object.keys(firstRow);

    // If we have custom columns from existing data, use those
    if (columnKeys.length > 0) {
      const mappedColumns = columnKeys.map(key => ({
        key: key,
        label: key
      }));
      setColumns(mappedColumns);
    }

    return advanceLearnerTable;
  };

  const mapAdvanceLearnerDocumentToSupportDocs = (advanceLearnerDocument, teacherId, userId) => {
    if (!advanceLearnerDocument || !Array.isArray(advanceLearnerDocument)) {
      return [];
    }

    return advanceLearnerDocument.map(doc => ({
      title: doc["Document Title"] || doc.title || "",
      fileName: doc["Document Name"] || doc.fileName || "",
      url: doc["Document URL"] || doc.url || "",
      teacherId: teacherId,
      userId: userId,
      uploadDate: doc["Upload Date"] || doc.uploadDate || new Date().toLocaleDateString(),
      metadata: {
        documentType: doc["Document Type"] || "advance_learner"
      },
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || ""
    }));
  };

  const mapRowsToAdvanceLearnerTable = (rows) => {
    return rows.map(row => {
      const mappedRow = {};
      Object.keys(row).forEach(key => {
        mappedRow[key] = row[key] || "";
      });
      return mappedRow;
    });
  };

  const mapSupportDocsToAdvanceLearnerDocument = (supportDocs) => {
    return supportDocs.map(doc => ({
      "Document Title": doc.title || "",
      "Document Name": doc.fileName || "",
      "Document URL": doc.url || "",
      "Document Type": doc.metadata?.documentType || "advance_learner",
      "Upload Date": doc.uploadDate || new Date().toLocaleDateString(),
      "Teacher ID": doc.teacherId || "",
      "User ID": doc.userId || ""
    }));
  };

  /* ================= LOAD TEACHER DATA ================= */
  const loadTeacherData = async () => {
    try {
      setIsLoadingData(true);

      if (userId) {
        const response = await teacherProfileService.getAdvancedLearnersByUserId(userId, 0, 10);

        if (response && response.content && response.content.length > 0) {
          const recordsWithData = response.content.filter(record =>
            record.advance_learner_table &&
            Array.isArray(record.advance_learner_table) &&
            record.advance_learner_table.length > 0
          );

          if (recordsWithData.length > 0) {
            const latestData = recordsWithData[0];
            setExistingData(latestData);
            setAdvanceLearnerId(latestData.advance_learner_id);

            const mappedRows = mapAdvanceLearnerTableToRows(latestData.advance_learner_table);
            setRows(mappedRows);

            const mappedDocs = mapAdvanceLearnerDocumentToSupportDocs(
              latestData.advance_learner_document,
              teacherId,
              userId
            );
            setSupportDocs(mappedDocs);
          } else {
            // No existing data, keep default columns and empty rows
            setRows([]);
            setSupportDocs([]);
          }
        } else {
          setRows([]);
          setSupportDocs([]);
        }
      }

    } catch (error) {
      console.error("Error loading teacher data:", error);
      setRows([]);
      setSupportDocs([]);
      showAlert("Error", "Failed to load advance learner data. Please try again.", "danger");
    } finally {
      setIsLoadingData(false);
    }
  };

  /* ================= TABLE HANDLERS ================= */

  const handleExcelConfirm = (excelData) => {
    if (!excelData.length) {
      showAlert("Warning", "No data found in the Excel file.", "warning");
      return;
    }

    const dynamicColumns = Object.keys(excelData[0]).map((key) => ({
      key,
      label: key,
    }));

    setColumns(dynamicColumns);
    setRows(excelData);
    setIsExcelMode(true);
    setShowUploadModal(false);
    showAlert("Success", "Excel data loaded successfully!", "success");
  };

  const handleAddRow = () => {
    // Create an empty row with all column keys
    const emptyRow = {};
    columns.forEach((c) => (emptyRow[c.key] = ""));
    setRows((prev) => [...prev, emptyRow]);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCellChange = (rowIndex, key, value) => {
    const updated = [...rows];
    updated[rowIndex][key] = value;
    setRows(updated);
  };

  /* ================= SUPPORTING DOC UPLOAD ================= */

  const handleSupportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !docTitle) {
      showAlert("Warning", "Please enter a document title and select a file", "warning");
      return;
    }

    try {
      setUploading(true);


      const metadata = {
        teacherId: teacherId,
        userId: userId,
        documentType: 'advance_learner',
        uploadDate: new Date().toISOString(),
        userType: userProfile?.getUserType ? userProfile.getUserType() : null,
        title: docTitle
      };


      const fileUrl = await teacherProfileService.uploadFileToS3(file, metadata);


      const newDoc = {
        title: docTitle,
        fileName: file.name,
        url: fileUrl,
        teacherId: teacherId,
        userId: userId,
        uploadDate: new Date().toLocaleDateString(),
        metadata: metadata,
        fileSize: file.size,
        mimeType: file.type
      };

      // supportDocs
      setSupportDocs((prev) => [...prev, newDoc]);

      setDocTitle("");
      showAlert("Success", "Document uploaded successfully!", "success");

    } catch (err) {
      console.error("Upload failed:", err);
      showAlert("Error", `Upload failed: ${err.message}`, "danger");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ================= SAVE TABLE DATA ================= */

  const handleSaveData = async () => {
    if (!teacherId || !userId) {
      showAlert("Error", "Teacher ID or User ID not available. Please refresh the page.", "danger");
      return;
    }

    if (rows.length === 0) {
      showAlert("Warning", "Please add at least one row to save", "warning");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        user_id: parseInt(userId),
        advance_learner_table: mapRowsToAdvanceLearnerTable(rows),
        advance_learner_document: mapSupportDocsToAdvanceLearnerDocument(supportDocs),
        metadata: {
          saved_by: userProfile?.getFullName ? userProfile.getFullName() : 'Unknown',
          saved_by_id: userId,
          saved_at: new Date().toISOString(),
          total_rows: rows.length,
          total_documents: supportDocs.length,
          is_excel_mode: isExcelMode,
          teacher_id: teacherId,
          column_structure: columns.map(c => ({ key: c.key, label: c.label }))
        }
      };

      let response;

      if (advanceLearnerId) {
        response = await teacherProfileService.updateAdvancedLearner(
          advanceLearnerId,
          userId,
          payload
        );
        showAlert("Success", "Data updated successfully!", "success");
      } else {
        response = await teacherProfileService.saveAdvancedLearner(payload);

        if (response && response.advance_learner_id) {
          setAdvanceLearnerId(response.advance_learner_id);
        }
        if (response) {
          setExistingData(response);
        }

        showAlert("Success", "Data saved successfully!", "success");
      }

      setEditMode(false);

    } catch (error) {
      console.error("Error saving data:", error);
      showAlert("Error", `Failed to save data: ${error.message}`, "danger");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= DELETE SUPPORT DOC ================= */

  const handleDeleteDoc = (index) => {
    setAlertConfig({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this document?",
      type: "warning",
      showCancel: true,
      confirmBtnText: "Yes, delete it!",
      cancelBtnText: "Cancel",
      onConfirm: () => {
        try {
          setSupportDocs((prev) => prev.filter((_, i) => i !== index));
          showAlert("Success", "Document deleted successfully!", "success");
        } catch (error) {
          console.error("Error deleting document:", error);
          showAlert("Error", "Failed to delete document", "danger");
        }
      },
      onCancel: () => setAlertConfig(null)
    });
  };

  /* ================= DELETE ADVANCE LEARNER RECORD ================= */

  const handleDeleteRecord = () => {
    if (!advanceLearnerId) return;

    setAlertConfig({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this advance learner record?",
      type: "warning",
      showCancel: true,
      confirmBtnText: "Yes, delete it!",
      cancelBtnText: "Cancel",
      onConfirm: async () => {
        try {
          await teacherProfileService.softDeleteAdvancedLearner(advanceLearnerId);

          setRows([]);
          setSupportDocs([]);
          setAdvanceLearnerId(null);
          setExistingData(null);
          setIsExcelMode(false);

          // Reset to default columns
          setColumns([
            { key: "date", label: "Date" },
            { key: "class", label: "Class" },
            { key: "topic", label: "Topic" },
            { key: "no_of_students_present", label: "No. of Students Present" },
            { key: "hod_signature_with_date", label: "Sign of HOD with Date" }
          ]);

          showAlert("Success", "Record deleted successfully!", "success");
          setEditMode(false);
        } catch (error) {
          console.error("Error deleting record:", error);
          showAlert("Error", `Failed to delete record: ${error.message}`, "danger");
        }
      },
      onCancel: () => setAlertConfig(null)
    });
  };

  /* ================= EXPORT HANDLERS ================= */

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

  const getExportData = () => {
    return rows.map(row => {
      const exportRow = {};
      columns.forEach(col => {
        exportRow[col.label] = row[col.key] || '-';
      });
      return exportRow;
    });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const collegeName = getCollegeName();
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(16);
      doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Advance Learners Report', pageWidth / 2, 22, { align: 'center' });

      // Add Supporting Documents Section
      let currentY = 30;
      if (supportDocs && supportDocs.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Supporting Documents:', 14, currentY);
        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        supportDocs.forEach((docItem, index) => {
          const docText = `${index + 1}. ${docItem.title || 'Untitled'}: ${docItem.url || '-'}`;
          // Split text if it is too long for the page width
          const splitText = doc.splitTextToSize(docText, pageWidth - 28);
          doc.text(splitText, 14, currentY);
          currentY += (splitText.length * 5);
        });
        currentY += 5;
      }

      const data = rows;
      if (data.length === 0) {
        showAlert("Warning", "No data to export", "warning");
        return;
      }

      if (columns.length === 0) {
        showAlert("Error", "No columns defined for export", "danger");
        return;
      }

      const headers = [columns.map(c => c.label)];
      const body = data.map(item => columns.map(c => item[c.key] || '-'));

      autoTable(doc, {
        head: headers,
        body: body,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.save(`Advance_Learners_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export PDF failed:', err);
      showAlert("Error", "Failed to generate PDF report", "danger");
    }
  };

  const handleExportExcel = async () => {
    try {
      if (columns.length === 0) {
        showAlert("Error", "No columns defined for export", "danger");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Advance Learners');
      const collegeName = getCollegeName();

      const titleRow0 = worksheet.addRow([collegeName]);
      worksheet.mergeCells(1, 1, 1, columns.length);
      titleRow0.getCell(1).font = { size: 16, bold: true };
      titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const titleRow = worksheet.addRow(['Advance Learners Report']);
      worksheet.mergeCells(2, 1, 2, columns.length);
      titleRow.getCell(1).font = { size: 14, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.addRow([]);

      // Add Supporting Documents Section
      if (supportDocs && supportDocs.length > 0) {
        const supportHeaderRow = worksheet.addRow(['Supporting Documents:']);
        supportHeaderRow.getCell(1).font = { bold: true };
        supportDocs.forEach((docItem, index) => {
          const rowText = `${index + 1}. ${docItem.title || 'Untitled'}`;
          const row = worksheet.addRow([rowText]);
          if (docItem.url && docItem.url !== '#') {
            row.getCell(1).value = {
              text: rowText,
              hyperlink: docItem.url,
              tooltip: docItem.url
            };
            row.getCell(1).font = { color: { argb: 'FF0000FF' }, underline: true };
          }
        });
        worksheet.addRow([]);
      }

      const headers = columns.map(c => c.label);
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      rows.forEach(item => {
        const rowValues = columns.map(c => item[c.key] || '-');
        worksheet.addRow(rowValues);
      });

      worksheet.columns.forEach(col => { col.width = 25; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Advance_Learners_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export Excel failed:', err);
      showAlert("Error", "Failed to generate Excel report", "danger");
    }
  };

  const handleExportCSV = () => {
    try {
      console.log("Starting CSV Export for Advance Learners...");
      if (!rows || rows.length === 0) {
        showAlert("Warning", "No data to export", "warning");
        return;
      }
      if (!columns || columns.length === 0) {
        showAlert("Error", "No columns defined for export. Try reloading the page.", "danger");
        return;
      }

      const headers = columns.map(c => c.label);
      const collegeName = getCollegeName();

      let csvContent = `"${collegeName}"\n`;
      csvContent += `"Advance Learners Report"\n\n`;

      // Add Supporting Documents Section
      if (supportDocs && supportDocs.length > 0) {
        csvContent += `"Supporting Documents:"\n`;
        supportDocs.forEach((docItem, index) => {
          const title = docItem.title || 'Untitled';
          const url = docItem.url || '-';
          csvContent += `"${index + 1}. ${title}: ${url}"\n`;
        });
        csvContent += `\n`;
      }

      csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

      rows.forEach(item => {
        csvContent += columns.map(c => {
          const v = item[c.key];
          return (v === null || v === undefined) ? '-' : String(v);
        }).map(val => `"${val}"`).join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = `Advance_Learners_${new Date().toISOString().split('T')[0]}.csv`;
      link.download = fileName;
      link.click();
      console.log("CSV Export successful:", fileName);
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export CSV failed:', err);
      showAlert("Error", "Failed to generate CSV report: " + (err.message || "Unknown error"), "danger");
    }
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startRow = currentPage * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  const currentRows = rows.slice(startRow, endRow);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  /* ================= RENDER FUNCTIONS ================= */

  const renderTableHeader = () => (
    <thead className="table-header bg-gray-50">
      <tr>
        <th className="p-2 md:p-3 text-left font-semibold text-gray-700 text-xs md:text-sm">
          S.No.
        </th>
        {columns.map((c) => (
          <th key={c.key} className="p-2 md:p-3 text-left font-semibold text-gray-700 text-xs md:text-sm truncate">
            {c.label}
          </th>
        ))}
        {editMode && (
          <th className="p-2 md:p-3 text-left font-semibold text-gray-700 text-xs md:text-sm">
            Action
          </th>
        )}
      </tr>
    </thead>
  );

  const renderTableRow = (row, index) => (
    <tr key={index} className="border-t hover:bg-gray-50">
      <td className="p-2 md:p-3 text-xs md:text-sm">
        {startRow + index + 1}
      </td>

      {columns.map((c) => (
        <td key={c.key} className="p-2 md:p-3">
          {editMode ? (
            <input
              value={row[c.key] || ""}
              onChange={(e) => handleCellChange(startRow + index, c.key, e.target.value)}
              className="border px-2 py-1 md:px-3 md:py-2 w-full rounded focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
              placeholder={`Enter ${c.label}`}
            />
          ) : (
            <div className="min-h-[30px] md:min-h-[40px] flex items-center text-xs md:text-sm">
              {row[c.key] || <span className="text-gray-400">-</span>}
            </div>
          )}
        </td>
      ))}

      {editMode && (
        <td className="p-2 md:p-3">
          <button
            onClick={() => handleDeleteRow(startRow + index)}
            className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded"
            title="Delete row"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </td>
      )}
    </tr>
  );

  const renderMobileTableRow = (row, index) => (
    <div key={index} className="border rounded-lg mb-3 p-3 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm">Row {startRow + index + 1}</span>
        {editMode && (
          <button
            onClick={() => handleDeleteRow(startRow + index)}
            className="p-1 text-red-600"
            title="Delete row"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {columns.map((c) => (
          <div key={c.key} className="border-b pb-2 last:border-0">
            <div className="text-xs text-gray-500 font-medium mb-1">{c.label}</div>
            {editMode ? (
              <input
                value={row[c.key] || ""}
                onChange={(e) => handleCellChange(startRow + index, c.key, e.target.value)}
                className="w-full border px-2 py-1 rounded text-sm"
                placeholder={`Enter ${c.label}`}
              />
            ) : (
              <div className="text-sm">
                {row[c.key] || <span className="text-gray-400">-</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-gray-600">Show</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(0);
          }}
          className="border rounded px-2 py-1 text-xs md:text-sm"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span className="text-xs md:text-sm text-gray-600">entries</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-gray-600">
          Showing {startRow + 1} to {Math.min(endRow, rows.length)} of {rows.length} entries
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`p-1 md:p-2 rounded ${currentPage === 0
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <span className="px-2 text-xs md:text-sm text-gray-700">
          Page {currentPage + 1} of {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          className={`p-1 md:p-2 rounded ${currentPage >= totalPages - 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 mt-4">Loading teacher information...</span>
      </div>
    );
  }

  // Loading data state
  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 mt-4">Loading advance learner data...</span>
      </div>
    );
  }

  /* ================= MAIN RENDER ================= */
  return (
    <>
      {/* SweetAlert Component */}
      {alertConfig && (
        <SweetAlert
          success={alertConfig.type === "success"}
          warning={alertConfig.type === "warning"}
          danger={alertConfig.type === "danger"}
          info={alertConfig.type === "info"}
          title={alertConfig.title}
          showCancel={alertConfig.showCancel}
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          confirmBtnText={alertConfig.confirmBtnText}
          cancelBtnText={alertConfig.cancelBtnText}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel || (() => setAlertConfig(null))}
        >
          {alertConfig.message}
        </SweetAlert>
      )}

      {/* ================= CASE 1: TEACHER ================= */}
      {teacherId && userId ? (
        <div className="space-y-4 md:space-y-6 p-3 md:p-4">

          {/* ================= MOBILE HEADER ================= */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-2 font-bold text-base">
                <BookOpen className="w-4 h-4" />
                Advance Learners
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
                <div className="space-y-3">
                  {/* <button
                    disabled={editMode}
                    onClick={() => setShowUploadModal(true)}
                    className={`w-full px-4 py-2 rounded-md text-white flex items-center justify-center gap-2
                      ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Excel
                  </button> */}

                  {!editMode && (
                    <button
                      onClick={() => {
                        setBackupRows(JSON.parse(JSON.stringify(rows)));
                        setEditMode(true);
                      }}
                      className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 ${"bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                    >
                      <Edit className="w-4 h-4" />
                      'Add/Edit table'
                    </button>
                  )}

                  {!editMode && rows.length > 0 && (
                    <div className="relative" ref={setExportRef(0)}>
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Export
                        <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showExportDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg transition-colors border-b border-gray-100">
                            <Download size={14} className="text-red-500" />
                            Export as PDF
                          </button>
                          <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                            <Download size={14} className="text-green-600" />
                            Export as Excel
                          </button>
                          <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg transition-colors">
                            <Download size={14} className="text-gray-500" />
                            Export as CSV
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {existingData && !editMode && (
                    <button
                      onClick={handleDeleteRecord}
                      className="w-full px-4 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Record
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4">
              {/* <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Teacher ID: {teacherId}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  User ID: {userId}
                </span>
              </div> */}
            </div>
          </div>

          {/* ================= DESKTOP HEADER ================= */}
          <div className="hidden lg:flex justify-between items-center">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                Details of Classes conducted for Advance Learners
              </h2>
              {/* <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Teacher ID: </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {teacherId}
                </span>
                <span className="font-medium ml-4">User ID: </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {userId}
                </span>
                {existingData && existingData.metadata?.saved_at && (
                  <span className="ml-4 text-xs text-gray-500">
                    • Last saved: {new Date(existingData.metadata.saved_at).toLocaleDateString()}
                  </span>
                )}
              </div> */}
            </div>

            <div className="flex gap-3">
              {/* <button
                disabled={editMode}
                onClick={() => setShowUploadModal(true)}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2 text-sm
                  ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Excel</span>
              </button> */}

              {!editMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBackupRows(JSON.parse(JSON.stringify(rows)));
                      setEditMode(true);
                    }}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm ${"bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      'Add/Edit table'
                    </span>
                  </button>

                  {!editMode && rows.length > 0 && (
                    <div className="relative" ref={setExportRef(1)}>
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm shadow-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export
                        <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showExportDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg transition-colors border-b border-gray-100">
                            <Download size={14} className="text-red-500" />
                            Export as PDF
                          </button>
                          <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                            <Download size={14} className="text-green-600" />
                            Export as Excel
                          </button>
                          <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg transition-colors">
                            <Download size={14} className="text-gray-500" />
                            Export as CSV
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {existingData && (
                    <button
                      onClick={handleDeleteRecord}
                      className="px-4 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete Record</span>
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* ================= EXISTING DATA INDICATOR ================= */}



          {/* ================= TABLE SECTION ================= */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  {renderTableHeader()}
                  <tbody>
                    {currentRows.length === 0 && !editMode ? (
                      <tr>
                        <td colSpan={columns.length + 2} className="p-8 text-center text-gray-500">
                          No data available. Click "Create Record" to add rows or upload an Excel file.
                        </td>
                      </tr>
                    ) : currentRows.length === 0 && editMode ? (
                      <tr>
                        <td colSpan={columns.length + 2} className="p-8 text-center text-gray-500">
                          No data available. Click "Add Row" button below to add data.
                        </td>
                      </tr>
                    ) : (
                      currentRows.map((row, index) => renderTableRow(row, index))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Table Cards */}
              <div className="md:hidden p-3">
                {currentRows.length === 0 && !editMode ? (
                  <div className="p-8 text-center text-gray-500">
                    No data available. Click "Create Record" to add rows or upload an Excel file.
                  </div>
                ) : currentRows.length === 0 && editMode ? (
                  <div className="p-8 text-center text-gray-500">
                    No data available. Click "Add Row" button below to add data.
                  </div>
                ) : (
                  currentRows.map((row, index) => renderMobileTableRow(row, index))
                )}
              </div>
            </div>
          </div>

          {/* ================= PAGINATION ================= */}
          {rows.length > 0 && renderPagination()}

          {/* ================= ADD ROW BUTTON ================= */}
          {editMode && (
            <button
              onClick={handleAddRow}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          )}


          {/* ================= SAVE / CANCEL BUTTONS ================= */}
          {editMode && (
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setRows(backupRows);
                  setEditMode(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>

              <button
                onClick={handleSaveData}
                disabled={isSaving || rows.length === 0}
                className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 text-sm ${isSaving || rows.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= SUPPORTING DOCS SECTION ================= */}
          <div className="border rounded-lg p-3 md:p-4 space-y-3 md:space-y-4 bg-white mt-6">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-base md:text-lg">
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Supporting Documents</span>
              </h4>
              <span className="text-xs md:text-sm text-gray-500">
                {supportDocs.length} document(s)
              </span>
            </div>

            {editMode && (
              <div className="flex flex-col gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                {/* Document Title */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Document Title
                  </label>
                  <input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Enter document title"
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* File + Upload button – stack on mobile */}
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Choose File
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      id="adv-learner-support-doc-upload-bottom"
                      onChange={handleSupportUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
                    />

                    <button
                      onClick={() => document.getElementById('adv-learner-support-doc-upload-bottom').click()}
                      disabled={uploading || !docTitle}
                      className={`px-5 py-2 rounded text-sm font-medium min-w-[100px] text-center
            ${uploading || !docTitle
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {supportDocs.length > 0 ? (
              <div className="space-y-2">
                {supportDocs.map((d, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border rounded hover:bg-gray-50 gap-2">
                    <div className="flex-1">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-start sm:items-center gap-2 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                        <span className="break-words text-blue-600">
                          {d.title} ({d.fileName})
                        </span>
                      </a>
                      <div className="text-xs text-blue-500 mt-1">
                        Uploaded on {d.uploadDate}
                        {d.fileSize ? ` • Size: ${Math.round(d.fileSize / 1024)} KB` : ''}
                      </div>
                    </div>
                    {editMode && (
                      <button
                        onClick={() => handleDeleteDoc(i)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded self-end sm:self-center"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 md:p-8 text-gray-500 text-sm">
                No supporting documents uploaded yet.
              </div>
            )}
          </div>

          {/* ================= EXCEL UPLOAD MODAL ================= */}
          {showUploadModal && (
            <ExcelUploadModal
              title="Upload Advance Learners Format"
              onClose={() => setShowUploadModal(false)}
              onConfirm={handleExcelConfirm}
            />
          )}
        </div>
      ) : (
        /* ================= CASE 2: TEACHER ID NOT FOUND ================= */
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-gray-500 p-4">
          <UserX className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mb-4" />
          <p className="text-base md:text-lg font-semibold text-gray-600">
            Teacher ID or User ID Not Found
          </p>
          <p className="text-xs md:text-sm mt-1 max-w-sm">
            Could not retrieve Teacher ID or User ID from your user profile. Please contact support.
          </p>
          {userProfile && userProfile.getFullName && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg max-w-sm">
              <p className="text-xs md:text-sm text-blue-700">
                Current User: {userProfile.getFullName()}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}