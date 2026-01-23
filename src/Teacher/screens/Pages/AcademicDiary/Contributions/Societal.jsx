import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext"; // Context import

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
const SocietalForm = ({ onClose, onSave, initialData, userId, teacherId, collegeId, departmentId }) => {
  const [formData, setFormData] = useState(
    initialData || { 
      date: "", 
      details: "",
    }
  );

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      user_id: userId,
      teacher_id: teacherId,
      college_id: collegeId,
      department_id: departmentId
    });
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
  const userProfile = useUserProfile(); 
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  // UserProfileContext
  const userId = userProfile.getUserId();
  const teacherId = userProfile.getTeacherId();
  const collegeId = userProfile.getCollegeId();
  const departmentId = userProfile.getDepartmentId();

  /* Fetch societal contribution records */
  const fetchRecords = async () => {
    if (!userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching societal contributions for userId:", userId);
      // Assuming you have a service method for societal contributions
      const data = await listOfBooksService.getSocietalContributionsByUserId(userId);
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
      console.error("Error fetching societal contributions:", err);
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

  /* Save societal contribution (add or edit) */
  const handleSave = async (formData) => {
    try {
      if (!userId) {
        alert("User information not available");
        return;
      }

      // Assuming you have service methods for societal contributions
      if (editRecord) {
        const societalId = editRecord.societal_contribution_id || editRecord.id;
        await listOfBooksService.updateSocietalContribution(societalId, formData);
      } else {
        await listOfBooksService.saveSocietalContribution(formData);
      }

      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
      alert("Data saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving data. Please try again.");
    }
  };

  /* Delete societal contribution */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await listOfBooksService.hardDeleteSocietalContribution(id);
      fetchRecords();
      alert("Record deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting record. Please try again.");
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  // Define table columns based on expected data structure
  const tableColumns = [
    { key: "date", label: "Date" },
    { key: "details", label: "Details" },
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Societal Contributions</h2>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading societal contributions...</p>
      ) : records.length === 0 ? (
        <div>
        
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                {tableColumns.map((column) => (
                  <th key={column.key} className="border px-3 py-2 text-left font-semibold">
                    {column.label}
                  </th>
                ))}
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const societalId = rec.societal_contribution_id || rec.id;
                
                return (
                  <tr key={societalId} className="hover:bg-gray-50">
                    {tableColumns.map((column) => (
                      <td key={column.key} className="border px-3 py-2">
                        {rec[column.key] || "N/A"}
                      </td>
                    ))}
                    <td className="border px-3 py-2 flex gap-2">
                      <button
                        onClick={() => { 
                          setEditRecord(rec); 
                          setShowForm(true); 
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(societalId)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        disabled={!userId}
        className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
          !userId 
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Plus size={16} /> Add
      </button>

      {!userId && (
        <p className="text-xs text-red-500 mt-2">
          Please log in to add societal contributions
        </p>
      )}

      {showForm && (
        <SocietalForm
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSave={handleSave}
          initialData={editRecord}
          userId={userId}
          teacherId={teacherId}
          collegeId={collegeId}
          departmentId={departmentId}
        />
      )}
    </div>
  );
};

export default Societal;