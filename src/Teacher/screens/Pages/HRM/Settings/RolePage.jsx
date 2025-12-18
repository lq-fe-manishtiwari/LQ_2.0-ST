import React, { useState, useEffect, useRef } from "react";
import { Upload, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Settings } from '../Settings/Settings.service';
import Loader from '../Components/Loader';

/* ----------------------------------------------------
   ROLE TABLE  (SAME UI AS DEPARTMENT & DESIGNATION)
---------------------------------------------------- */
const RoleTable = ({ roles, onEdit, onDelete }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = roles.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;

  const currentEntries = roles.slice(start, end);

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
                <th className="table-th text-center">Role</th>
                <th className="table-th text-center">Description</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No roles found</p>
                    <p className="text-sm">Add roles to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr key={item.role_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {item.description}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {new Date(item.createddate).toLocaleDateString()}
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
                          onClick={() => onDelete(item.role_id)}
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
              Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
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
        {roles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">No roles found</p>
            <p className="text-sm text-gray-500">Add roles to see them here.</p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.role_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-2 mb-1">
                {item.name}
              </h3>

              <p className="text-sm text-gray-600 mb-2">{item.description}</p>

              <p className="text-sm text-gray-600">Created: {new Date(item.createddate).toLocaleDateString()}</p>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.role_id)}
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
                MAIN ROLE PAGE
---------------------------------------------------- */
export default function RolePage() {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const roleNameInputRef = useRef(null); 
  // Fetch all roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await Settings.getAllRole();
      // Sort roles by createddate in descending order (newest first)
      const sortedRoles = (response || []).sort((a, b) => 
        new Date(b.createddate) - new Date(a.createddate)
      );
      setRoles(sortedRoles);
    } catch (error) {
      // setAlertMessage("Failed to fetch roles");
      // setShowDeleteSuccessAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setRoleName(item.name);
    setRoleDescription(item.description || "");
    
    // Scroll to top and focus on input field when editing
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
     }, 100);
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setAlertMessage("Please enter a role name");
      setShowDeleteSuccessAlert(true);
      return;
    }

    try {
      setSaving(true);
      const roleData = {
        name: roleName.trim(),
        description: roleDescription.trim() 
      };

      if (editingItem) {
        // Update existing role
        await Settings.updateRole(roleData, editingItem.role_id);
        setAlertMessage("Role updated successfully!");
      } else {
        // Create new role
        await Settings.postRole(roleData);
        setAlertMessage("Role added successfully!");
      }

      // Refresh the roles list - this will automatically sort with newest first
      await fetchRoles();      
      // Reset form
      resetForm();
      
      setShowDeleteSuccessAlert(true);
    } catch (error) {
      setAlertMessage("Failed to save role");
      setShowDeleteSuccessAlert(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete role using the API
      await Settings.deleteRole(itemToDelete);
      
      // Refresh the roles list
      await fetchRoles();
      
      setShowAlert(false);
      setItemToDelete(null);
      setAlertMessage("Role deleted successfully!");
      setShowDeleteSuccessAlert(true);
    } catch (error) {
      setAlertMessage("Failed to delete role");
      setShowDeleteSuccessAlert(true);
    }
  };

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setEditingItem(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full px-4 mt-6 gap-4">
        {/* Input Fields + Buttons Section */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full lg:w-auto">
          {/* Input Fields */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Role Name Input */}
            <div className="flex flex-col w-full sm:w-64">
              <label className="block font-medium mb-1 text-blue-700">Role Name</label>
              <input
                ref={roleNameInputRef}
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter Role Name"
                className="w-full border rounded px-3 py-2 
                          focus:outline-none transition-colors 
                          border-gray-300 focus:border-blue-500"
              />
            </div>

            {/* Role Description Input */}
            <div className="flex flex-col w-full sm:w-64">
              <label className="block font-medium mb-1 text-blue-700">Description</label>
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Enter Description"
                className="w-full border rounded px-3 py-2 
                          focus:outline-none transition-colors 
                          border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={resetForm}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-gray-700 btn-cancel transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-white transition btn-confirm disabled:opacity-50"
            >
              {saving ? "Saving..." : (editingItem ? "Update" : "Save")}
            </button>
          </div>
        </div>

        {/* Bulk Upload Button */}
        <button
          onClick={() => navigate("/hrm/settings/role/bulkupload")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg justify-center w-full lg:w-auto"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 w-full text-center py-8">
          <Loader size="lg" className="mb-4" />
        </div>
      )}

      {/* TABLE BELOW BUTTONS */}
      {!loading && (
        <div className="mt-8 w-full">
          <RoleTable 
            roles={roles} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      )}

      {/* Delete Popup */}
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
          Do you want to delete this role?
        </SweetAlert>
      )}

      {/* Success/Error Popup */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          confirmBtnCssClass="btn-confirm"
          title={alertMessage.includes("Failed") ? "Error!" : "Success!"}
          onConfirm={() => setShowDeleteSuccessAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}