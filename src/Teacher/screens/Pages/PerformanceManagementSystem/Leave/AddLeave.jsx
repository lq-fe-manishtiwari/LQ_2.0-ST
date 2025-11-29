import React, { useState, useRef, useEffect } from "react";
import { Calendar, X, Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';

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

export default function AddLeave() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    department: "",
    name: "",
    subject: ""
  });

  // Alert States
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.department || !formData.name || !formData.subject) {
      setAlertMessage('Please fill in all required fields.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setAlertMessage('Leave request submitted successfully!');
      setShowSuccessAlert(true);
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/pms/leave");
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Add Leave
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
      {/*        LEAVE INFORMATION SECTION                   */}
      {/* -------------------------------------------------- */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Leave Information
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* ⭐ Responsive Grid - 2 columns layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* Leave Type */}
            <div className="w-full">
              <CustomSelect
                label="Leave Type"
                value={formData.leaveType}
                onChange={handleChange}
                options={['Sick Leave', 'Vacation', 'Personal Leave', 'Emergency Leave']}
                placeholder="select leave type"
              />
            </div>

            {/* From Date */}
            <div className="w-full">
              <label className={labelClass}>From Date</label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* To Date */}
            <div className="w-full">
              <label className={labelClass}>To Date</label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Department */}
            <div className="w-full">
              <CustomSelect
                label="Department"
                value={formData.department}
                onChange={handleChange}
                options={['Human Resources', 'IT', 'Finance', 'Marketing']}
                placeholder="select department"
              />
            </div>

            {/* Name */}
            <div className="w-full">
              <CustomSelect
                label="Name"
                value={formData.name}
                onChange={handleChange}
                options={['John Doe', 'Jane Smith', 'Mike Johnson']}
                placeholder="select name"
              />
            </div>

            {/* Subject */}
            <div className="w-full">
              <label className={labelClass}>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="add subject for leave"
                className={inputClass}
                required
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit'
              )}
            </button>
            
            <button 
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/pms/leave");
          }}
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
          title="Error!"
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