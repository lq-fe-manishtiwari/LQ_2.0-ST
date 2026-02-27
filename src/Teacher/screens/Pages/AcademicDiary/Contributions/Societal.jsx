import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Download, ChevronDown } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";


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

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const SocietalForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    date: "",
    place: "",
    organizer: "",
    nature_of_work: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.contribution_date || initialData.date || "",
        place: initialData.place || "",
        organizer: initialData.organizer || "",
        nature_of_work: initialData.nature_of_work || "",
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Societal Contribution" : "Add Societal Contribution"}
          </h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          <Input
            label="Place"
            value={formData.place}
            onChange={(e) => handleChange("place", e.target.value)}
          />
          <Input
            label="Organizer"
            value={formData.organizer}
            onChange={(e) => handleChange("organizer", e.target.value)}
          />
          <Input
            label="Nature of Work"
            value={formData.nature_of_work}
            onChange={(e) => handleChange("nature_of_work", e.target.value)}
          />

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Societal = () => {
  const userProfile = useUserProfile();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportMenuRef = useRef(null);

  const userId = userProfile.getUserId();
  const collegeId = userProfile.getCollegeId();

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
      date: row.contribution_date || row.date || '-',
      place: row.place || '-',
      organizer: row.organizer || '-',
      nature: row.nature_of_work || '-'
    }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(16);
    doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Societal Contributions Report', pageWidth / 2, 22, { align: 'center' });

    const data = getExportData();
    const headers = [['Date', 'Place', 'Organizer', 'Nature of Work']];
    const rows = data.map(item => [item.date, item.place, item.organizer, item.nature]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Societal_Contributions_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportDropdown(false);
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Societal Contributions');

      const titleRow0 = worksheet.addRow([collegeName]);
      worksheet.mergeCells(`A1:D1`);
      titleRow0.getCell(1).font = { size: 16, bold: true };
      titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const titleRow = worksheet.addRow(['Societal Contributions Report']);
      worksheet.mergeCells(`A2:D2`);
      titleRow.getCell(1).font = { size: 14, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.addRow([]);

      const headers = ['Date', 'Place', 'Organizer', 'Nature of Work'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const data = getExportData();
      data.forEach(item => {
        worksheet.addRow([item.date, item.place, item.organizer, item.nature]);
      });

      worksheet.columns.forEach(col => { col.width = 25; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Societal_Contributions_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export Excel failed:', err);
    }
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const headers = ['Date', 'Place', 'Organizer', 'Nature of Work'];
    let csvContent = `"${collegeName}"\n`;
    csvContent += `"Societal Contributions Report"\n\n`;
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

    data.forEach(item => {
      csvContent += [item.date, item.place, item.organizer, item.nature]
        .map(val => `"${val}"`)
        .join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Societal_Contributions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportDropdown(false);
  };

  const fetchRecords = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listOfBooksService.getSocietalContributionByUserId(userId, 0, 10);
      setRecords(data.content || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.isLoaded && userId) {
      fetchRecords();
    }
  }, [userProfile.isLoaded, userId]);


  const handleSave = async (formData) => {
    try {
      if (!userId || !collegeId) {
        Swal.fire("Error", "User information (User ID or College ID) is missing. Please try reloading.", "error");
        return;
      }

      if (!formData.date || !formData.nature_of_work || !formData.place || !formData.organizer) {
        Swal.fire("Warning", "Date, Place, Organizer, and Nature of Work are required.", "warning");
        return;
      }

      const payload = {
        college_id: collegeId,
        user_id: userId,
        contribution_date: formData.date,
        place: formData.place,
        organizer: formData.organizer,
        nature_of_work: formData.nature_of_work,
        other_fields: []
      };

      console.log("Sending Payload:", JSON.stringify(payload, null, 2));

      if (editRecord) {
        await listOfBooksService.updateSocietalContribution(editRecord.societal_contribution_id, payload);
        Swal.fire("Success", "Societal contribution updated successfully!", "success");
      } else {
        await listOfBooksService.saveSocietalContribution(payload);
        Swal.fire("Success", "Societal contribution saved successfully!", "success");
      }
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error("Error saving societal contribution:", err);
      const errorMessage = err.message || err.error || (typeof err === "string" ? err : "Unknown error");
      Swal.fire("Error", `Failed to save record: ${errorMessage}`, "error");
    }
  };

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
      await listOfBooksService.deleteSocietalContribution(id);
      Swal.fire("Deleted!", "Record has been deleted.", "success");
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
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Societal Contributions</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 w-fit shadow-sm"
          >
            <Plus size={16} /> Add
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

      {loading ? <p>Loading...</p> :
        records.length === 0 ? <p className="text-gray-500 italic">No records available</p> :
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left font-semibold">Date</th>
                  <th className="border px-3 py-2 text-left font-semibold">Place</th>
                  <th className="border px-3 py-2 text-left font-semibold">Organizer</th>
                  <th className="border px-3 py-2 text-left font-semibold">Nature of Work</th>
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.societal_contribution_id}>
                    <td className="border px-3 py-2">{rec.contribution_date || rec.date}</td>
                    <td className="border px-3 py-2">{rec.place}</td>
                    <td className="border px-3 py-2">{rec.organizer}</td>
                    <td className="border px-3 py-2">{rec.nature_of_work}</td>
                    <td className="border px-3 py-2 flex gap-2">

                      <button
                        onClick={() => { setEditRecord(rec); setShowForm(true); }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rec.societal_contribution_id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }



      {showForm && (
        <SocietalForm
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSave={handleSave}
          initialData={editRecord}
        />
      )}
    </div>
  );
};

export default Societal;
