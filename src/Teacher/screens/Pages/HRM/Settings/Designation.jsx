import React, { useState } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';

/* ----------------------------------------------------
   DESIGNATION TABLE (Updated: SR NO + Full Width + Mobile)
---------------------------------------------------- */
const DesignationTable = ({ designations, onEdit, onDelete }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = designations.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = designations.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Sr No</th>
                <th className="table-th text-center">Designation</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {designations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No designations found</p>
                    <p className="text-sm">Add designations to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.designation}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {item.createdDate}
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

        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {designations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No designations found</p>
              <p className="text-sm">Add designations to see them here.</p>
            </div>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {item.designation}
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
          ))
        )}

        {/* Mobile Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-4 py-4 bg-white rounded-xl shadow-md border text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
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
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
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
                MAIN DESIGNATION PAGE
---------------------------------------------------- */
export default function Designation() {
  const [designation, setDesignation] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [designations, setDesignations] = useState([
    { id: 1, designation: "Manager", createdDate: "2025-01-15" },
    { id: 2, designation: "Developer", createdDate: "2025-01-14" },
    { id: 3, designation: "Designer", createdDate: "2025-01-13" },
    { id: 4, designation: "Analyst", createdDate: "2025-01-12" },
    { id: 5, designation: "Tester", createdDate: "2025-01-11" },
  ]);

  // Alerts
  const [showAlert, setShowAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();

  const handleEdit = (item) => {
    setEditingItem(item);
    setDesignation(item.designation);
  };

  const handleSave = () => {
    if (!designation.trim()) return;

    if (editingItem) {
      setDesignations((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, designation: designation.trim() }
            : item
        )
      );
      setEditingItem(null);
      setAlertMessage("Designation updated successfully!");

    } else {
      const newDesignation = {
        id: Date.now(),
        designation: designation.trim(),
        createdDate: new Date().toISOString().split("T")[0],
      };

      // NEW ON TOP
      setDesignations((prev) => [newDesignation, ...prev]);

      setAlertMessage("Designation added successfully!");
    }

    setDesignation("");
    setShowDeleteSuccessAlert(true);
    setShowDeleteSuccessAlert(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setDesignations((prev) => prev.filter((item) => item.id !== itemToDelete));
    setShowAlert(false);
    setItemToDelete(null);

    setAlertMessage("Designation deleted successfully!");
    setShowDeleteSuccessAlert(true);
  };

  return (
    <div className="w-full flex flex-col items-center">

      <div className="flex items-end justify-between w-full px-4 mt-6 gap-4 flex-wrap">

  {/* Left Section: Label + Input + Buttons */}
  <div className="flex items-end gap-4 flex-wrap">

    {/* Label + Input */}
    <div className="flex flex-col">
      <label className="block font-medium mb-1 text-blue-700">
        Designation
      </label>

      <input
        type="text"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        placeholder="Enter Designation"
        className="w-64 border rounded px-3 py-2 
                   focus:outline-none transition-colors 
                   border-gray-300 focus:border-blue-500"
      />
    </div>

    {/* Buttons */}
    <div className="flex gap-3">
      <button
        onClick={() => {
          setDesignation("");
          setEditingItem(null);
        }}
        className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        className="px-6 py-2 rounded-lg text-white transition btn-confirm"
      >
        {editingItem ? "Update" : "Save"}
      </button>
    </div>
  </div>

  {/* Right Section: Bulk Upload */}
  <button
    onClick={() => navigate("/hrm/settings/designation/bulkupload")}
    className="flex items-center justify-center gap-2 
               bg-blue-600 hover:bg-blue-700 text-white font-medium 
               px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
               w-full sm:w-auto"
  >
    <Upload className="w-5 h-5" />
    Bulk Upload
  </button>

</div>


      {/* Table (Now Below Buttons) */}
      <div className="mt-8 w-full">
        <DesignationTable
          designations={designations}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowAlert(false);
            setItemToDelete(null);
          }}
        >
          Do you want to delete this designation?
        </SweetAlert>
      )}

      {/* Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          confirmBtnCssClass="btn-confirm"
          title="Success!"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}
