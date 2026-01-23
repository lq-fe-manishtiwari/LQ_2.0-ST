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
} from "lucide-react";
import ExcelUploadModal from "../Component/ExcelUploadModal";
import { HRMManagement } from "../../HRM/Services/hrm.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

/* ================= DEFAULT STATIC CONFIG ================= */

const DEFAULT_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "class", label: "Class" },
  { key: "topic", label: "Topic" },
  { key: "students", label: "No. of Students Present" },
  { key: "hod", label: "Sign of HOD with Date" },
];

const DEFAULT_ROWS = [
  {
    date: "23-12-2025",
    class: "First Year",
    topic: "Unit",
    students: "UG   ",
    hod: "",
  },
];

export default function SlowLearner() {
  const userProfile = useUserProfile();
  
  /* ================= STATE FOR TEACHER ID ================= */
  const [teacherId, setTeacherId] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  /* ================= TABLE STATES ================= */
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [backupRows, setBackupRows] = useState([]);
  
  /* ================= UI STATES ================= */
  const [editMode, setEditMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isExcelMode, setIsExcelMode] = useState(false);
  
  /* ================= SUPPORTING DOCS ================= */
  const [supportDocs, setSupportDocs] = useState([]);
  const [docTitle, setDocTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  
  /* ================= FETCH TEACHER ID FROM PROFILE ================= */
  useEffect(() => {
    const fetchTeacherIdFromProfile = async () => {
      try {
        setIsLoadingProfile(true);
        
        // Check if userProfile is available and has the method
        if (userProfile && userProfile.getTeacherId) {
          const profileTeacherId = userProfile.getTeacherId();
          console.log("Profile Teacher ID:", profileTeacherId);
          setTeacherId(profileTeacherId);
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
  
  /* ================= LOAD INITIAL DATA ================= */
  useEffect(() => {
    
    if (teacherId) {
      loadTeacherData();
    }
  }, [teacherId]);
  
  const loadTeacherData = async () => {
    try {
      console.log("Loading data for Teacher ID:", teacherId);
  
    } catch (error) {
      console.error("Error loading teacher data:", error);
    }
  };
  
  /* ================= TABLE HANDLERS ================= */
  
  const handleExcelConfirm = (excelData) => {
    if (!excelData.length) return;
    
    const dynamicColumns = Object.keys(excelData[0]).map((key) => ({
      key,
      label: key,
    }));
    
    setColumns(dynamicColumns);
    setRows(excelData);
    setIsExcelMode(true);
    setShowUploadModal(false);
  };
  
  const handleAddRow = () => {
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
    if (!file || !docTitle) return;
    
    try {
      setUploading(true);
      
      // Additional metadata for the upload
      const metadata = {
        teacherId: teacherId,
        documentType: 'advance_learner',
        uploadDate: new Date().toISOString(),
        userId: userProfile?.getUserId ? userProfile.getUserId() : null,
        userType: userProfile?.getUserType ? userProfile.getUserType() : null
      };
      
      console.log("Uploading document with metadata:", metadata);
      
      const res = await HRMManagement.uploadFileToS3(file, metadata);
      
      setSupportDocs((prev) => [
        ...prev,
        {
          title: docTitle,
          fileName: file.name,
          url: res.raw || res.url,
          teacherId: teacherId,
          uploadDate: new Date().toLocaleDateString(),
          metadata: metadata
        },
      ]);
      
      setDocTitle("");
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  
  /* ================= SAVE TABLE DATA ================= */
  
  const handleSaveData = async () => {
    try {
      // Prepare data with teacher information
      const dataToSave = {
        teacherId: teacherId,
        rows: rows,
        columns: columns,
        supportDocs: supportDocs,
        metadata: {
          savedBy: userProfile?.getFullName ? userProfile.getFullName() : 'Unknown',
          savedById: userProfile?.getUserId ? userProfile.getUserId() : null,
          savedAt: new Date().toISOString(),
          isExcelMode: isExcelMode
        }
      };
      
      console.log("Saving data:", dataToSave);

      // For now, just show success message
      alert("Data would be saved with Teacher ID: " + teacherId);
      
      setEditMode(false);
    } catch (error) {
      console.error("Error saving data:", error);
      alert(`Failed to save data: ${error.message}`);
    }
  };
  
  /* ================= DELETE SUPPORT DOC ================= */
  
  const handleDeleteDoc = async (index) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const docToDelete = supportDocs[index];
      
      setSupportDocs((prev) => prev.filter((_, i) => i !== index));
      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };
  
  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading teacher information...</span>
      </div>
    );
  }
  
  /* ================= CASE 1: TEACHER ID ================ */
  if (teacherId) {
    return (
      <div className="space-y-6">
        
        {/* ================= HEADER WITH TEACHER INFO ================= */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-lg">
              <BookOpen />
              Details of Classes conducted for Advance Learners
            </h2>
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Teacher ID: </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {teacherId}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                (from user profile)
              </span>
              {userProfile?.getFullName && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Teacher: </span>
                  <span className="text-gray-700">
                    {userProfile.getFullName()}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              disabled={editMode}
              onClick={() => setShowUploadModal(true)}
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                ${editMode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <Upload className="w-4 h-4" />
              Upload Format
            </button>
            
            {!editMode && (
              <button
                onClick={() => {
                  setBackupRows(JSON.parse(JSON.stringify(rows)));
                  setEditMode(true);
                }}
                className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Table
              </button>
            )}
          </div>
        </div>
        
        {/* ================= TABLE ================= */}
        <div className="border rounded-lg overflow-auto max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="table-header bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-700">S.No.</th>
                  {columns.map((c) => (
                    <th key={c.key} className="p-3 text-left font-semibold text-gray-700">
                      {c.label}
                    </th>
                  ))}
                  {editMode && <th className="p-3 text-left font-semibold text-gray-700">Action</th>}
                </tr>
              </thead>
              
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-8 text-center text-gray-500">
                      No data available. Add rows or upload an Excel file.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3">{i + 1}</td>
                      
                      {columns.map((c) => (
                        <td key={c.key} className="p-3">
                          {editMode ? (
                            <input
                              value={row[c.key] || ""}
                              onChange={(e) =>
                                handleCellChange(i, c.key, e.target.value)
                              }
                              className="border px-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Enter ${c.label}`}
                            />
                          ) : (
                            <div className="min-h-[40px] flex items-center">
                              {row[c.key] || <span className="text-gray-400">-</span>}
                            </div>
                          )}
                        </td>
                      ))}
                      
                      {editMode && (
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteRow(i)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
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
        
        {/* ================= ADD ROW BUTTON ================= */}
        {editMode && (
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        )}
        
        {/* ================= SUPPORTING DOCS SECTION ================= */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-semibold text-lg">
              <FileText className="w-5 h-5" /> Supporting Documents
            </h4>
            <span className="text-sm text-gray-500">
              {supportDocs.length} document(s)
            </span>
          </div>
          
          {editMode && (
            <div className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose File
                </label>
                <input
                  type="file"
                  onChange={handleSupportUpload}
                  disabled={uploading}
                  className="w-full border px-3 py-2 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  disabled={uploading || !docTitle}
                  className={`px-4 py-2 rounded ${uploading || !docTitle ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          )}
          
          {supportDocs.length > 0 ? (
            <ul className="space-y-2">
              {supportDocs.map((d, i) => (
                <li key={i} className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50">
                  <div>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {d.title} ({d.fileName})
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      Uploaded on {d.uploadDate} • Teacher ID: {d.teacherId}
                    </div>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleDeleteDoc(i)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No supporting documents uploaded yet.
            </div>
          )}
        </div>
        
        {/* ================= SAVE / CANCEL BUTTONS ================= */}
        {editMode && (
          <div className="flex justify-center gap-4 pt-4 border-t">
            <button
              onClick={() => {
                setRows(backupRows);
                setEditMode(false);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
            
            <button
              onClick={handleSaveData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
        
        {/* ================= EXCEL UPLOAD MODAL ================= */}
        {showUploadModal && (
          <ExcelUploadModal
            title="Upload Advance Learners Format"
            onClose={() => setShowUploadModal(false)}
            onConfirm={handleExcelConfirm}
          />
        )}
      </div>
    );
  }
  
  /* ================= CASE 2: TEACHER ID ================= */
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
      <UserX className="w-20 h-20 text-gray-300 mb-4" />
      <p className="text-lg font-semibold text-gray-600">
        Teacher ID Not Found in Profile
      </p>
      <p className="text-sm mt-1 max-w-sm">
        Could not retrieve Teacher ID from your user profile. Please contact support.
      </p>
      {userProfile && userProfile.getFullName && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Current User: {userProfile.getFullName()}
          </p>
        </div>
      )}
    </div>
  );
}