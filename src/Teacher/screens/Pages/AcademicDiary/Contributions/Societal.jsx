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

/* ----------------------------------
   Modal Form
----------------------------------- */
/* ----------------------------------
   Modal Form
----------------------------------- */
const SocietalForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    date: "",
    place: "Indore",
    organizer: "NSS Unit",
    nature_of_work: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || "",
        place: initialData.place || "Indore",
        organizer: initialData.organizer || "NSS Unit",
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

/* ----------------------------------
   Main Component
----------------------------------- */
const Societal = () => {
  const userProfile = useUserProfile();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const userId = userProfile.getUserId();
  const collegeId = userProfile.getCollegeId();

  /* Fetch societal contribution records */
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

  /* Save societal contribution (add or edit) */
  const handleSave = async (formData) => {
    try {
      if (!userId || !collegeId) {
        alert("User information (User ID or College ID) is missing. Please try reloading.");
        return;
      }

      if (!formData.date || !formData.nature_of_work) {
        alert("Date and Nature of Work are required.");
        return;
      }

      const payload = {
        college_id: collegeId,
        user_id: userId,
        date: formData.date,
        place: formData.place || "Indore",
        organizer: formData.organizer || "NSS Unit",
        nature_of_work: formData.nature_of_work,
        other_fields: [
          {
            hours: "0",
            team_size: "0"
          },
          {
            certificate_issued: "no"
          }
        ]
      };

      console.log("Sending Payload:", JSON.stringify(payload, null, 2));

      if (editRecord) {
        await listOfBooksService.updateSocietalContribution(editRecord.societal_contribution_id, payload);
      } else {
        await listOfBooksService.saveSocietalContribution(payload);
      }
      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error("Error saving societal contribution:", err);
      // Try to extract a meaningful error message
      const errorMessage = err.message || err.error || (typeof err === "string" ? err : "Unknown error");
      alert(`Failed to save record: ${errorMessage}`);
    }
  };

  /* Delete societal contribution */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await listOfBooksService.deleteSocietalContribution(id);
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
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Societal Contributions</h2>

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
                    <td className="border px-3 py-2">{rec.date}</td>
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
