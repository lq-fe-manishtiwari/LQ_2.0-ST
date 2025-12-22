import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from '../Components/Loader';
import { Settings } from '../Settings/Settings.service';

/* ----------------------------------------------------
   PRIORITY TABLE COMPONENT
---------------------------------------------------- */
const PriorityTable = ({ priorities, onEdit, onDelete, loading = false }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = priorities.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;

  const currentEntries = priorities.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Sr No</th>
                <th className="table-th text-center">Priority Name</th>
                <th className="table-th text-center">Description</th>
                <th className="table-th text-center">Is Default</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-gray-500">Loading priorities...</p>
                    </div>
                  </td>
                </tr>
              ) : priorities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No priorities found</p>
                    <p className="text-sm">Add priorities to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr
                    key={item.priority_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.priority_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {item.description || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_default 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_default ? 'Yes' : 'No'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {item.createddate ? new Date(item.createddate).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(item.priority_id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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
        {totalEntries > 0 && !loading && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(end, totalEntries)} of{" "}
              {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <Loader size="lg" className="mb-4" />
              <p className="text-gray-500">Loading priorities...</p>
            </div>
          </div>
        ) : priorities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">
              No priorities found
            </p>
            <p className="text-sm text-gray-500">
              Add priorities to see them here.
            </p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.priority_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="font-semibold">{item.priority_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-right">{item.description || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Default:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.is_default 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.is_default ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span>{item.createddate ? new Date(item.createddate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.priority_id)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalEntries > 0 && !loading && (
          <div className="flex justify-between items-center px-4 py-4 bg-white rounded-xl shadow-md border border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium text-xs sm:text-sm">
              {start + 1}–{Math.min(end, totalEntries)} of {totalEntries}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
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
                MAIN PRIORITY PAGE
---------------------------------------------------- */
export default function Priority() {
  const [formData, setFormData] = useState({
    priority_name: "",
    description: "",
    is_default: false
  });
  
  const [priorities, setPriorities] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();

  // Fetch all priorities on component mount
  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllPriority();
      // Sort by priority_id descending (newest first)
      const sortedData = (response || []).sort((a, b) => 
        b.priority_id - a.priority_id
      );
      setPriorities(sortedData);
    } catch (error) {
      console.error("Error fetching priorities:", error);
      setAlertMessage("Failed to load priorities");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    // Validation - only priority name is required
    if (!formData.priority_name.trim()) {
      setAlertMessage("Please enter a priority name.");
      setShowSuccess(true);
      return;
    }

    try {
      setSaving(true);

      if (isEditing && editingItem) {
        // Update existing priority
        const updateData = {
          priority_id: editingItem.priority_id,
          priority_name: formData.priority_name.trim(),
          description: formData.description.trim(),
          is_default: formData.is_default
        };
        
        await Settings.updatePriority(updateData, editingItem.priority_id);
        setAlertMessage("Priority updated successfully!");
      } else {
        // Create new priority
        const saveData = {
          priority_name: formData.priority_name.trim(),
          description: formData.description.trim(),
          is_default: formData.is_default
        };
        
        const response = await Settings.postPriority(saveData);
        setAlertMessage(response.message || "Priority saved successfully!");
      }

      // Refresh the list
      await fetchPriorities();

      // Reset form
      setFormData({
        priority_name: "",
        description: "",
        is_default: false
      });
      
      setEditingItem(null);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving priority:", error);
      setAlertMessage(error.message || "Failed to save priority");
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      priority_name: "",
      description: "",
      is_default: false
    });
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditing(true);
    setFormData({
      priority_name: item.priority_name || "",
      description: item.description || "",
      is_default: item.is_default || false
    });
    
    // Scroll to top when editing
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleDeleteRequest = (id) => {
    setItemToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setShowDeleteAlert(false);
      await Settings.deletePriority(itemToDelete);
      setItemToDelete(null);
      await fetchPriorities();
      
      setAlertMessage("Priority deleted successfully!");
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error deleting priority:", error);
      setShowDeleteAlert(false);
      setItemToDelete(null);
      
      setAlertMessage(error.message || "Failed to delete priority");
      setShowSuccess(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      {/* Form Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full mt-6 gap-4">
        {/* Left Section - Form Fields */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full lg:w-auto flex-wrap">
          {/* Priority Name */}
          <div className="flex flex-col w-full lg:w-64">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Priority Name *
            </label>
            <input
              type="text"
              name="priority_name"
              value={formData.priority_name}
              onChange={handleInputChange}
              placeholder="e.g., High, Medium, Low"
              className="w-full border rounded px-3 py-2 
                         focus:outline-none transition-colors 
                         border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col w-full lg:w-64">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              className="w-full border rounded px-3 py-2 
                         focus:outline-none transition-colors 
                         border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Is Default Checkbox */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
              Set as default priority
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-center lg:justify-start gap-3 w-full lg:w-auto">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition disabled:opacity-50 w-full lg:w-auto"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-white btn-confirm transition disabled:opacity-50 w-full lg:w-auto"
            >
              {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
            </button>
          </div>
        </div>

        {/* Right Section Bulk Upload */}
        <button
          onClick={() => navigate("/hrm/settings/priority/bulkupload")}
          className="flex items-center justify-center gap-2 
                     bg-blue-600 hover:bg-blue-700 text-white font-medium 
                     px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
                     w-full lg:w-auto"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 w-full text-center py-8">
          <Loader size="lg" className="mb-4" />
          <p className="text-gray-600">Loading priorities...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="mt-8 w-full">
          <PriorityTable
            priorities={priorities}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />
        </div>
      )}

      {/* Success/Error Alert */}
      {showSuccess && (
        <SweetAlert
          success={!alertMessage.includes("Failed")}
          error={alertMessage.includes("Failed")}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          title={alertMessage.includes("Failed") ? "Error!" : "Success!"}
          onConfirm={() => setShowSuccess(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteAlert(false);
            setItemToDelete(null);
          }}
        >
          Do you want to delete this priority?
        </SweetAlert>
      )}
    </div>
  );
}