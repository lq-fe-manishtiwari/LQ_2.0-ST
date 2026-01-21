import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Edit, X, ChevronDown, Plus, Minus, ExternalLink } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { TaskManagement } from '../../Services/TaskManagement.service';
import { Settings } from '../../Settings/Settings.service';
import { HRMManagement } from '../../Services/hrm.service';

// Custom Select Component inside EditTask.js
// Custom Select Component (Updated to match CreateNewTasks)
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const handleSelect = (selectedValue) => {
    onChange({ target: { value: selectedValue } });
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

export default function EditPersonalTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const taskData = location.state?.taskData;

  // Helper function to safely format date
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  // Initialize form with passed data or empty values
  const [form, setForm] = useState({
    title: taskData?.title || "",
    description: taskData?.description || "",
    taskType: taskData?.task_type?.task_type_name || "",
    taskTypeId: taskData?.task_type?.task_type_id || "",
    assignedDate: formatDateForInput(taskData?.assigned_date_time),
    dueDate: formatDateForInput(taskData?.due_date_time),
    priority: taskData?.priority?.priority_name || "",
    priorityId: taskData?.priority?.priority_id || "",
    status: taskData?.status?.name || "",
    statusId: taskData?.status?.task_status_id || "",
  });

  // Documents state - array of document objects
  const [documentRows, setDocumentRows] = useState(() => {
    if (taskData) {
      const supportingDocs = taskData.supporting_document || taskData.task?.supporting_document;
      if (supportingDocs && supportingDocs.length > 0) {
        return supportingDocs.map((doc, index) => ({
          id: `supporting-${Date.now()}-${index}`,
          name: doc.name || "",
          uploadedUrl: doc.url || doc.link || doc.file_path || doc.document_url || "",
          file: null,
          uploading: false
        }));
      }
    }
    return [{ id: Date.now(), name: '', file: null, uploadedUrl: '', uploading: false }];
  });

  const [priorities, setPriorities] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prioritiesData, taskTypesData, statusesData] = await Promise.all([
          Settings.getAllPriority(),
          Settings.getAllTaskType(),
          Settings.getAllTaskStatus()
        ]);

        setPriorities(prioritiesData || []);
        setTaskTypes(taskTypesData || []);
        setStatuses(statusesData || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Only fetch from API if no data was passed
  useEffect(() => {
    if (id && !loading && !taskData) {
      const currentUser = JSON.parse(localStorage.getItem("userProfile"));
      const userId = currentUser?.user?.user_id;
      
      if (!userId) {
        setAlertMessage('User not found. Please login again.');
        setShowErrorAlert(true);
        return;
      }

      TaskManagement.getUserTodoById(id, userId)
        .then(response => {
          if (response) {
            setForm({
              title: response.title || "",
              description: response.description || "",
              taskType: response.task_type?.task_type_name || "",
              taskTypeId: response.task_type?.task_type_id || "",
              assignedDate: response.created_at ? response.created_at.slice(0, 16) : "",
              dueDate: response.due_date_time ? response.due_date_time.slice(0, 16) : "",
              priority: response.priority?.priority_name || "",
              priorityId: response.priority?.priority_id || "",
              status: response.status?.name || "",
              statusId: response.status?.task_status_id || "",
            });

            // Load Supporting Documents
            const supportingDocs = response.supporting_document || response.task?.supporting_document;
            if (supportingDocs && supportingDocs.length > 0) {
              const rows = supportingDocs.map((doc, index) => ({
                id: `supporting-${Date.now()}-${index}`,
                name: doc.name || "",
                uploadedUrl: doc.url || doc.link || doc.file_path || doc.document_url || "",
                file: null,
                uploading: false
              }));
              setDocumentRows(rows);
            } else {
              setDocumentRows([{ id: Date.now(), name: '', file: null, uploadedUrl: '', uploading: false }]);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching task:', error);
          setAlertMessage('Failed to load task data.');
          setShowErrorAlert(true);
        });
    }
  }, [id, loading, taskData]);

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass = "w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500";
  const labelClass = "block text-sm font-semibold text-blue-700 mb-2";

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.taskTypeId || !form.dueDate || !form.priorityId || !form.statusId) {
      setAlertMessage('Please fill in all required fields.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);

    const currentUser = JSON.parse(localStorage.getItem("userProfile"));
    const userId = currentUser?.user?.user_id || null;

    // Prepare supporting documents array
    const supportingDocuments = documentRows
      .filter(row => row.uploadedUrl && row.name) // Only include uploaded documents with names
      .map(row => ({
        name: row.name,
        url: row.uploadedUrl
      }));

    const payload = {
      user_id: userId,
      title: form.title,
      description: form.description,
      priority_id: parseInt(form.priorityId),
      due_date_time: form.dueDate ? (form.dueDate.length === 16 ? form.dueDate + ":00" : form.dueDate) : null,
      task_type_id: parseInt(form.taskTypeId),
      status_id: parseInt(form.statusId),
      remarks: form.description,
      supporting_document: supportingDocuments
    };

    TaskManagement.updateUserTodo(id, payload)
      .then(response => {
        setIsSubmitting(false);
        setAlertMessage('Task updated successfully!');
        setShowSuccessAlert(true);
      })
      .catch(error => {
        setIsSubmitting(false);
        console.error('Error updating task:', error);
        setAlertMessage('Failed to update task. Please try again.');
        setShowErrorAlert(true);
      });
  };

  // Document handlers
  const handleAddDocumentRow = () => {
    setDocumentRows([
      ...documentRows,
      { id: Date.now(), name: '', file: null, uploadedUrl: '', uploading: false }
    ]);
  };

  const handleRemoveDocumentRow = (id) => {
    if (documentRows.length > 1) {
      setDocumentRows(documentRows.filter(row => row.id !== id));
    }
  };

  const handleDocumentNameChange = (id, value) => {
    setDocumentRows(documentRows.map(row =>
      row.id === id ? { ...row, name: value } : row
    ));
  };

  const handleDocumentFileChange = async (id, file) => {
    if (!file) return;

    setDocumentRows(documentRows.map(row =>
      row.id === id ? { ...row, file, uploading: true } : row
    ));

    try {
      const uploadedUrl = await HRMManagement.uploadFileToS3(file);
      setDocumentRows(documentRows.map(row =>
        row.id === id ? { ...row, uploadedUrl, uploading: false } : row
      ));
    } catch (error) {
      console.error('Upload error:', error);
      setAlertMessage('Failed to upload file. Please try again.');
      setShowErrorAlert(true);
      setDocumentRows(documentRows.map(row =>
        row.id === id ? { ...row, uploading: false } : row
      ));
    }
  };

  const handleCancel = () => {
    navigate("/teacher/hrm/tasks/personal-tasks");
  };

  return (
    <div className="w-full flex flex-col gap-8 p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {/* <Edit className="w-6 h-6 text-[#2162C1]" /> */}
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Edit Personal Task
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
              value={form.priorityId}
              onChange={(e) => setForm({
                ...form,
                priorityId: e.target.value,
                priority: priorities.find(p => p.priority_id == e.target.value)?.priority_name || ''
              })}
              options={priorities.map(p => ({ value: p.priority_id, name: p.priority_name }))}
              placeholder="select priority"
              disabled={loading}
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
              value={form.taskTypeId}
              onChange={(e) => setForm({
                ...form,
                taskTypeId: e.target.value,
                taskType: taskTypes.find(t => t.task_type_id == e.target.value)?.task_type_name || ''
              })}
              options={taskTypes.map(t => ({ value: t.task_type_id, name: t.task_type_name }))}
              placeholder="select task type"
              disabled={loading}
            />
          </div>

          <div className="w-full">
            <CustomSelect
              label="Status"
              value={form.statusId}
              onChange={(e) => setForm({
                ...form,
                statusId: e.target.value,
                status: statuses.find(s => s.task_status_id == e.target.value)?.name || ''
              })}
              options={statuses.map(s => ({ value: s.task_status_id, name: s.name }))}
              placeholder="select status"
              disabled={loading}
            />
          </div>
        </div>

        {/* DOCUMENTS SECTION */}
        <div className="mt-10 bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">
              Documents
            </h2>
            <button
              onClick={handleAddDocumentRow}
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Row</span>
            </button>
          </div>

          <div className="space-y-4">
            {documentRows.map((row, index) => (
              <div key={row.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Document Name */}
                <div className="flex-1 w-full">
                  <label className={labelClass}>
                    Document Name {index + 1}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter document name"
                    className={inputClass}
                    value={row.name}
                    onChange={(e) => handleDocumentNameChange(row.id, e.target.value)}
                  />
                </div>

                {/* File Upload */}
                <div className="flex-1 w-full">
                  <label className={labelClass}>
                    Select File
                  </label>
                  <input
                    type="file"
                    className={`${inputClass} cursor-pointer`}
                    onChange={(e) => handleDocumentFileChange(row.id, e.target.files[0])}
                    accept="*/*"
                    disabled={row.uploading}
                  />
                </div>

                {/* View Document */}
                <div className="flex-1 w-full">
                  <label className={labelClass}>
                    View Document
                  </label>
                  <div className="w-full px-3 py-2 border rounded-lg min-h-[44px] flex items-center justify-between bg-white border-gray-300">
                    {row.uploading ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Uploading...</span>
                      </div>
                    ) : row.uploadedUrl && row.name ? (
                      <a
                        href={row.uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <span className="text-sm font-medium truncate">{row.name}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">No file uploaded</span>
                    )}
                  </div>
                </div>

                {/* Remove Row */}
                <div className="flex items-end">
                  <button
                    onClick={() => handleRemoveDocumentRow(row.id)}
                    disabled={documentRows.length === 1}
                    className={`p-2 rounded-lg transition-all ${
                      documentRows.length === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Success summary */}
          {documentRows.some(row => row.uploadedUrl) && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ {documentRows.filter(row => row.uploadedUrl).length} document(s) uploaded successfully
              </p>
            </div>
          )}
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
            navigate("/teacher/hrm/tasks/personal-tasks");
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
