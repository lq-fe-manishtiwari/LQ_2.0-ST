import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit3, X, Download, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

/* -------------------------------
   Input Component
--------------------------------*/
const Input = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

/* -------------------------------
   Multi-row Participation Form
--------------------------------*/
const MultiParticipationForm = ({ onClose, onSave, initialData, userId, teacherId, collegeId, departmentId }) => {
  const [rows, setRows] = useState(initialData || [
    { date: "", details_of_seminar: "", details_of_participation: "", publication_details: "" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { date: "", details_of_seminar: "", details_of_participation: "", publication_details: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return; // at least 1 row
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(rows.map(row => ({
      ...row,
      user_id: userId,
      teacher_id: teacherId,
      college_id: collegeId,
      department_id: departmentId
    })));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add / Edit Participations</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {rows.map((row, idx) => (
            <div key={idx} className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3 relative">
              <Input label="Date" type="date" value={row.date} onChange={(e) => handleChange(idx, "date", e.target.value)} />
              <Input label="Event / Seminar" value={row.details_of_seminar} onChange={(e) => handleChange(idx, "details_of_seminar", e.target.value)} />
              <Input label="Details of Participation" value={row.details_of_participation} onChange={(e) => handleChange(idx, "details_of_participation", e.target.value)} />
              <Input label="Publication Details" value={row.publication_details} onChange={(e) => handleChange(idx, "publication_details", e.target.value)} />
              <button type="button" onClick={() => removeRow(idx)} className="absolute top-2 right-2 text-red-500"><X size={18} /></button>
            </div>
          ))}

          <button type="button" onClick={addRow} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
            <Plus size={14} /> Add More
          </button>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Save All</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------
   Bulk Upload Form
--------------------------------*/
const BulkUploadModal = ({ onClose, onSave, userId, teacherId, collegeId, departmentId }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setPreviewData(data);
      };
      reader.readAsBinaryString(f);
    }
  };

  const handleSaveClick = () => {
    // Add user context to each row
    const dataWithUserContext = previewData.map(row => ({
      ...row,
      user_id: userId,
      teacher_id: teacherId,
      college_id: collegeId,
      department_id: departmentId
    }));
    onSave(dataWithUserContext);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Upload Participations</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">✕</button>
        </div>

        <div className="mb-4">
          <a href="/template.xlsx" download className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            <Download size={16} /> Download Template
          </a>
        </div>

        <div className="mb-4">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>

        {previewData.length > 0 && (
          <div className="overflow-x-auto border rounded-lg p-2 max-h-60 overflow-y-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(previewData[0]).map((key, i) => (
                    <th key={i} className="border px-2 py-1">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => <td key={j} className="border px-2 py-1">{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>
          <button onClick={handleSaveClick} className="px-6 py-2 bg-green-600 text-white rounded-lg">Save All</button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------
   Main Component
--------------------------------*/
const Participations = () => {
  const userProfile = useUserProfile(); // UserProfileContext 

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // UserProfileContext 
  const userId = userProfile.getUserId();
  const teacherId = userProfile.getTeacherId();
  const collegeId = userProfile.getCollegeId();
  const departmentId = userProfile.getDepartmentId();

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportMenuRef = useRef(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    return records.map(row => ({
      date: row.date || '-',
      details_of_seminar: row.details_of_seminar || '-',
      details_of_participation: row.details_of_participation || '-',
      publication_details: row.publication_details || '-'
    }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(16);
    doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Participations in Seminars / Conferences / Workshops Report', pageWidth / 2, 22, { align: 'center' });

    const data = getExportData();
    const headers = [['Date', 'Event / Seminar', 'Details of Participation', 'Publication Details']];
    const rows = data.map(item => [item.date, item.details_of_seminar, item.details_of_participation, item.publication_details]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Participations_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportDropdown(false);
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Participations');

      const titleRow0 = worksheet.addRow([collegeName]);
      worksheet.mergeCells(`A1:D1`);
      titleRow0.getCell(1).font = { size: 16, bold: true };
      titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const titleRow = worksheet.addRow(['Participations in Seminars / Conferences / Workshops Report']);
      worksheet.mergeCells(`A2:D2`);
      titleRow.getCell(1).font = { size: 14, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.addRow([]);

      const headers = ['Date', 'Event / Seminar', 'Details of Participation', 'Publication Details'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const data = getExportData();
      data.forEach(item => {
        worksheet.addRow([item.date, item.details_of_seminar, item.details_of_participation, item.publication_details]);
      });

      worksheet.columns.forEach(col => { col.width = 25; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Participations_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export Excel failed:', err);
    }
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const headers = ['Date', 'Event / Seminar', 'Details of Participation', 'Publication Details'];
    let csvContent = `"${collegeName}"\n`;
    csvContent += `"Participations in Seminars / Conferences / Workshops Report"\n\n`;
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

    data.forEach(item => {
      csvContent += [item.date, item.details_of_seminar, item.details_of_participation, item.publication_details]
        .map(val => `"${val}"`)
        .join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Participations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportDropdown(false);
  };

  /* Fetch records */
  const fetchRecords = async () => {
    if (!userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching participations for userId:", userId);
      const data = await listOfBooksService.getParticipationInSeminarByUserId(userId);
      console.log("API Response:", data);

      if (data && data.content && Array.isArray(data.content)) {
        setRecords(data.content);
      } else if (Array.isArray(data)) {
        setRecords(data);
      } else {
        console.error("Unexpected API response format:", data);
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch records.", "error");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.isLoaded && userId) {
      fetchRecords();
    }
  }, [userProfile.isLoaded, userId]);

  /* Save multiple entries one by one */
  const handleSave = async (entries) => {
    try {
      for (let entry of entries) {
        if (entry.participation_in_seminar_id) {
          await listOfBooksService.updateParticipationInSeminar(entry.participation_in_seminar_id, entry);
        } else {
          await listOfBooksService.saveParticipationInSeminar(entry);
        }
      }
      Swal.fire("Success", "All records saved successfully!", "success");
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save records.", "error");
    }
  };

  /* Delete */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await listOfBooksService.hardDeleteParticipationInSeminar(id);
      Swal.fire("Deleted!", "Record deleted successfully.", "success");
      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete record.", "error");
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Participations in Seminars / Conferences / Workshops</h2>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowBulkUpload(true)}
            disabled={!userId}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors shadow-sm ${!userId
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            Bulk Upload
          </button>

          <button
            onClick={() => setShowForm(true)}
            disabled={!userId}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors shadow-sm ${!userId
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <Plus size={16} /> Add Participation
          </button>

          {records.length > 0 && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm transition-colors shadow-sm"
              >
                <Download size={16} />
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
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading participations...</p>
      ) : records.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 italic mb-2">
            No records available
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="table-header">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Event / Seminar</th>
                <th className="border px-3 py-2">Details of Participation</th>
                <th className="border px-3 py-2">Publication Details</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.participation_in_seminar_id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{rec.date}</td>
                  <td className="border px-3 py-2">{rec.details_of_seminar}</td>
                  <td className="border px-3 py-2">{rec.details_of_participation}</td>
                  <td className="border px-3 py-2">{rec.publication_details}</td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditRecord([rec]);
                        setShowForm(true);
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs flex items-center gap-1"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec.participation_in_seminar_id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!userId && (
        <p className="text-xs text-red-500 mt-2">
          Please log in to add participations
        </p>
      )}

      {showForm && (
        <MultiParticipationForm
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSave={handleSave}
          initialData={editRecord}
          userId={userId}
          teacherId={teacherId}
          collegeId={collegeId}
          departmentId={departmentId}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onSave={handleSave}
          userId={userId}
          teacherId={teacherId}
          collegeId={collegeId}
          departmentId={departmentId}
        />
      )}
    </div>
  );
};

export default Participations;