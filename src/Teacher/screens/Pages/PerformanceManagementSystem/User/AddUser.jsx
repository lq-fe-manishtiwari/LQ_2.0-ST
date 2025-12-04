import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Plus, ChevronDown, X, Edit } from 'lucide-react';

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
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
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-blue-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AddUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    designation: "",
    department: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(isEditMode);

  // Dummy options
  const roleOptions = ["TEACHER", "ADMIN", "STAFF"];
  const designationOptions = ["SeniorTeacher", "Administrator", "Teacher", "Assistant"];
  const departmentOptions = ["Mathematics", "Science", "English", "Administration", "IT"];

  // Dummy user data for edit mode
  const dummyUsers = {
    1: { name: "John Doe", email: "john.doe@example.com", phone: "9876543210", role: "TEACHER", designation: "SeniorTeacher", department: "Mathematics" },
    2: { name: "Jane Smith", email: "jane.smith@example.com", phone: "9876543211", role: "ADMIN", designation: "Administrator", department: "Administration" },
    3: { name: "Mike Johnson", email: "mike.johnson@example.com", phone: "9876543212", role: "TEACHER", designation: "Teacher", department: "Science" }
  };

  // Load user data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const userData = dummyUsers[id];
        if (userData) {
          setFormData(userData);
        }
        setLoading(false);
      }, 500);
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Custom classes
  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.role || !formData.designation || !formData.department) {
      setAlertMessage("Please fill in all required fields.");
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setAlertMessage(`User ${isEditMode ? 'updated' : 'added'} successfully!`);
      setShowSuccessAlert(true);
    }, 1000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 ml-4">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <Edit className="w-6 h-6 text-[#2162C1]" />
          ) : (
            <Plus className="w-6 h-6 text-[#2162C1]" />
          )}
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            {isEditMode ? 'Edit User' : 'Add User'}
          </h2>
        </div>

        {/* RIGHT: CLOSE BUTTON */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* -------------------------------------------------- */}
      {/*        USER INFORMATION SECTION                    */}
      {/* -------------------------------------------------- */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          User Information
        </h2>
        {/* ⭐ Responsive Grid - 2 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Name */}
          <div className="w-full">
            <label className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="enter full name"
              className={inputClass}
              required
            />
          </div>

          {/* Email */}
          <div className="w-full">
            <label className={labelClass}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="enter email address"
              className={inputClass}
              required
            />
          </div>

          {/* Phone */}
          <div className="w-full">
            <label className={labelClass}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="enter phone number"
              className={inputClass}
            />
          </div>

          {/* Role */}
          <div className="w-full">
            <CustomSelect
              label="Role"
              value={formData.role}
              onChange={handleSelectChange('role')}
              options={roleOptions}
              placeholder="select role"
            />
          </div>

          {/* Designation */}
          <div className="w-full">
            <CustomSelect
              label="Designation"
              value={formData.designation}
              onChange={handleSelectChange('designation')}
              options={designationOptions}
              placeholder="select designation"
            />
          </div>

          {/* Department */}
          <div className="w-full">
            <CustomSelect
              label="Department"
              value={formData.department}
              onChange={handleSelectChange('department')}
              options={departmentOptions}
              placeholder="select department"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-confirm px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isEditMode ? 'Updating...' : 'Adding...'}</span>
              </div>
            ) : (
              isEditMode ? 'Update' : 'Submit'
            )}
          </button>
          
          <button 
            onClick={handleCancel}
            className="btn-cancel px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={handleSuccessConfirm}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <SweetAlert
          error
          title="Validation Error"
          onConfirm={() => setShowErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}