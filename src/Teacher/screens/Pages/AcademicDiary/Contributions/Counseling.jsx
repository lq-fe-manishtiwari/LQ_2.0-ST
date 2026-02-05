import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

/* ----------------------------------
   Reusable Input Component
----------------------------------- */
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

/* ----------------------------------
   Modal Form
----------------------------------- */
const CounselingForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || { date: "", details: "", name_of_students: "" }
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
            {initialData ? "Edit Counseling" : "Add Counseling"}
          </h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name of Student"
            value={formData.name_of_students}
            onChange={(e) => handleChange("name_of_students", e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Details of Counseling"
              value={formData.details}
              onChange={(e) => handleChange("details", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ----------------------------------
   Main Component
----------------------------------- */
const Counseling = () => {
  const userProfile = useUserProfile();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const userId = userProfile.getUserId();
  const collegeId = userProfile.getCollegeId();

  /* Fetch counseling records */
  const fetchRecords = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listOfBooksService.getCounselingByUserId(userId, 0, 10);
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

  /* Save counseling (add or edit) */
  const handleSave = async (formData) => {
    try {
      if (!userId) {
        alert("User information not available");
        return;
      }
      const payload = {
        user_id: userId,
        college_id: collegeId,
        ...formData
      };

      if (editRecord) {
        await listOfBooksService.updateCounseling(editRecord.counseling_id, payload);
      } else {
        await listOfBooksService.saveCounseling(payload);
      }
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  /* Delete counseling */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await listOfBooksService.hardDeleteCounseling(id);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Counseling of Students</h2>

      {loading ? <p>Loading...</p> :
        records.length === 0 ? <p className="text-gray-500 italic">No records available</p> :
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {records[0] && Object.keys(records[0])
                    .filter(key => !['counseling_id', 'college_id', 'user_id', 'active_status', 'created_at', 'updated_at', 'deleted_at'].includes(key))
                    .map((key) => (
                      <th key={key} className="border px-3 py-2 text-left font-semibold">{key.replace(/_/g, " ")}</th>
                    ))}
                  <th className="border px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.counseling_id}>
                    {Object.entries(rec)
                      .filter(([key]) => !['counseling_id', 'college_id', 'user_id', 'active_status', 'created_at', 'updated_at', 'deleted_at'].includes(key))
                      .map(([key, val], i) => (
                        <td key={i} className="border px-3 py-2">
                          {typeof val === 'object' ? JSON.stringify(val) : val}
                        </td>
                      ))}
                    <td className="border px-3 py-2 flex gap-2">
                      <button
                        onClick={() => { setEditRecord(rec); setShowForm(true); }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rec.counseling_id)}
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

      <button
        onClick={() => setShowForm(true)}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 w-fit"
      >
        <Plus size={16} /> Add
      </button>

      {showForm && (
        <CounselingForm
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSave={handleSave}
          initialData={editRecord}
        />
      )}
    </div>
  );
};

export default Counseling;
