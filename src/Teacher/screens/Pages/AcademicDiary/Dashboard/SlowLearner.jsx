import React, { useState, useEffect } from "react";
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
import { teacherProfileService } from "../Services/academicDiary.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

export default function SlowLearner() {
  const userProfile = useUserProfile();

  /* ================= STATE FOR TEACHER ID ================= */
  const [teacherId, setTeacherId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  /* ================= TABLE STATES ================= */
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [backupRows, setBackupRows] = useState([]);
  const [slowLearnerData, setSlowLearnerData] = useState([]);
  const [currentSlowLearnerId, setCurrentSlowLearnerId] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  /* ================= UI STATES ================= */
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isExcelMode, setIsExcelMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportMenuRefs = React.useRef([]);

  // Helper to add ref to the array
  const setExportRef = (index) => (el) => {
    exportMenuRefs.current[index] = el;
  };

  /* ================= SUPPORTING DOCS ================= */
  const [supportDocs, setSupportDocs] = useState([]);
  const [docTitle, setDocTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ================= ALERT STATE ================= */
  const [alertConfig, setAlertConfig] = useState(null);

  /* ================= SCREEN SIZE STATE ================= */
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  /* ================= DETECT SCREEN SIZE ================= */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,    // sm breakpoint
        isTablet: width >= 640 && width < 1024, // sm to lg
        isDesktop: width >= 1024   // lg and above
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  /* ================= SHOW ALERT HELPER ================= */
  const showAlert = (title, message, type = "success") => {
    setAlertConfig({
      title,
      message,
      type
    });
  };

  /* ================= FETCH TEACHER ID FROM PROFILE ================= */
  useEffect(() => {
    const fetchTeacherIdFromProfile = async () => {
      try {
        setIsLoadingProfile(true);

        if (userProfile) {
          const profileTeacherId = userProfile.getTeacherId ? userProfile.getTeacherId() : null;
          console.log("Profile Teacher ID:", profileTeacherId);
          setTeacherId(profileTeacherId);

          const profileUserId = userProfile.getUserId ? userProfile.getUserId() : null;
          console.log("User ID:", profileUserId);
          setUserId(profileUserId);
        } else {
          console.warn("UserProfile context not available");
        }
      } catch (error) {
        console.error("Error fetching teacher id from profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchTeacherIdFromProfile();
  }, [userProfile]);

  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    if (userId) {
      loadTeacherData();
    }
  }, [userId, page]);

  const loadTeacherData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading data for User ID:", userId);

      if (userId) {
        const response = await teacherProfileService.getSlowLearnersByUserId(userId, page, size);
        console.log("API Response for Slow Learners:", response);

        if (response && response.content && response.content.length > 0) {
          setSlowLearnerData(response.content);
          setTotalItems(response.total_elements || response.totalElements || response.content.length);

          const firstRecordWithData = response.content.find(record =>
            record.slow_learner_table && record.slow_learner_table.length > 0
          ) || response.content[0];

          if (firstRecordWithData) {
            setCurrentSlowLearnerId(firstRecordWithData.slow_learner_id);

            if (firstRecordWithData.slow_learner_table && firstRecordWithData.slow_learner_table.length > 0) {
              const tableRows = firstRecordWithData.slow_learner_table;
              console.log("Table rows from API:", tableRows);

              setRows(tableRows);

              if (tableRows.length > 0) {
                const firstRow = tableRows[0];
                console.log("First row keys:", Object.keys(firstRow));

                const generatedColumns = Object.keys(firstRow).map((key) => {
                  let label = key;

                  if (label.endsWith('*')) {
                    label = label.replace('*', '');
                  }

                  label = label.replace(/_/g, ' ');
                  label = label.replace(/\b\w/g, l => l.toUpperCase());

                  return {
                    key: key,
                    label: label,
                    hasAsterisk: key.endsWith('*')
                  };
                });

                console.log("Generated columns:", generatedColumns);
                setColumns(generatedColumns);
              } else {
                setColumns(getDefaultColumns());
              }
            } else {
              console.log("No table data found in record");
              setColumns(getDefaultColumns());
              setRows([]);
            }

            if (firstRecordWithData.slow_learner_document && firstRecordWithData.slow_learner_document.length > 0) {
              const transformedDocs = firstRecordWithData.slow_learner_document.map(doc => ({
                title: doc.title || doc.document_name || 'Document',
                fileName: doc.document_name || doc.file_name || 'file',
                url: doc.document_url || doc.url || '#',
                teacherId: teacherId,
                uploadDate: doc.upload_date || new Date().toLocaleDateString(),
                documentType: doc.document_type || doc.type || 'Unknown'
              }));
              setSupportDocs(transformedDocs);
            } else {
              setSupportDocs([]);
            }
          } else {
            console.log("No records found for user");
            setColumns(getDefaultColumns());
            setRows([]);
            setSupportDocs([]);
            setCurrentSlowLearnerId(null);
            setSlowLearnerData([]);
          }
        } else {
          console.log("No data in response.content");
          setColumns(getDefaultColumns());
          setRows([]);
          setSupportDocs([]);
          setCurrentSlowLearnerId(null);
          setSlowLearnerData([]);
        }
      }

    } catch (error) {
      console.error("Error loading teacher data:", error);
      setColumns(getDefaultColumns());
      setRows([]);
      setSupportDocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for default columns
  const getDefaultColumns = () => [
    { key: "date", label: "Date", hasAsterisk: false },
    { key: "class", label: "Class", hasAsterisk: false },
    { key: "topic", label: "Topic", hasAsterisk: false },
    { key: "students", label: "No. of Students Present", hasAsterisk: false },
    { key: "hod", label: "Sign of HOD with Date", hasAsterisk: false },
  ];

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
      console.log("Starting PDF Export for Slow Learners...");
      if (!rows || rows.length === 0) {
        showAlert("Warning", "No data to export", "warning");
        return;
      }
      if (!columns || columns.length === 0) {
        showAlert("Error", "No columns defined for export. Try reloading the page.", "danger");
        return;
      }

      const doc = new jsPDF();
      const collegeName = getCollegeName();
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(16);
      doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Slow Learners Report', pageWidth / 2, 22, { align: 'center' });

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
          const title = docItem.title || 'Untitled';
          const url = docItem.url || '-';
          const docText = `${index + 1}. ${title}: ${url}`;
          const splitText = doc.splitTextToSize(docText, pageWidth - 28);
          doc.text(splitText, 14, currentY);
          currentY += (splitText.length * 5);
        });
        currentY += 5;
      }

      const headers = [columns.map(c => c.label)];
      const body = rows.map(row => columns.map(col => {
        const val = row[col.key];
        return (val === null || val === undefined) ? '-' : String(val);
      }));

      autoTable(doc, {
        head: headers,
        body: body,
        startY: currentY,
        theme: 'grid',
        styles: { fontSize: 8, overflow: 'linebreak' },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
      });

      const fileName = `Slow_Learners_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log("PDF Export successful:", fileName);
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export PDF failed:', err);
      showAlert("Error", "Failed to generate PDF report: " + (err.message || "Unknown error"), "danger");
    }
  };

  const handleExportExcel = async () => {
    try {
      console.log("Starting Excel Export for Slow Learners...");
      if (!rows || rows.length === 0) {
        showAlert("Warning", "No data to export", "warning");
        return;
      }
      if (!columns || columns.length === 0) {
        showAlert("Error", "No columns defined for export. Try reloading the page.", "danger");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Slow Learners');
      const collegeName = getCollegeName();

      const titleRow0 = worksheet.addRow([collegeName]);
      worksheet.mergeCells(1, 1, 1, columns.length > 1 ? columns.length : 2);
      titleRow0.getCell(1).font = { size: 16, bold: true };
      titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const titleRow = worksheet.addRow(['Slow Learners Report']);
      worksheet.mergeCells(2, 1, 2, columns.length > 1 ? columns.length : 2);
      titleRow.getCell(1).font = { size: 14, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.addRow([]);

      // Add Supporting Documents Section
      if (supportDocs && supportDocs.length > 0) {
        const supportHeaderRow = worksheet.addRow(['Supporting Documents:']);
        supportHeaderRow.getCell(1).font = { bold: true };
        supportDocs.forEach((docItem, index) => {
          const title = docItem.title || 'Untitled';
          const url = docItem.url || '#';
          const rowText = `${index + 1}. ${title}`;
          const row = worksheet.addRow([rowText]);
          if (url && url !== '#') {
            row.getCell(1).value = {
              text: rowText,
              hyperlink: url,
              tooltip: url
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
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      rows.forEach(item => {
        const rowValues = columns.map(c => {
          const v = item[c.key];
          return (v === null || v === undefined) ? '-' : String(v);
        });
        worksheet.addRow(rowValues);
      });

      worksheet.columns.forEach(col => {
        col.width = 25;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = `Slow_Learners_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      link.click();
      console.log("Excel Export successful:", fileName);
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export Excel failed:', err);
      showAlert("Error", "Failed to generate Excel report: " + (err.message || "Unknown error"), "danger");
    }
  };

  const handleExportCSV = () => {
    try {
      console.log("Starting CSV Export for Slow Learners...");
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
      csvContent += `"Slow Learners Report"\n\n`;

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
      const fileName = `Slow_Learners_${new Date().toISOString().split('T')[0]}.csv`;
      link.download = fileName;
      link.click();
      console.log("CSV Export successful:", fileName);
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export CSV failed:', err);
      showAlert("Error", "Failed to generate CSV report: " + (err.message || "Unknown error"), "danger");
    }
  };

  /* ================= TABLE HANDLERS ================= */

  const handleExcelConfirm = (excelData) => {
    if (!excelData.length) return;

    const dynamicColumns = Object.keys(excelData[0]).map((key) => {
      let label = key;
      if (label.endsWith('*')) {
        label = label.replace('*', '');
      }
      label = label.replace(/_/g, ' ');
      label = label.replace(/\b\w/g, l => l.toUpperCase());

      return {
        key: key,
        label: label,
        hasAsterisk: key.endsWith('*')
      };
    });

    setColumns(dynamicColumns);
    setRows(excelData);
    setIsExcelMode(true);
    setShowUploadModal(false);
  };

  const handleAddRow = () => {
    if (columns.length === 0) {
      showAlert("Warning", "Please set columns first by uploading Excel or wait for data to load.", "warning");
      return;
    }

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
      showAlert("Warning", "Please provide both document title and select a file.", "warning");
      return;
    }

    try {
      setUploading(true);

      const fileUrl = await teacherProfileService.uploadFileToS3(file);

      const newDoc = {
        title: docTitle,
        document_name: file.name,
        document_url: fileUrl,
        document_type: file.type || 'Unknown',
        upload_date: new Date().toISOString(),
        teacher_id: teacherId,
        user_id: userId
      };

      const newSupportDoc = {
        title: docTitle,
        fileName: file.name,
        url: fileUrl,
        teacherId: teacherId,
        uploadDate: new Date().toLocaleDateString(),
        documentType: file.type || 'Unknown',
        apiFormat: newDoc
      };

      const updatedDocs = [...supportDocs, newSupportDoc];
      setSupportDocs(updatedDocs);

      setDocTitle("");
      showAlert("Success", "Document uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      showAlert("Error", `Upload failed: ${err.message || 'Please try again.'}`, "danger");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ================= SAVE TABLE DATA ================= */

  const handleSaveData = async () => {
    if (!teacherId || !userId) {
      showAlert("Error", "Teacher ID and User ID are required to save data.", "danger");
      return;
    }

    try {
      setIsLoading(true);

      const slowLearnerTable = rows.map(row => {
        const formattedRow = {};
        columns.forEach(col => {
          formattedRow[col.key] = row[col.key] || '';
        });
        return formattedRow;
      });

      console.log("Prepared table data for API:", slowLearnerTable);

      const slowLearnerDocument = supportDocs.map(doc => ({
        title: doc.title,
        document_name: doc.fileName,
        document_url: doc.url,
        document_type: doc.documentType || 'Unknown',
        upload_date: doc.apiFormat?.upload_date || new Date().toISOString(),
        teacher_id: teacherId,
        user_id: userId
      }));

      const payload = {
        user_id: userId,
        teacher_id: teacherId,
        slow_learner_table: slowLearnerTable,
        slow_learner_document: slowLearnerDocument,
        academic_year: new Date().getFullYear(),
        semester: Math.ceil((new Date().getMonth() + 1) / 6),
        status: "ACTIVE",
        last_updated: new Date().toISOString()
      };

      console.log("Saving data with payload:", payload);

      let response;
      if (currentSlowLearnerId) {
        response = await teacherProfileService.updateSlowLearner(
          currentSlowLearnerId,
          userId,
          payload
        );
      } else {
        response = await teacherProfileService.saveSlowLearner(payload);
        if (response && (response.id || response.slow_learner_id)) {
          setCurrentSlowLearnerId(response.id || response.slow_learner_id);
        }
      }

      console.log("Save response:", response);

      showAlert("Success", "Data saved successfully!");
      setEditMode(false);
      loadTeacherData();

    } catch (error) {
      console.error("Error saving data:", error);
      showAlert("Error", `Failed to save data: ${error.message || 'Please try again.'}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= DELETE SUPPORT DOC ================= */

  const handleDeleteDoc = async (index) => {
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
          showAlert("Success", "Document deleted successfully!");
        } catch (error) {
          console.error("Error deleting document:", error);
          showAlert("Error", "Failed to delete document", "danger");
        }
      },
      onCancel: () => setAlertConfig(null)
    });
  };

  /* ================= DELETE SLOW LEARNER RECORD ================= */
  const handleDeleteRecord = async () => {
    if (!currentSlowLearnerId) return;

    setAlertConfig({
      title: "Confirm Delete",
      message: "Are you sure you want to delete this record?",
      type: "warning",
      showCancel: true,
      confirmBtnText: "Yes, delete it!",
      cancelBtnText: "Cancel",
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await teacherProfileService.softDeleteSlowLearner(currentSlowLearnerId);
          showAlert("Success", "Record deleted successfully!");

          setCurrentSlowLearnerId(null);
          setRows([]);
          setSupportDocs([]);
          setEditMode(false);
          loadTeacherData();
        } catch (error) {
          console.error("Error deleting record:", error);
          showAlert("Error", `Failed to delete record: ${error.message || 'Please try again.'}`, "danger");
        } finally {
          setIsLoading(false);
          setAlertConfig(null);
        }
      },
      onCancel: () => setAlertConfig(null)
    });
  };

  // Function to switch between different slow learner records
  const handleSelectRecord = (recordId) => {
    console.log("Selecting record:", recordId);
    const selectedRecord = slowLearnerData.find(record => record.slow_learner_id === recordId);
    console.log("Selected record:", selectedRecord);

    if (selectedRecord) {
      setCurrentSlowLearnerId(recordId);

      if (selectedRecord.slow_learner_table && selectedRecord.slow_learner_table.length > 0) {
        setRows(selectedRecord.slow_learner_table);
        const firstRow = selectedRecord.slow_learner_table[0];
        const generatedColumns = Object.keys(firstRow).map((key) => {
          let label = key;
          if (label.endsWith('*')) {
            label = label.replace('*', '');
          }
          label = label.replace(/_/g, ' ');
          label = label.replace(/\b\w/g, l => l.toUpperCase());

          return {
            key: key,
            label: label,
            hasAsterisk: key.endsWith('*')
          };
        });
        setColumns(generatedColumns);
      } else {
        setRows([]);
        setColumns(getDefaultColumns());
      }

      if (selectedRecord.slow_learner_document && selectedRecord.slow_learner_document.length > 0) {
        const transformedDocs = selectedRecord.slow_learner_document.map(doc => ({
          title: doc.title || doc.document_name || 'Document',
          fileName: doc.document_name || doc.file_name || 'file',
          url: doc.document_url || doc.url || '#',
          teacherId: teacherId,
          uploadDate: doc.upload_date || new Date().toLocaleDateString(),
          documentType: doc.document_type || doc.type || 'Unknown'
        }));
        setSupportDocs(transformedDocs);
      } else {
        setSupportDocs([]);
      }
    }
  };

  /* ================= MOBILE HEADER ================= */
  const MobileHeader = () => (
    <div className="sm:hidden bg-white border-b py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="font-bold text-sm flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Slow Learners
            </h2>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mt-3 pt-3 border-t space-y-2">
          {/* <button
            disabled={editMode}
            onClick={() => {
              setShowUploadModal(true);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full px-4 py-2 rounded-md text-white flex items-center justify-center gap-2 text-sm
              ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            <Upload className="w-4 h-4" />
            Upload Format
          </button> */}

          {!editMode && (
            <>
              <button
                onClick={() => {
                  setBackupRows(JSON.parse(JSON.stringify(rows)));
                  setEditMode(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center justify-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                Add/Edit Table
              </button>

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

              {currentSlowLearnerId && (
                <button
                  onClick={handleDeleteRecord}
                  className="w-full px-4 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Record
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  /* ================= TABLET HEADER ================= */
  const TabletHeader = () => (
    <div className="hidden sm:flex lg:hidden flex-col gap-3 p-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="font-bold text-base">Slow Learners</h2>
            <div className="text-xs text-gray-600">
              Teacher ID: <span className="font-semibold">{teacherId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={editMode}
          onClick={() => setShowUploadModal(true)}
          className={`px-3 py-2 rounded-md text-white flex items-center gap-2 text-sm
            ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>

        {!editMode && (
          <>
            <button
              onClick={() => {
                setBackupRows(JSON.parse(JSON.stringify(rows)));
                setEditMode(true);
              }}
              className="px-3 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Table
            </button>

            {!editMode && rows.length > 0 && (
              <div className="relative" ref={setExportRef(1)}>
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm"
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

            {currentSlowLearnerId && (
              <button
                onClick={handleDeleteRecord}
                className="px-3 py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-3 text-gray-600 text-sm sm:text-base">Loading teacher information...</span>
      </div>
    );
  }

  // Data loading state
  if (isLoading && teacherId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-3 text-gray-600 text-sm sm:text-base">Loading data...</span>
      </div>
    );
  }

  /* ================= CASE 1: TEACHER ID FOUND ================ */
  if (teacherId && userId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* SweetAlert Component */}
        {alertConfig && (
          <SweetAlert
            success={alertConfig.type === "success"}
            warning={alertConfig.type === "warning"}
            danger={alertConfig.type === "danger"}
            title={alertConfig.title}
            showCancel={alertConfig.showCancel || false}
            confirmBtnText={alertConfig.confirmBtnText || "OK"}
            confirmBtnCssClass="btn-confirm"
            cancelBtnText={alertConfig.cancelBtnText}
            cancelBtnCssClass="btn-cancel"
            onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))}
            onCancel={alertConfig.onCancel}
          >
            {alertConfig.message}
          </SweetAlert>
        )}

        {/* Mobile Header (only on small screens) */}
        <MobileHeader />

        {/* Tablet Header (640px - 1023px) */}
        <TabletHeader />

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* ================= DESKTOP HEADER (1024px and above) ================= */}
          <div className="hidden lg:flex justify-between items-start lg:items-center">
            <div className="flex-1">
              <h2 className="flex items-center gap-2 font-bold text-lg lg:text-xl">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6" />
                Details of Classes conducted for Slow Learners
              </h2>
            </div>

            <div className="flex gap-2 lg:gap-3 flex-wrap">
              {/* <button
                disabled={editMode}
                onClick={() => setShowUploadModal(true)}
                className={`px-3 py-2 lg:px-4 lg:py-2 rounded-md text-white flex items-center gap-2 text-sm lg:text-base
                  ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload Format</span>
                <span className="lg:hidden">Upload</span>
              </button> */}

              {!editMode && (
                <>
                  <button
                    onClick={() => {
                      setBackupRows(JSON.parse(JSON.stringify(rows)));
                      setEditMode(true);
                    }}
                    className="px-3 py-2 lg:px-4 lg:py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-2 text-sm lg:text-base"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden lg:inline">Add/Edit Table</span>
                    <span className="lg:hidden">Edit</span>
                  </button>

                  {!editMode && rows.length > 0 && (
                    <div className="relative" ref={setExportRef(2)}>
                      <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="px-3 py-2 lg:px-4 lg:py-2 rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 text-sm lg:text-base transition-colors shadow-sm"
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

                  {/* {currentSlowLearnerId && (
                    <button
                      onClick={handleDeleteRecord}
                      className="px-3 py-2 lg:px-4 lg:py-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2 text-sm lg:text-base"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden lg:inline">Delete Record</span>
                      <span className="lg:hidden">Delete</span>
                    </button>
                  )} */}
                </>
              )}
            </div>
          </div>

          {/* ================= RECORD SELECTOR ================= */}
          {slowLearnerData.length > 1 && !editMode && (
            <div className="bg-white p-3 rounded-lg border">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Select Record:</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {slowLearnerData.map((record) => (
                  <button
                    key={record.slow_learner_id}
                    onClick={() => handleSelectRecord(record.slow_learner_id)}
                    className={`px-2 py-1 sm:px-3 sm:py-1 rounded text-xs ${currentSlowLearnerId === record.slow_learner_id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    #{record.slow_learner_id}
                    <span className="hidden sm:inline"> ({record.slow_learner_table?.length || 0})</span>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* ================= TABLE CONTAINER ================= */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 text-xs sm:text-sm w-12">
                      S.No.
                    </th>
                    {columns.length > 0 ? (
                      columns.map((c) => (
                        <th
                          key={c.key}
                          className="p-2 sm:p-3 text-left font-semibold text-gray-700 text-xs sm:text-sm min-w-[100px] lg:min-w-[120px]"
                        >
                          <div className="truncate" title={c.label}>
                            <span className="hidden sm:inline">{c.label}</span>
                            <span className="sm:hidden">
                              {c.label.length > 10 ? c.label.substring(0, 10) + '...' : c.label}
                            </span>
                            {c.hasAsterisk && <span className="text-red-500 ml-1">*</span>}
                          </div>
                        </th>
                      ))
                    ) : (
                      <th colSpan={5} className="p-3 text-center text-gray-500 text-sm">
                        No columns defined. Upload Excel or wait for data.
                      </th>
                    )}
                    {editMode && columns.length > 0 && (
                      <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 text-xs sm:text-sm w-16">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 2} className="p-4 sm:p-6 lg:p-8 text-center text-gray-500 text-sm sm:text-base">
                        No data available. Add rows or upload an Excel file.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50 even:bg-gray-50/50">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-center">
                          {i + 1}
                        </td>

                        {columns.map((c) => (
                          <td key={c.key} className="p-2 sm:p-3">
                            {editMode ? (
                              <input
                                value={row[c.key] || ""}
                                onChange={(e) =>
                                  handleCellChange(i, c.key, e.target.value)
                                }
                                className="border px-2 sm:px-3 py-1 sm:py-2 w-full rounded focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                                placeholder={c.label}
                              />
                            ) : (
                              <div className="min-h-[32px] flex items-center">
                                <div className={`truncate ${screenSize.isMobile ? 'max-w-[80px]' : 'max-w-full'}`}
                                  title={String(row[c.key])}>
                                  {row[c.key] || <span className="text-gray-400">-</span>}
                                </div>
                              </div>
                            )}
                          </td>
                        ))}

                        {editMode && columns.length > 0 && (
                          <td className="p-2 sm:p-3">
                            <button
                              onClick={() => handleDeleteRow(i)}
                              className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= SAVE / CANCEL BUTTONS ================= */}
          {
            editMode && (
              <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setRows(backupRows);
                    setEditMode(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm lg:text-base order-2 sm:order-1"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>

                <button
                  onClick={handleSaveData}
                  disabled={isLoading}
                  className={`px-4 py-2 ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg flex items-center justify-center gap-2 text-sm lg:text-base order-1 sm:order-2`}
                >
                  {isLoading ? (
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
            )
          }

          {/* ================= PAGINATION ================= */}
          {
            !editMode && slowLearnerData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {page * size + 1} to {Math.min((page + 1) * size, totalItems)} of {totalItems} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => (page + 1) * size < totalItems ? prev + 1 : prev)}
                    disabled={(page + 1) * size >= totalItems}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )
          }

          {/* ================= SUPPORTING DOCS SECTION ================= */}
          <div className="border rounded-lg p-3 sm:p-4 lg:p-6 space-y-3 lg:space-y-4 bg-white mt-6">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold text-sm sm:text-base lg:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Supporting Documents</span>
              </h4>
              <span className="text-xs sm:text-sm text-gray-500">
                {supportDocs.length} document(s)
              </span>
            </div>

            {editMode && (
              <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title
                  </label>
                  <input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Enter document title"
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose File
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="file"
                      id="slow-learner-support-upload-bottom"
                      onChange={handleSupportUpload}
                      disabled={uploading}
                      className="flex-1 border px-3 py-2 rounded cursor-pointer text-sm w-full"
                    />
                    <button
                      onClick={() => document.getElementById('slow-learner-support-upload-bottom').click()}
                      disabled={uploading || !docTitle}
                      className={`px-4 py-2 rounded ${uploading || !docTitle ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white whitespace-nowrap text-sm`}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {supportDocs.length > 0 ? (
              <ul className="space-y-2">
                {supportDocs.map((d, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border rounded hover:bg-gray-50">
                    <div className="flex-1 mb-2 sm:mb-0">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-start gap-2"
                      >
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate text-blue-600">{d.title}</div>
                          <div className="text-xs text-blue-500 truncate">{d.fileName}</div>
                        </div>
                      </a>
                      <div className="text-xs text-gray-500 mt-1 flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2">
                        <span>Uploaded: {d.uploadDate}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Type: {d.documentType || 'Document'}</span>
                      </div>
                    </div>
                    {editMode && (
                      <button
                        onClick={() => handleDeleteDoc(i)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded self-end sm:self-auto mt-2 sm:mt-0"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center p-4 sm:p-6 lg:p-8 text-gray-500 text-sm sm:text-base">
                No supporting documents uploaded yet.
              </div>
            )}
          </div>

          {/* ================= EXCEL UPLOAD MODAL ================= */}
          {
            showUploadModal && (
              <ExcelUploadModal
                title="Upload Slow Learners Format"
                onClose={() => setShowUploadModal(false)}
                onConfirm={handleExcelConfirm}
                confirmBtnCssClass="btn-confirm"
              />
            )
          }
        </div >
      </div >
    );
  }

  /* ================= CASE 2: TEACHER ID NOT FOUND ================= */
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-gray-500 px-4">
      <UserX className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-300 mb-3 sm:mb-4" />
      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-600">
        Teacher ID Not Found in Profile
      </p>
      <p className="text-xs sm:text-sm mt-1 sm:mt-2 max-w-sm sm:max-w-md lg:max-w-lg">
        Could not retrieve Teacher ID from your user profile. Please contact support.
      </p>
      {userProfile && userProfile.getFullName && (
        <div className="mt-3 sm:mt-4 p-3 bg-blue-50 rounded-lg max-w-xs sm:max-w-sm lg:max-w-md">
          <p className="text-xs sm:text-sm text-blue-700">
            Current User: {userProfile.getFullName()}
          </p>
        </div>
      )}
    </div>
  );
}