import React, { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";

// Custom Select Component (UI only)
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-blue-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled || loading ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'} rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {loading ? "Loading..." : (value ? options.find(o => o.value == value)?.name || placeholder : placeholder)}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </div>
            {options.map(option => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option.value)}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CreateTask() {
  // Mock form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedDate: "",
    dueDate: "",
    priority: "",
  });

  // Mock data
  const mockTaskTypes = [
    { value: "1", name: "Development" },
    { value: "2", name: "Design" },
    { value: "3", name: "Testing" },
    { value: "4", name: "Documentation" },
    { value: "5", name: "Meeting" }
  ];

  const mockPriorities = [
    { value: "1", name: "High" },
    { value: "2", name: "Medium" },
    { value: "3", name: "Low" }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  // Mock handlers
  const handleSubmit = () => {
    console.log("Form submitted:", form);
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Task created successfully! (UI Demo)");
      // Reset form
      setForm({
        title: "",
        description: "",
        taskType: "",
        assignedDate: "",
        dueDate: "",
        priority: "",
      });
    }, 1000);
  };

  const handleCancel = () => {
    console.log("Cancel clicked");
    alert("Navigate to tasks list (UI Demo)");
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getSelectedTaskTypeName = () => {
    if (!form.taskType) return '';
    const selected = mockTaskTypes.find(t => t.value == form.taskType);
    return selected ? selected.name : '';
  };

  const getSelectedPriorityName = () => {
    if (!form.priority) return '';
    const selected = mockPriorities.find(p => p.value == form.priority);
    return selected ? selected.name : '';
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#2162C1]" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Add Task</h2>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          onClick={handleCancel}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">Task Information</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Title */}
          <div>
            <label className={labelClass}>Title *</label>
            <input 
              type="text" 
              placeholder="Enter task title" 
              className={inputClass} 
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              maxLength={100} 
            />
            <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea 
              placeholder="Enter task description" 
              className={`${inputClass} min-h-[120px] resize-none`}
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              maxLength={500} 
            />
            <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
          </div>

          {/* Priority */}
          <div>
            <CustomSelect 
              label="Priority *" 
              value={form.priority} 
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={mockPriorities} 
              placeholder="Select priority"
            />
          </div>

          {/* Task Type */}
          <div>
            <CustomSelect 
              label="Task Type *" 
              value={form.taskType} 
              onChange={(e) => setForm({ ...form, taskType: e.target.value })}
              options={mockTaskTypes} 
              placeholder="Select task type"
            />
          </div>

          {/* Assigned Date */}
          <div>
            <label className={labelClass}>Assigned Date & Time *</label>
            <input 
              type="datetime-local" 
              className={inputClass} 
              value={form.assignedDate}
              onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} 
              min={getCurrentDateTime()} 
            />
          </div>

          {/* Due Date */}
          <div>
            <label className={labelClass}>Due Date & Time *</label>
            <input 
              type="datetime-local" 
              className={inputClass} 
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
              min={form.assignedDate || getCurrentDateTime()} 
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Task Preview:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Title:</span>
              <span className="text-gray-900">{form.title || "Not set"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Priority:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                form.priority === "1" ? "bg-red-100 text-red-800" :
                form.priority === "2" ? "bg-yellow-100 text-yellow-800" :
                form.priority === "3" ? "bg-green-100 text-green-800" :
                "text-gray-500"
              }`}>
                {getSelectedPriorityName() || "Not set"}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Task Type:</span>
              <span className="text-gray-900">{getSelectedTaskTypeName() || "Not set"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Assigned:</span>
              <span className="text-gray-900">{form.assignedDate ? new Date(form.assignedDate).toLocaleString() : "Not set"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-32">Due:</span>
              <span className="text-gray-900">{form.dueDate ? new Date(form.dueDate).toLocaleString() : "Not set"}</span>
            </div>
            <div className="md:col-span-2 flex">
              <span className="font-medium text-gray-700 w-32">Description:</span>
              <span className="text-gray-900 flex-1">{form.description || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 text-center">
            This is a UI-only demonstration. All form data is stored locally and not sent to any server.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[140px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : 'Create Task'}
          </button>

          <button 
            onClick={handleCancel}
            className="px-8 py-3 rounded-lg shadow-md text-white bg-gray-600 hover:bg-gray-700 transition-all font-medium min-w-[120px]"
          >
            Cancel
          </button>
        </div>
      </div>


    </div>
  );
}