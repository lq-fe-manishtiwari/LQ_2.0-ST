import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { useNavigate } from "react-router-dom";
import Loader from '../Components/Loader';

/* ----------------------------------------------------
   TABLE COMPONENT (Same UI + Pagination as ROLE PAGE)
---------------------------------------------------- */
const AccessLevelTable = ({ accessLevels, onEdit, onDelete, loading = false }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = accessLevels.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = accessLevels.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Sr No</th>
                <th className="table-th text-center">Access Level</th>
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
                      <p className="text-gray-500">Loading access levels...</p>
                    </div>
                  </td>
                </tr>
              ) : accessLevels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No access levels found</p>
                    <p className="text-sm">Add an access level to see it here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-sm">
                      {start + index + 1}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-center text-sm">{item.createdDate}</td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(item.id)}
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
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t text-sm text-gray-600">
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

            <span className="font-semibold text-gray-700">
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 mt-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <Loader size="lg" className="mb-4" />
              <p className="text-gray-500">Loading access levels...</p>
            </div>
          </div>
        ) : currentEntries.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
          >
            <span className="text-sm text-gray-500">
              Sr No: {start + index + 1}
            </span>

            <h3 className="font-semibold text-gray-900 text-lg mt-2">
              {item.name}
            </h3>

            <p className="text-sm text-gray-600">Created: {item.createdDate}</p>

            <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => onEdit(item)}
                className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-4 py-4 bg-white rounded-xl shadow-md border text-sm">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-blue-200"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-semibold">
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages
                  ? "bg-blue-200"
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
          MAIN USER ACCESS LEVEL PAGE
---------------------------------------------------- */
export default function UserAccessLevel() {
  const [level, setLevel] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const [accessLevels, setAccessLevels] = useState([
    { id: 1, name: "Admin", createdDate: "2025-01-10" },
    { id: 2, name: "Editor", createdDate: "2025-01-11" },
  ]);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  /* Save / Update */
  const handleSave = () => {
    if (!level.trim()) return;

    if (editingItem) {
      setAccessLevels(prev =>
        prev.map(item =>
          item.id === editingItem.id ? { ...item, name: level.trim() } : item
        )
      );
      setSuccessMsg("Access Level updated successfully!");
    } else {
      const newItem = {
        id: Date.now(),
        name: level.trim(),
        createdDate: new Date().toISOString().split("T")[0],
      };
      setAccessLevels(prev => [newItem, ...prev]);
      setSuccessMsg("Access Level added successfully!");
    }

    setLevel("");
    setEditingItem(null);
    setShowSuccessAlert(true);
  };

  /* Edit */
  const handleEdit = item => {
    setEditingItem(item);
    setLevel(item.name);
  };

  /* Delete */
  const handleDelete = id => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setAccessLevels(prev => prev.filter(item => item.id !== deleteId));
    setShowDeleteConfirm(false);
    setSuccessMsg("Access Level deleted successfully!");
    setShowSuccessAlert(true);
  };

  return (
    <div className="w-full flex flex-col items-center">

      {/* TOP SECTION — Desktop same / Mobile centered */}
      <div className="
        flex flex-col
        lg:flex-row
        lg:items-end
        lg:justify-between
        w-full px-4 mt-6 gap-4">

        {/* Left Side */}
        <div className="
          flex flex-col
          lg:flex-row
          lg:items-end
          gap-4 
          w-full
          lg:w-auto">

          {/* Label + Input */}
          <div className="flex flex-col w-full lg:w-auto">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Access Level
            </label>

            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Enter Access Level"
              className="
                w-full lg:w-64
                border rounded px-3 py-2
                border-gray-300 
                focus:border-blue-500 
                focus:outline-none
                mx-auto lg:mx-0"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-center lg:justify-start gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                setLevel("");
                setEditingItem(null);
              }}
              className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition w-full lg:w-auto"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white btn-confirm transition w-full lg:w-auto"
            >
              {editingItem ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* Right Side */}
        <button
          onClick={() =>
            navigate("/hrm/settings/user-access-level/bulkupload")
          }
          className="
            flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700 text-white font-medium
            px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
            w-full lg:w-auto"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      {/* TABLE */}
      <div className="mt-8 w-full">
        <AccessLevelTable
          accessLevels={accessLevels}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* DELETE POPUP */}
      {showDeleteConfirm && (
        <SweetAlert
          warning
          showCancel
          title="Are you sure?"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        >
          Do you want to delete this access level?
        </SweetAlert>
      )}

      {/* SUCCESS POPUP */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMsg}
        </SweetAlert>
      )}
    </div>
  );
}
