import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { teacherProfileService } from "../Services/academicDiary.service";

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
const SocietalForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || { date: "", details: "" }
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
            label="Details"
            value={formData.details}
            onChange={(e) => handleChange("details", e.target.value)}
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

/* ----------------------------------
   Main Component
----------------------------------- */
const Societal = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const userId = 101; // replace with dynamic user id

  /* Fetch societal contribution records */
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await teacherProfileService.getAllSlowLearners(0, 10); // replace with correct API if different
      setRecords(data.content || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* Save societal contribution (add or edit) */
  const handleSave = async (formData) => {
    try {
      if (editRecord) {
        await teacherProfileService.updateSlowLearner(editRecord.slow_learner_id, userId, formData);
      } else {
        await teacherProfileService.saveSlowLearner({ user_id: userId, ...formData });
      }
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  /* Delete societal contribution */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await teacherProfileService.hardDeleteSlowLearner(id);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Societal Contributions</h2>

      {loading ? <p>Loading...</p> : 
        records.length === 0 ? <p className="text-gray-500 italic">No records available</p> :
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {records[0] && Object.keys(records[0]).map((key) => (
                  <th key={key} className="border px-3 py-2 text-left font-semibold">{key.replace(/_/g, " ")}</th>
                ))}
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.slow_learner_id}>
                  {Object.values(rec).map((val, i) => <td key={i} className="border px-3 py-2">{JSON.stringify(val)}</td>)}
                  <td className="border px-3 py-2 flex gap-2">
                    <button
                      onClick={() => { setEditRecord(rec); setShowForm(true); }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec.slow_learner_id)}
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
