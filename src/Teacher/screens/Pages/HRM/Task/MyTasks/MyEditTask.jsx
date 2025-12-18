import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, X, ChevronDown } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';

// Custom Select Component inside EditTask.js
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

export default function MyTaskEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedDate: "",
    dueDate: "",
    priority: "",
  });

  useEffect(() => {
    // Load task data based on ID
    const mockTask = {
      title: "Sample Task",
      description: "This is a sample task description",
      taskType: "Development",
      assignedDate: "2024-01-15T10:00",
      dueDate: "2024-01-20T17:00",
      priority: "High",
    };
    setForm(mockTask);
  }, [id]);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.taskType || !form.assignedDate || !form.dueDate || !form.priority) {
      setAlertMessage('Please fill in all required fields.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setAlertMessage('Task updated successfully!');
        setShowSuccessAlert(true);
      } else {
        setAlertMessage('Failed to update task. Please try again.');
        setShowErrorAlert(true);
      }
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/hrm/tasks/my-tasks");
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Edit className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Edit Task
          </h2>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Task Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="w-full">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              placeholder="enter title"
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Description</label>
            <input
              type="text"
              placeholder="enter description"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={['High', 'Medium', 'Low']}
              placeholder="select priority"
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Assigned Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.assignedDate}
              onChange={(e) => setForm({ ...form, assignedDate: e.target.value })}
              placeholder="select date & time"
            />
          </div>

          <div className="w-full">
            <label className={labelClass}>Due Date & Time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              placeholder="select due date"
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Task Type"
              value={form.taskType}
              onChange={(e) => setForm({ ...form, taskType: e.target.value })}
              options={['Development', 'Testing', 'Design', 'Documentation', 'Review', 'Meeting']}
              placeholder="select task type"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update'
            )}
          </button>
          
          <button 
            onClick={handleCancel}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/hrm/tasks/my-tasks");
          }}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
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