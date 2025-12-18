import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from "../Components/Loader";
import { Settings } from "../Settings/Settings.service";

/* ----------------------------------------------------
   API TABLE  (WITH MOBILE VIEW)
---------------------------------------------------- */
const APIPageTable = ({ APIList, onEdit, onDelete, loading }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = APIList.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;

  const currentEntries = APIList.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full mt-8">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Sr No</th>
                <th className="table-th text-center">API</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader size="lg" className="mb-4" />
                    <p className="text-gray-500">Loading APIs...</p>
                  </td>
                </tr>
              ) : totalEntries === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-600 bg-white"
                  >
                    <p className="text-lg font-semibold mb-1">No API found</p>
                    <p className="text-sm text-gray-500">
                      Add API to see them here.
                    </p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr key={item.api_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-center">
                      {start + index + 1}
                    </td>
                    <td className="px-6 py-4 text-center">{item.api_name}</td>
                    <td className="px-6 py-4 text-center">
                      {item.created_date
                        ? new Date(item.created_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item.api_id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        {!loading && totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t text-sm">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-blue-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span>
              Showing {start + 1}–{Math.min(end, totalEntries)} of{" "}
              {totalEntries}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages
                  ? "bg-blue-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4 mt-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <Loader size="lg" className="mb-4" />
            <p className="text-gray-500">Loading APIs...</p>
          </div>
        ) : totalEntries === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border">
            <p className="text-lg text-gray-500">No API found</p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.api_id}
              className="bg-white rounded-xl shadow-md border p-5"
            >
              <span className="text-sm text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-1">
                {item.api_name}
              </h3>

              <p className="text-sm text-gray-600">
                Created:{" "}
                {item.created_date
                  ? new Date(item.created_date).toLocaleDateString()
                  : "N/A"}
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t mt-3">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.api_id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {!loading && totalEntries > 0 && (
          <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-md border text-sm">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-blue-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span>
              {start + 1}–{Math.min(end, totalEntries)} of {totalEntries}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages
                  ? "bg-blue-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ----------------------------------------------------
                MAIN API PAGE
---------------------------------------------------- */
export default function API() {
  const [API, setAPI] = useState(["", ""]);
  const [APIList, setAPIList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();

  /* Fetch APIs */
  useEffect(() => {
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllApi();

      if (response && Array.isArray(response)) {
        const sortedData = response.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
        setAPIList(sortedData);
      } else {
        setAlertMessage("Invalid response from server");
        setShowSuccess(true);
      }
    } catch (error) {
      // setAlertMessage("Failed to fetch APIs");
      // setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  /* Input Change */
  const handleChange = (index, value) => {
    const updated = [...API];
    updated[index] = value;
    setAPI(updated);
  };

  /* Add two inputs */
  const handleAddNew = () => setAPI((prev) => [...prev, "", ""]);

  /* Remove single input */
  const handleRemove = (index) =>
    API.length > 2 && setAPI(API.filter((_, i) => i !== index));

  /* Save */
  const handleSave = async () => {
    const cleaned = API.filter((v) => v.trim() !== "");

    if (cleaned.length === 0) {
      setAlertMessage("Please add at least one API.");
      setShowSuccess(true);
      return;
    }

    try {
      setSaving(true);

      if (isEditing && editingItem) {
        await Settings.updateApi({
          api_id: editingItem.api_id,
          api_name: cleaned[0],
        });
        setAlertMessage("API updated successfully!");
      } else {
        for (const apiName of cleaned) {
          await Settings.postApi({ api_name: apiName });
        }
        setAlertMessage("APIs added successfully!");
      }

      await fetchAPIs();

      setAPI(["", ""]);
      setIsEditing(false);
      setEditingItem(null);
      setShowSuccess(true);
    } catch (error) {
      setAlertMessage("Failed to save API");
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  /* Edit Row */
  const handleEditRow = (item) => {
    setEditingItem(item);
    setIsEditing(true);
    setAPI([item.api_name, ""]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Delete Request */
  const handleDeleteRequest = (id) => {
    setItemToDelete(id);
    setShowDeleteAlert(true);
  };

  /* Confirm Delete */
  const handleConfirmDelete = async () => {
    try {
      setShowDeleteAlert(false);
      const response = await Settings.deleteApi(itemToDelete);
      setItemToDelete(null);
      await fetchAPIs();
      
      // Handle both JSON and text responses
      let successMsg = "API deleted successfully!";
      if (typeof response === 'string') {
        successMsg = response;
      } else if (response?.message) {
        successMsg = response.message;
      }
      
      setAlertMessage(successMsg);
      setShowSuccess(true);
    } catch (error) {
      setShowDeleteAlert(false);
      setItemToDelete(null);
      await fetchAPIs();
      
      let errorMsg = "Failed to delete API";
      if (error?.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }      
      setAlertMessage(errorMsg);
      setShowSuccess(true);
    }
  };

  /* Cancel */
  const handleCancel = () => {
    setAPI(["", ""]);
    setIsEditing(false);
    setEditingItem(null);
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      {/* Input Section */}
      <div className="w-full mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Input Boxes */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {API.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-blue-600 font-medium mb-1">
                    {index + 1}. API
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      value={item}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder="Enter API"
                      className="w-full border rounded px-3 py-2 border-gray-300 focus:border-blue-500"
                    />

                    {index === API.length - 1 && (
                      <button
                        onClick={handleAddNew}
                        className="p-1 bg-green-600 text-white rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {API.length > 2 && (
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-1 bg-red-500 text-white rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SECTION — DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center justify-end gap-4 w-full mt-6">

            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-white btn-confirm transition disabled:opacity-50"
            >
              {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
            </button>

            <button
              onClick={() =>
                navigate("/hrm/settings/API/bulkupload")
              }
              className="flex items-center justify-center gap-2 
                         bg-blue-600 hover:bg-blue-700 text-white font-medium 
                         px-4 py-3 rounded-lg shadow-md transition"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>

          </div>

          {/* MOBILE BUTTON ROW  */}
          <div className="lg:hidden flex flex-col w-full mt-4 gap-3">

            <div className="flex gap-4 w-full">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="w-1/2 py-2 rounded-lg text-gray-700 btn-cancel transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-1/2 py-2 text-white btn-confirm transition disabled:opacity-50"
              >
                {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
              </button>
            </div>

            <button
              onClick={() =>
                navigate("/hrm/settings/API/bulkupload")
              }
              className="flex items-center justify-center gap-2 
                         bg-blue-600 hover:bg-blue-700 text-white font-medium 
                         px-4 py-3 rounded-lg shadow-md transition w-full"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>

          </div>
        </div>
      </div>

      {/* SINGLE TABLE (ONLY ONE) */}
      <div className="w-full mt-10">
        <APIPageTable
          APIList={APIList}
          loading={loading}
          onEdit={handleEditRow}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Alerts */}
      {showSuccess && (
        <SweetAlert
          success={!alertMessage.toLowerCase().includes("failed") && !alertMessage.toLowerCase().includes("error")}
          error={alertMessage.toLowerCase().includes("failed") || alertMessage.toLowerCase().includes("error")}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          title={alertMessage.toLowerCase().includes("failed") || alertMessage.toLowerCase().includes("error") ? "Error!" : "Success!"}
          onConfirm={() => setShowSuccess(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}

      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteAlert(false)}
        >
          Do you want to delete this API?
        </SweetAlert>
      )}
    </div>
  );
}
