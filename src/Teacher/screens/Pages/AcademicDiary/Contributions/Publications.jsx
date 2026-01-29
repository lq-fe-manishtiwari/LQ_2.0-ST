import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, X, Download } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import * as XLSX from "xlsx";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext"; // Context import

/* -------------------------------
   Input Component
--------------------------------*/
const Input = ({ label, type = "text", value, onChange, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children ? (
      children
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      />
    )}
  </div>
);

/* -------------------------------
   Multi-row Publication Form
--------------------------------*/
const MultiPublicationForm = ({ onClose, onSave, initialData, userId, teacherId, collegeId, departmentId }) => {
  const [rows, setRows] = useState(
    initialData || [
      {
        title_of_publication: "",
        publication_date: "",
        journal_or_book_name: "",
        co_author_name: "",
        isbn_issn_no: "",
        ugc_care_listed: null,
        journal_link: "",
        scopus_web_of_science_details: "",
        other_details: "",
      },
    ]
  );

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        title_of_publication: "",
        publication_date: "",
        journal_or_book_name: "",
        co_author_name: "",
        isbn_issn_no: "",
        ugc_care_listed: null,
        journal_link: "",
        scopus_web_of_science_details: "",
        other_details: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(
      rows.map((row) => ({
        ...row,
        user_id: userId,
        teacher_id: teacherId,
        college_id: collegeId,
        department_id: departmentId,
      }))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add / Edit Publications</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3 relative"
            >
              <Input
                label="Title"
                value={row.title_of_publication}
                onChange={(e) => handleChange(idx, "title_of_publication", e.target.value)}
              />
              <Input
                label="Publication Date"
                type="date"
                value={row.publication_date}
                onChange={(e) => handleChange(idx, "publication_date", e.target.value)}
              />
              <Input
                label="Journal / Book"
                value={row.journal_or_book_name}
                onChange={(e) => handleChange(idx, "journal_or_book_name", e.target.value)}
              />
              <Input
                label="Co-authors"
                value={row.co_author_name}
                onChange={(e) => handleChange(idx, "co_author_name", e.target.value)}
              />
              <Input
                label="ISBN / ISSN"
                value={row.isbn_issn_no}
                onChange={(e) => handleChange(idx, "isbn_issn_no", e.target.value)}
              />
              <Input label="UGC CARE Listed">
                <select
                  value={row.ugc_care_listed === null ? "" : row.ugc_care_listed}
                  onChange={(e) =>
                    handleChange(idx, "ugc_care_listed", e.target.value === "true")
                  }
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </Input>
              <Input
                label="Journal Link"
                value={row.journal_link}
                onChange={(e) => handleChange(idx, "journal_link", e.target.value)}
              />
              <Input
                label="Scopus / WoS"
                value={row.scopus_web_of_science_details}
                onChange={(e) => handleChange(idx, "scopus_web_of_science_details", e.target.value)}
              />
              <Input
                label="Other Details"
                value={row.other_details}
                onChange={(e) => handleChange(idx, "other_details", e.target.value)}
              />

              {rows.length > 1 && (
                <button
                  type="button"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => removeRow(idx)}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
          >
            <Plus size={14} /> Add More
          </button>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">
              Save All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------
   Bulk Upload Modal
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
          <h2 className="text-xl font-semibold">Bulk Upload Publications</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <a
            href="/publication_template.xlsx"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
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
                    <th key={i} className="border px-2 py-1">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="border px-2 py-1">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------
   Main Publications Component
--------------------------------*/
const Publications = () => {
  const userProfile = useUserProfile(); 
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [alert, setAlert] = useState(null);

  // UserProfileContext
  const userId = userProfile.getUserId();
  const teacherId = userProfile.getTeacherId();
  const collegeId = userProfile.getCollegeId();
  const departmentId = userProfile.getDepartmentId();

  const fetchRecords = async () => {
    if (!userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching publications for userId:", userId);
      const data = await listOfBooksService.getPublicationsByUserId(userId);
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
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to fetch records.
        </SweetAlert>
      );
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

  const handleSave = async (entries) => {
    try {
      for (let entry of entries) {
        if (entry.publication_id) {
          await listOfBooksService.updatePublication(entry.publication_id, entry);
        } else {
          await listOfBooksService.savePublication(entry);
        }
      }
      setAlert(
        <SweetAlert
          success
          title="Success"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}
        >
          All records saved successfully!
        </SweetAlert>
      );
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to save records.
        </SweetAlert>
      );
    }
  };

  const handleDelete = async (id) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete!"
        cancelBtnText="Cancel"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        confirmBtnBsStyle="danger"
        cancelBtnBsStyle="default"
        title="Are you sure?"
        onConfirm={async () => {
          try {
            await listOfBooksService.hardDeletePublication(id);
            setAlert(
              <SweetAlert success title="Deleted!" onConfirm={() => setAlert(null)}>
                Record deleted successfully.
              </SweetAlert>
            );
            fetchRecords();
          } catch (err) {
            setAlert(
              <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
                Failed to delete record.
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone.
      </SweetAlert>
    );
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">List of Publications</h2>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading publications...</p>
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
                <th className="border px-3 py-2">Title</th>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Journal / Book</th>
                <th className="border px-3 py-2">Co-authors</th>
                <th className="border px-3 py-2">ISBN / ISSN</th>
                <th className="border px-3 py-2">UGC CARE Listed</th>
                <th className="border px-3 py-2">Journal Link</th>
                <th className="border px-3 py-2">Scopus / WoS</th>
                <th className="border px-3 py-2">Other Details</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.publication_id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{rec.title_of_publication}</td>
                  <td className="border px-3 py-2">
                    {rec.publication_date
                      ? new Date(rec.publication_date).toLocaleDateString("en-GB")
                      : ""}
                  </td>
                  <td className="border px-3 py-2">{rec.journal_or_book_name}</td>
                  <td className="border px-3 py-2">{rec.co_author_name}</td>
                  <td className="border px-3 py-2">{rec.isbn_issn_no}</td>
                  <td className="border px-3 py-2">
                    {rec.ugc_care_listed === true
                      ? "Yes"
                      : rec.ugc_care_listed === false
                      ? "No"
                      : ""}
                  </td>
                  <td className="border px-3 py-2">{rec.journal_link}</td>
                  <td className="border px-3 py-2">{rec.scopus_web_of_science_details}</td>
                  <td className="border px-3 py-2">{rec.other_details}</td>
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
                      onClick={() => handleDelete(rec.publication_id)}
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
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            !userId 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Bulk Upload
        </button>
        
        <button
          onClick={() => setShowForm(true)}
          disabled={!userId}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
            !userId 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={16} /> Add Publication
        </button>
      </div>

      {!userId && (
        <p className="text-xs text-red-500 mt-2">
          Please log in to add publications
        </p>
      )}

      {showForm && (
        <MultiPublicationForm
          onClose={() => {
            setShowForm(false);
            setEditRecord(null);
          }}
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

      {alert}
    </div>
  );
};

export default Publications;