import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from '../Components/Loader';
import { Settings } from '../Settings/Settings.service';

/* ----------------------------------------------------
   TASK STATUS TABLE COMPONENT
---------------------------------------------------- */
const TaskStatusTable = ({ taskStatusList, onEdit, onDelete, loading = false }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = taskStatusList.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;

  const currentEntries = taskStatusList.slice(start, end);

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
                <th className="table-th text-center">Task Status</th>
                <th className="table-th text-center">Is Default</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-gray-500">Loading task status...</p>
                    </div>
                  </td>
                </tr>
              ) : taskStatusList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No task status found</p>
                    <p className="text-sm">Add task status to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr
                    key={item.task_status_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.default 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {item.default ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(item.task_status_id)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(item.task_status_id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          disabled={item.default}
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
              <p className="text-gray-500">Loading task status...</p>
            </div>
          </div>
        ) : taskStatusList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">
              No task status found
            </p>
            <p className="text-sm text-gray-500">
              Add task status to see them here.
            </p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.task_status_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-2 mb-1">
                {item.name}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.default 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {item.default ? "Default Status" : "Not Default"}
                </span>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(item.task_status_id)}
                  className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.task_status_id)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  disabled={item.default}
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
                MAIN TASK STATUS PAGE
---------------------------------------------------- */
export default function TaskStatus() {
  const [taskStatusName, setTaskStatusName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [taskStatusList, setTaskStatusList] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // stores full item after fetch
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false); // loading while fetching single item

  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();

  // Fetch all task status on mount
  useEffect(() => {
    fetchTaskStatus();
  }, []);

  const fetchTaskStatus = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllTaskStatus();
      const data = response || [];
      const sortedData = data.sort((a, b) => 
        b.task_status_id - a.task_status_id
      );
      setTaskStatusList(sortedData);
    } catch (error) {
      console.error("Error fetching task status:", error);
      setAlertMessage("Failed to load task statuses");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setEditLoading(true);
      const item = await Settings.getTaskStatusbyID(id); // Fetch fresh data

      setEditingItem(item);
      setIsEditing(true);
      setTaskStatusName(item.name || "");
      setIsDefault(item.default || false);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error fetching task status for edit:", error);
      setAlertMessage("Failed to load task status for editing");
      setShowSuccess(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSave = async () => {
    if (!taskStatusName.trim()) {
      setAlertMessage("Please enter a task status name.");
      setShowSuccess(true);
      return;
    }

    try {
      setSaving(true);

      if (isEditing && editingItem) {
        // Update - include isDefault in payload
        const updateData = {
          name: taskStatusName.trim(),
          isDefault: isDefault
        };
        await Settings.updateTaskStatus(updateData, editingItem.task_status_id);
        setAlertMessage("Task Status updated successfully!");
      } else {
        // Create - always set isDefault to false
        const saveData = {
          name: taskStatusName.trim(),
          isDefault: false // Always false for new entries
        };
        await Settings.postTaskStatus(saveData);
        setAlertMessage("Task Status saved successfully!");
      }

      await fetchTaskStatus();

      // Reset form
      setTaskStatusName("");
      setIsDefault(false); // Reset to false when clearing form
      setEditingItem(null);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error saving task status:", error);
      setAlertMessage("Failed to save task status");
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTaskStatusName("");
    setIsDefault(false); // Reset to false
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleDeleteRequest = (id) => {
    const item = taskStatusList.find(status => status.task_status_id === id);
    if (item && item.default) {
      setAlertMessage("Cannot delete default task status!");
      setShowSuccess(true);
      return;
    }
    setItemToDelete(id);
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setShowDeleteAlert(false);
      await Settings.deleteTaskStatus(itemToDelete);
      setItemToDelete(null);
      await fetchTaskStatus();
      
      setAlertMessage("Task Status deleted successfully!");
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error deleting task status:", error);
      setAlertMessage("Failed to delete task status");
      setShowSuccess(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      {/* Edit Loading Indicator */}
      {editLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <Loader size="lg" className="mb-4" />
            <p>Loading task status...</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full mt-6 gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full lg:w-auto">
          <div className="flex flex-col w-full lg:w-auto">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Task Status Name
            </label>

            <input
              type="text"
              value={taskStatusName}
              onChange={(e) => setTaskStatusName(e.target.value)}
              placeholder="Enter Task Status Name"
              className="w-full lg:w-64 border rounded px-3 py-2 
                         focus:outline-none transition-colors 
                         border-gray-300 focus:border-blue-500
                         mx-auto lg:mx-0"
            />
          </div>

          {/* Show "Set as Default" checkbox only in edit mode */}
          {isEditing && (
            <div className="flex items-center mt-2 lg:mt-0">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set as Default Status</span>
              </label>
            </div>
          )}

          <div className="flex justify-center lg:justify-start gap-3 w-full lg:w-auto">
            <button
              onClick={handleCancel}
              disabled={saving || editLoading}
              className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition disabled:opacity-50 w-full lg:w-auto"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || editLoading}
              className="px-6 py-2 rounded-lg text-white btn-confirm transition disabled:opacity-50 w-full lg:w-auto"
            >
              {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            navigate("/hrm/settings/task-status/bulkupload")
          }
          className="flex items-center justify-center gap-2 
                     bg-blue-600 hover:bg-blue-700 text-white font-medium 
                     px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
                     w-full lg:w-auto"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      {/* Main Loading */}
      {loading && !editLoading && (
        <div className="mt-8 w-full text-center py-8">
          <Loader size="lg" className="mb-4" />
          <p className="text-gray-600">Loading task status...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="mt-8 w-full">
          <TaskStatusTable
            taskStatusList={taskStatusList}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />
        </div>
      )}

      {/* Alerts */}
      {showSuccess && (
        <SweetAlert
          success={!alertMessage.includes("Failed") && !alertMessage.includes("Cannot")}
          error={alertMessage.includes("Failed") || alertMessage.includes("Cannot")}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          title={alertMessage.includes("Failed") || alertMessage.includes("Cannot") ? "Error!" : "Success!"}
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
          onCancel={() => {
            setShowDeleteAlert(false);
            setItemToDelete(null);
          }}
        >
          Do you want to delete this task status?
        </SweetAlert>
      )}
    </div>
  );
}