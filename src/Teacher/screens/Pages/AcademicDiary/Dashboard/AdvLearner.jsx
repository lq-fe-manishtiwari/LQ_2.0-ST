import React, { useState } from "react";
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
} from "lucide-react";
import ExcelUploadModal from "../Component/ExcelUploadModal";
import { HRMManagement } from "../../HRM/Services/hrm.service";

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

export default function AdvLearner() {
    const { filters } = useOutletContext();
  /* ================= TABLE ================= */
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

  /* ================= VALIDATION ================= */
  if (!filters?.programId || !filters?.teacherId) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
        <UserX className="w-20 h-20 text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-600">
          No Teacher Selected
        </p>
        <p className="text-sm mt-1 max-w-sm">
          Please select a <span className="font-medium">Program</span> and a{" "}
          <span className="font-medium">Teacher</span> from the filters above to
          view advance learner details.
        </p>
      </div>
    );
  }

  /* ================= EXCEL CONFIRM ================= */
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

  /* ================= TABLE HANDLERS ================= */

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
      const res = await HRMManagement.uploadFileToS3(file);

      setSupportDocs((prev) => [
        ...prev,
        {
          title: docTitle,
          fileName: file.name,
          url: res.raw,
        },
      ]);

      setDocTitle("");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-2 font-bold text-lg">
          <BookOpen />
          Details of Classes conducted for Advance Learners
        </h2>

        <div className="flex gap-3">
          <button
            disabled={editMode}
            onClick={() => setShowUploadModal(true)}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
              ${editMode ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
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
              className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-700"
            >
              <Edit />
            </button>
          )}
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="border rounded-lg overflow-auto max-h-[60vh]">
        <div className="overflow-x-auto">
            <table className="w-full table-fixed">
          <thead className="table-header">
            <tr>
              <th className="p-2">S.No.</th>
              {columns.map((c) => (
                <th key={c.key} className="p-2">
                  {c.label}
                </th>
              ))}
              {editMode && <th className="p-2">Action</th>}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{i + 1}</td>

                {columns.map((c) => (
                  <td key={c.key} className="p-2">
                    {editMode ? (
                      <input
                        value={row[c.key] || ""}
                        onChange={(e) =>
                          handleCellChange(i, c.key, e.target.value)
                        }
                        className="border px-2 py-1 w-full rounded"
                      />
                    ) : (
                      row[c.key]
                    )}
                  </td>
                ))}

                {editMode && (
                  <td className="p-2">
                    <button
                      onClick={() => handleDeleteRow(i)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ================= ADD ROW ================= */}
      {editMode && (
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      )}

      {/* ================= SUPPORTING DOCS ================= */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="flex items-center gap-2 font-semibold">
          <FileText /> Supporting Documents
        </h4>

        {editMode && (
          <div className="flex gap-3">
            <input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title"
              className="border px-3 py-2 rounded w-1/3"
            />
            <input type="file" onChange={handleSupportUpload} />
          </div>
        )}

        <ul className="list-disc pl-5">
          {supportDocs.map((d, i) => (
            <li key={i}>
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                {d.title} ({d.fileName})
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= SAVE / CANCEL ================= */}
      {editMode && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setRows(backupRows);
              setEditMode(false);
            }}
            className="px-6 py-2 border rounded"
          >
            <XCircle /> Cancel
          </button>

          <button
            onClick={() => setEditMode(false)}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            <Save /> Save
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}
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
