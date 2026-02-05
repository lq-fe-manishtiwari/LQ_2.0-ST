import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import Swal from 'sweetalert2';

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

const OtherForm = ({ onClose, onSave, initialData }) => {
  const getOtherField = (index, key) => initialData?.other_fields?.[index]?.[key] || "";

  const [formData, setFormData] = useState({
    contribution_date: initialData?.contribution_date || "",
    contribution: initialData?.contribution || "",
    duration: getOtherField(0, "duration"),
    role: getOtherField(0, "role"),
    audience: getOtherField(1, "audience"),
    medium: getOtherField(1, "medium"),
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      contribution_date: formData.contribution_date,
      contribution: formData.contribution,
      other_fields: [],
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? "Edit Contribution" : "Add Contribution"}
          </h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-red-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contribution Date"
            type="date"
            value={formData.contribution_date}
            onChange={(e) => handleChange("contribution_date", e.target.value)}
          />
          <Input
            label="Contribution"
            value={formData.contribution}
            onChange={(e) => handleChange("contribution", e.target.value)}
          />

          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const OtherContributions = () => {
  const userProfile = useUserProfile();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const userId = userProfile.getUserId();
  const collegeId = userProfile.getCollegeId();

  const fetchRecords = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await listOfBooksService.getAnyOtherContributionByUserId(userId);
      if (data && data.content) {
        setRecords(data.content);
      } else if (Array.isArray(data)) {
        setRecords(data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching other contributions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.isLoaded && userId) {
      fetchRecords();
    }
  }, [userProfile.isLoaded, userId]);

  const handleSave = async (data) => {
    try {
      if (!userId) {
        Swal.fire('Error', 'User information not available', 'error');
        return;
      }

      const payload = {
        ...data,
        user_id: userId,
        college_id: collegeId,
      };

      if (editRecord) {
        const id = editRecord.id || editRecord.any_other_contribution_id;
        if (id) {
          await listOfBooksService.updateAnyOtherContribution(id, payload);
          Swal.fire('Success', 'Contribution updated successfully!', 'success');
        } else {
          console.error("No ID found for update");
          Swal.fire('Error', 'No ID found for update', 'error');
          return;
        }
      } else {
        await listOfBooksService.saveAnyOtherContribution(payload);
        Swal.fire('Success', 'Contribution saved successfully!', 'success');
      }

      setShowForm(false);
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error saving data. Please try again.', 'error');
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
      await listOfBooksService.deleteAnyOtherContribution(id);
      fetchRecords();
      Swal.fire('Deleted!', 'Record has been deleted.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error deleting record. Please try again.', 'error');
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Other Contributions</h2>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500 italic">No records available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left font-semibold">Date</th>
                <th className="border px-3 py-2 text-left font-semibold">Contribution</th>

                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, index) => {
                const recordId = rec.id || rec.any_other_contribution_id;

                return (
                  <tr key={recordId || index}>
                    <td className="border px-3 py-2 whitespace-nowrap">
                      {rec.contribution_date}
                    </td>
                    <td className="border px-3 py-2">{rec.contribution}</td>

                    <td className="border px-3 py-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditRecord(rec);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(recordId)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs"
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
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 w-fit"
      >
        <Plus size={16} /> Add
      </button>

      {showForm && (
        <OtherForm
          onClose={() => {
            setShowForm(false);
            setEditRecord(null);
          }}
          onSave={handleSave}
          initialData={editRecord}
        />
      )}
    </div>
  );
};

export default OtherContributions;