import React, { useState, useEffect, useRef } from "react";
import { Upload, Edit, Trash2, Building, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../../Academics/Services/college.service";
import { DepartmentService } from "../../Academics/Services/Department.service";
import { useUserProfile } from "../../../../contexts/UserProfileContext";
import SearchBar from "../../../../Components/SearchBar";
import Loader from '../Components/Loader';

/* ----------------------------------------------------
   DEPARTMENT TABLE  (Same UI as Task Type Table)
---------------------------------------------------- */
// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="flex flex-col w-full lg:w-auto">
      <label className="block font-medium mb-1 text-blue-700 text-left">{label}</label>
      <div className="relative">
        <div
          className={`w-full lg:w-64 px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : error ? 'border-red-500' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150 mx-auto lg:mx-0`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value ? options.find(opt => opt.value == value)?.label || placeholder : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect({ value: '', label: placeholder })}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 text-left">{error}</p>
      )}
    </div>
  );
};

const DepartmentTable = ({ departments, onEdit, onDelete, loading = false }) => {
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = departments.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const currentEntries = departments.slice(start, end);

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
                <th className="table-th text-center">Institute</th>
                <th className="table-th text-center">Department</th>
                <th className="table-th text-center">Created Date</th>
                <th className="table-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size="lg" className="mb-4" />
                      <p className="text-gray-500">Loading departments...</p>
                    </div>
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <p className="text-lg font-medium mb-2">
                      No departments found
                    </p>
                    <p className="text-sm">Add departments to see them here.</p>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item, index) => (
                  <tr
                    key={item.department_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {start + index + 1}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.college?.college_name || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.department_name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {new Date(item.created_date || item.createdDate).toLocaleDateString()}
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
                          onClick={() => onDelete(item.department_id)}
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
              <p className="text-gray-500">Loading departments...</p>
            </div>
          </div>
        ) : departments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <p className="text-lg font-medium mb-2 text-gray-500">
              No departments found
            </p>
            <p className="text-sm text-gray-500">
              Add departments to see them here.
            </p>
          </div>
        ) : (
          currentEntries.map((item, index) => (
            <div
              key={item.department_id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <span className="text-sm font-medium text-gray-500">
                Sr No: {start + index + 1}
              </span>

              <h3 className="font-semibold text-gray-900 text-lg mt-2 mb-1">
                {item.department_name}
              </h3>

              <p className="text-sm text-gray-600 flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                Institute: {item.college?.college_name || 'N/A'}
              </p>

              <p className="text-sm text-gray-600">
                Created: {new Date(item.created_date || item.createdDate).toLocaleDateString()}
              </p>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(item.department_id)}
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
                MAIN DEPARTMENT PAGE (UPDATED)
---------------------------------------------------- */
export default function Department() {
  const [departmentName, setDepartmentName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const { userID } = useUserProfile();
  const location = useLocation();
  const departmentInputRef = useRef(null);

  // Identify module from route path
  const isTaskModule = location.pathname.includes("hrm");
  const isAcademicModule = location.pathname.includes("academics");

  const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
  const defaultCollegeId = activeCollege?.id;

  // Fetch colleges from API
  const fetchColleges = async () => {
    try {
      const data = await collegeService.getAllCollegesByUser(userID);
      setColleges(data || []);
    } catch (err) {
      console.error("Failed to fetch Institute", err);
      // setAlertMessage("Could not load colleges for selection.");
      // setShowDeleteSuccessAlert(true);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await DepartmentService.getDepartmentByCollegeId(defaultCollegeId);
      const deptData = response || [];
      // Sort departments by created_date in descending order (newest first)
      const sortedDepartments = deptData.sort((a, b) => 
        new Date(b.created_date || b.createdDate) - new Date(a.created_date || a.createdDate)
      );
      setDepartments(sortedDepartments);
      setFilteredDepartments(sortedDepartments);
    } catch (err) {
      // setAlertMessage("Failed to fetch departments.");
      // setShowDeleteSuccessAlert(true);
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
    if (defaultCollegeId) {
      fetchDepartments();
    } else {
      setLoading(false);
    }
  }, [defaultCollegeId]);

  // Filter departments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter((dept) =>
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.college?.college_name && dept.college.college_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDepartmentName(item.department_name);
    setCollegeId(item.college_id?.toString() || "");
    
    // Scroll to top when editing
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!departmentName.trim()) {
      newErrors.department = "Department Name is required";
    }
    if (!collegeId) {
      newErrors.collegeId = "Institute is required";
    }
    return newErrors;
  };

   const handleSave = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    try {
      setSaving(true);
        
      if (editingItem) {
        // UPDATE API CALL
        const updateData = {
          department_id: parseInt(editingItem.department_id),
          department_name: departmentName.trim(),
          college_id: parseInt(collegeId),
        };
  
        await DepartmentService.updateDepartment(updateData, editingItem.department_id);
        setAlertMessage("Department updated successfully!");
      
      } else {
        // ADD NEW DEPARTMENT
        const departmentData = {
          department_name: departmentName.trim(),
          college_id: parseInt(collegeId),
        };
  
        await DepartmentService.saveDepartment(departmentData);
        setAlertMessage("Department added successfully!");
      }
  
      // LIST REFRESH
      await fetchDepartments();
  
      // FORM RESET
      resetForm();
      
      setShowDeleteSuccessAlert(true);
  
    } catch (err) {
      console.error("Error saving department:", err);
  
      const errorMsg = editingItem 
        ? "Failed to update department. Please try again."
        : "Failed to save department. Please try again.";
  
      setAlertMessage(errorMsg);
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
  
      if (!itemToDelete) return;   
  
      await DepartmentService.deleteDepartment(itemToDelete);  
      await fetchDepartments();

      setShowAlert(false);
      setItemToDelete(null);
      setAlertMessage("Department deleted successfully!");
      setShowDeleteSuccessAlert(true);
  
    } catch (err) {
      console.error("Error deleting department:", err);
  
      setShowAlert(false);
      setItemToDelete(null);
      setAlertMessage("Failed to delete department.");
      setShowDeleteSuccessAlert(true);
  
    }
  };
  

  const resetForm = () => {
    setDepartmentName("");
    setCollegeId("");
    setEditingItem(null);
    setErrors({});
  };

  return (
    <div className="w-full flex flex-col items-center p-0">

      {/* Show Alert when no active college */}
      {!defaultCollegeId && (
        <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-md mb-4 w-full">
          No departments found. <strong>Please set an active institute first.</strong>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 w-full">
        {/* Search Bar */}
        <div className="w-full sm:w-auto">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search departments..."
            className="max-w-md"
          />
        </div>
        
        {/* Bulk Upload Button */}
        <button
          onClick={() =>
            navigate(
              isTaskModule
                ? "/hrm/settings/department/bulkupload"
                : "/academics/department/bulkupload"
            )
          }
          className="flex items-center justify-center gap-2 
                     bg-blue-600 hover:bg-blue-700 text-white font-medium 
                     px-4 py-3 rounded-lg shadow-md transition-all hover:shadow-lg
                     w-full sm:w-auto"
        >
          <Upload className="w-5 h-5" />
          Bulk Upload
        </button>
      </div>

      {/* ⭐ TOP SECTION — WITH Institute DROPDOWN ⭐ */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between w-full px-4 mt-6 gap-4">

        {/* Left Section */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full lg:w-auto">

          {/* Institute Dropdown */}
          <CustomSelect
            label="Institute"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            options={colleges.map(c => ({ value: c.id, label: c.college_name }))}
            placeholder="Select a Institute"
            error={errors.collegeId}
          />

          {/* Department Input */}
          <div className="flex flex-col w-full lg:w-auto">
            <label className="block font-medium mb-1 text-blue-700 text-left">
              Department
            </label>
            <input
              ref={departmentInputRef}
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Enter Department"
              className={`w-full lg:w-64 border rounded px-3 py-2 
                         focus:outline-none transition-colors 
                         ${errors.department ? "border-red-500" : "border-gray-300 focus:border-blue-500"}
                         mx-auto lg:mx-0`}
            />
            {errors.department && (
              <p className="text-red-500 text-sm mt-1 text-left">{errors.department}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-center lg:justify-start gap-3 w-full lg:w-auto">
            <button
              onClick={resetForm}
              className="px-6 py-2 rounded-lg text-gray-700 btn-cancel transition w-full lg:w-auto disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white transition btn-confirm w-full lg:w-auto disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : (editingItem ? "Update" : "Save")}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-8 w-full text-center py-8">
          <p className="text-gray-600">Loading departments...</p>
        </div>
      )}

      {/* Table */}
      <div className="mt-8 w-full">
        <DepartmentTable
          departments={filteredDepartments}
          loading={loading}
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
          Do you want to delete this department?
        </SweetAlert>
      )}

      {/* Success Alert */}
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