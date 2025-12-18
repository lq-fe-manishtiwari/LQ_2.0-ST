import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from '../Components/Loader';
import { Settings } from '../Settings/Settings.service';

/* ----------------------------------------------------
   TASK TYPE TABLE  (SAME UI AS ROLE PAGE)
---------------------------------------------------- */
const TaskTypeTable = ({ taskTypes, onEdit, onDelete, loading = false }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = taskTypes.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;

  const currentEntries = taskTypes.slice(start, end);

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
                <th className="table-th text-center">Task Type</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-gray-500">Loading task types...</p>
                    </div>
                  </td>
                </tr>
              ) : taskTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No task types found</p>
                    <p className="text-sm">Add task types to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr
                    key={item.task_type_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.task_type_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {item.created_date ? new Date(item.created_date).toLocaleDateString() : 'N/A'}
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
                          onClick={() => onDelete(item.task_type_id)}
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
              <p className="text-gray-500">Loading task types...</p>
            </div>
          </div>
        ) : taskTypes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">
              No task types found
            </p>
            <p className="text-sm text-gray-500">
              Add task types to see them here.
            </p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.task_type_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-2 mb-1">
                {item.task_type_name}
              </h3>

              <p className="text-sm text-gray-600">
                Created: {item.created_date ? new Date(item.created_date).toLocaleDateString() : 'N/A'}
              </p>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.task_type_id)}
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
                MAIN TASK TYPE PAGE
---------------------------------------------------- */
export default function TaskType() {
  const [taskTypeName, setTaskTypeName] = useState("");
  const [taskTypes, setTaskTypes] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();

  // Fetch all task types on component mount
  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllTaskType();
      const sortedData = (response || []).sort((a, b) => 
        b.task_type_id - a.task_type_id
      );
      setTaskTypes(sortedData);
    } catch (error) {
      // setAlertMessage("Failed to fetch task types");
      // setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!taskTypeName.trim()) {
      setAlertMessage("Please enter a task type name.");
      setShowSuccess(true);
      return;
    }

    try {
      setSaving(true);

      if (isEditing && editingItem) {
        const updateData = [{
          task_type_id: editingItem.task_type_id,
          task_type_name: taskTypeName.trim()
        }];
        await Settings.updateTaskType(updateData);
        setAlertMessage("Task Type updated successfully!");
      } else {
        const saveData = [{
          task_type_id: null,
          task_type_name: taskTypeName.trim()
        }];
        await Settings.postTaskType(saveData);
        setAlertMessage("Task Type saved successfully!");
      }


      await fetchTaskTypes();
      

      setTaskTypeName("");
      setEditingItem(null);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      setAlertMessage("Failed to save task type");
      setShowSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTaskTypeName("");
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditing(true);
    setTaskTypeName(item.task_type_name);
    
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
      await Settings.deleteTaskType(itemToDelete);
      setItemToDelete(null);
      await fetchTaskTypes();
      
      // Show success message
      setAlertMessage("Task Type deleted successfully!");
      setShowSuccess(true);
      
    } catch (error) {
      setShowDeleteAlert(false);
      setItemToDelete(null);
      await fetchTaskTypes();
      
      setAlertMessage("Failed to delete task type");
      setShowSuccess(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4">

      {/*  MOBILE */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full mt-6 gap-4">

        {/* Left Section */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full lg:w-auto">

          {/* Input Box */}
          <div className="flex flex-col w-full lg:w-auto">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Task Type Name
            </label>

            <input
              type="text"
              value={taskTypeName}
              onChange={(e) => setTaskTypeName(e.target.value)}
              placeholder="Enter Task Type Name"
              className="w-full lg:w-64 border rounded px-3 py-2 
                         focus:outline-none transition-colors 
                         border-gray-300 focus:border-blue-500
                         mx-auto lg:mx-0"
            />
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
          onClick={() =>
            navigate("/hrm/settings/task-type/bulkupload")
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

      {/* Loading State */}
      {loading && (
        <div className="mt-8 w-full text-center py-8">
          <p className="text-gray-600">Loading task types...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="mt-8 w-full">
          <TaskTypeTable
            taskTypes={taskTypes}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />
        </div>
      )}

      {/* Success/Error Alert */}
      {showSuccess && (
        <SweetAlert
          success
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
          Do you want to delete this task type?
        </SweetAlert>
      )}
    </div>
  );
}