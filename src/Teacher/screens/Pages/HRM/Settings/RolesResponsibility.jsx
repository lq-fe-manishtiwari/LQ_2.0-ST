import React, { useState, useEffect } from "react";
import { Upload, Edit, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from '../Components/Loader';
import { Settings } from '../Settings/Settings.service';

/* ----------------------------------------------------
   ROLES & RESPONSIBILITY TABLE  (WITH MOBILE VIEW)
---------------------------------------------------- */
const RrTable = ({ rrList, onEdit, onDelete, loading }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = rrList.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = rrList.slice(start, end);

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  const PaginationControls = ({ isMobile = false }) => (
    <div className={`flex justify-between items-center ${isMobile ? 'px-4 py-4 bg-white rounded-xl shadow-md border border-gray-200' : 'px-6 py-4 border-t border-gray-200'} text-sm text-gray-600`}>
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

      <span className={`text-gray-700 font-medium ${isMobile ? 'text-xs sm:text-sm' : 'font-semibold'}`}>
        {isMobile ? `${start + 1}–${Math.min(end, totalEntries)} of ${totalEntries}` : `Showing ${start + 1}–${Math.min(end, totalEntries)} of ${totalEntries} entries`}
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
  );

  const LoadingState = ({ colSpan, isMobile = false }) => {
    const content = (
      <div className="flex flex-col items-center justify-center">
        <Loader size="lg" className="mb-4" />
        <p className="text-gray-500">Loading roles & responsibilities...</p>
      </div>
    );

    return isMobile ? (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
        {content}
      </div>
    ) : (
      <tr>
        <td colSpan={colSpan} className="px-6 py-10 text-center bg-white text-gray-600">
          {content}
        </td>
      </tr>
    );
  };

  const EmptyState = ({ colSpan, isMobile = false }) => {
    const content = (
      <>
        <p className="text-lg font-medium mb-2 text-gray-500">
          No roles & responsibilities found
        </p>
        <p className="text-sm text-gray-500">
          Add roles & responsibilities to see them here.
        </p>
      </>
    );

    return isMobile ? (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
        {content}
      </div>
    ) : (
      <tr>
        <td colSpan={colSpan} className="px-6 py-10 text-center bg-white text-gray-600">
          {content}
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full mt-8">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Sr No</th>
                <th className="table-th text-center">Roles & Responsibility</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <LoadingState colSpan={4} />
              ) : totalEntries === 0 ? (
                <EmptyState colSpan={4} />
              ) : (
                currentEntries.map((item, index) => (
                  <tr
                    key={item.roles_responsibility_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.roles_responsibility}
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
                          onClick={() => onDelete(item.roles_responsibility_id)}
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

        {totalEntries > 0 && !loading && <PaginationControls />}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 mt-8">
        {loading ? (
          <LoadingState isMobile />
        ) : totalEntries === 0 ? (
          <EmptyState isMobile />
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.roles_responsibility_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-2 mb-1">
                {item.roles_responsibility}
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
                  onClick={() => onDelete(item.roles_responsibility_id)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {totalEntries > 0 && !loading && <PaginationControls isMobile />}
      </div>
    </>
  );
};

/* ----------------------------------------------------
                MAIN PAGE
---------------------------------------------------- */
export default function RolesResponsibility() {
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState(["", ""]);
  const [rrList, setRrList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch all roles & responsibilities on component mount
  useEffect(() => {
    fetchRolesResponsibility();
  }, []);

  const fetchRolesResponsibility = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllRoleResponsibility();
      const sortedData = (response || []).sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
      setRrList(sortedData);
    } catch (error) {
      console.error('Fetch error:', error);
      // let errorMsg = "Failed to fetch roles & responsibilities";
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
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...roles];
    updated[index] = value;
    setRoles(updated);
  };

  const handleAddNew = () => {
    setRoles((prev) => [...prev, ""]);
  };

  const handleRemove = (index) => {
    if (roles.length <= 2) return;
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const trimmed = roles.map(r => r.trim()).filter(r => r !== "");

    if (trimmed.length === 0) {
      setAlertMessage("Please fill at least one Roles & Responsibility.");
      setShowSuccess(true);
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing && editingItem) {
        const response = await Settings.updateRoleResponsibility({
          roles_responsibility_id: editingItem.roles_responsibility_id,
          roles_responsibility: trimmed[0]
        });
        setAlertMessage(typeof response === 'string' ? response : "Role & Responsibility updated successfully!");
      } else {
        const response = await Settings.postRoleResponsibility({ roles_responsibilities: trimmed });
        setAlertMessage(typeof response === 'string' ? response : "Roles & Responsibilities saved successfully!");
      }

      await fetchRolesResponsibility();
      setRoles(["", ""]);
      setEditingItem(null);
      setIsEditing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Save error:', error);
      let errorMsg = "Failed to save roles & responsibilities";
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
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRoles(["", ""]);
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleEditRow = (item) => {
    setEditingItem(item);
    setIsEditing(true);
    setRoles([item.roles_responsibility, ""]);
    
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
      await Settings.deleteRoleResponsibility(itemToDelete);
      setItemToDelete(null);
      await fetchRolesResponsibility();
      setAlertMessage("Deleted successfully");
      setShowSuccess(true);
    } catch (error) {
      console.error('Delete error:', error);
      setShowDeleteAlert(false);
      setItemToDelete(null);
      await fetchRolesResponsibility();
      
      let errorMsg = "Failed to delete role & responsibility";
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

  return (
    <div className="w-full flex flex-col items-center px-4">
      <div className="w-full mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT — ROLES INPUT GRID */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {roles.map((role, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-blue-600 font-medium mb-1">
                    {index + 1}. Roles & Responsibility
                  </label>

                  <div className="flex items-center gap-2">

                    <input
                      type="text"
                      value={role}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder="Enter Roles & Responsibility"
                      className="w-full border rounded px-3 py-2 border-gray-300 
                                 focus:border-blue-500 focus:outline-none"
                    />

                    {/*  ADD BUTTON */}
                    {index === roles.length - 1 && (
                      <button
                        onClick={handleAddNew}
                        className="p-1 bg-green-600 text-white rounded-full 
                                   flex items-center justify-center hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {/* REMOVE BUTTON */}
                    {roles.length > 2 && (
                      <button
                        onClick={() => handleRemove(index)}
                        className="p-1 bg-red-500 text-white rounded-full 
                                   flex items-center justify-center hover:bg-red-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* RIGHT SECTION — DESKTOP BUTTONS  */}
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
                navigate("/hrm/settings/roles-responsibility/bulkupload")
              }
              className="flex items-center justify-center gap-2 
                         bg-blue-600 hover:bg-blue-700 text-white font-medium 
                         px-4 py-3 rounded-lg shadow-md transition"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>

          </div>

          {/*  MOBILE BUTTON ROW  */}
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
                navigate("/hrm/settings/roles-responsibility/bulkupload")
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



      {/* TABLE */}
      {!loading && (
        <div className="w-full mt-10">
          <RrTable 
            rrList={rrList} 
            onEdit={handleEditRow}
            onDelete={handleDeleteRequest}
            loading={loading}
          />
        </div>
      )}

      {/* Success/Error Alert */}
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
          Do you want to delete this role & responsibility?
        </SweetAlert>
      )}
    </div>
  );
}