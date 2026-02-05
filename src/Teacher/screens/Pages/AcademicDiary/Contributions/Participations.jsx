import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import Swal from 'sweetalert2';

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
      </div>

      {loading ? (
        <p className="text-gray-500">Loading participations...</p>
      ) : records.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 italic mb-2">
            No records available for User ID: {userId}
          </p>
          <p className="text-xs text-gray-400">
            College: {collegeId} | Department: {departmentId}
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

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setShowBulkUpload(true)}
          disabled={!userId}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${!userId
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
        >
          Bulk Upload
        </button>

        <button
          onClick={() => setShowForm(true)}
          disabled={!userId}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${!userId
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          <Plus size={16} /> Add Participation
        </button>
      </div>

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