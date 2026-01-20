import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, Download, FileText, X, CheckCircle, AlertCircle,
  Trash2, Filter, Link, Eye, EyeOff, FileUp,
  ChevronLeft, ChevronRight, Info, BarChart3
} from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from 'react-bootstrap-sweetalert';
import { Settings } from '../../Settings/Settings.service';
import { TaskManagement } from '../../Services/TaskManagement.service';
import { HRMManagement } from '../../Services/hrm.service';

export default function BulkUploadPersonalTask() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);
  const previewTableRef = useRef(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter states
  const [selectedRole, setSelectedRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination for preview table
  const [previewPage, setPreviewPage] = useState(1);
  const previewPageSize = 5;

  // Template data
  const templateData = [
    {
      "Title*": "Complete project report",
      "Description": "Finalize the Q4 project report with team inputs",
      "Task Type*": "Documentation",
      "Task Type Role": "Technical",
      "Priority*": "High",
      // "Assigned Date Time*": "2024-01-15 09:00",
      "Due Date Time*": "2024-01-20 17:00"
    },
    {
      "Title*": "Client meeting preparation",
      "Description": "Prepare presentation for client review meeting",
      "Task Type*": "Meeting",
      "Task Type Role": "Managerial",
      "Priority*": "Medium",
      // "Assigned Date Time*": "2024-01-16 10:00",
      "Due Date Time*": "2024-01-18 15:00"
    }
  ];

  // Get unique roles from task types
  const uniqueRoles = [...new Set(taskTypes
    .map(t => t.task_type_role)
    .filter(Boolean)
    .sort()
  )];

  useEffect(() => {
    const getUserIdFromStorage = () => {
      let userId = localStorage.getItem("currentUserId") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        localStorage.getItem("id") ||
        localStorage.getItem("UserID") ||
        localStorage.getItem("uid");

      if (!userId) {
        userId = sessionStorage.getItem("currentUserId") ||
          sessionStorage.getItem("userId") ||
          sessionStorage.getItem("user_id") ||
          sessionStorage.getItem("id") ||
          sessionStorage.getItem("UserID") ||
          sessionStorage.getItem("uid");
      }

      if (!userId) {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userId = user.id || user.userId || user.user_id || user.UserID || user.uid;
          } catch (e) {
            console.error("Error parsing user object:", e);
          }
        }
      }

      if (!userId) {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            userId = payload.userId || payload.user_id || payload.id || payload.sub;
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }
      }

      return userId ? parseInt(userId, 10) : null;
    };

    const userId = getUserIdFromStorage();
    if (userId && !isNaN(userId)) {
      setCurrentUserId(userId);
    } else {
      setAlertMessage("User not authenticated. Please login again.");
      setShowErrorAlert(true);
    }

    // Fetch task types and priorities
    Promise.all([
      Settings.getAllTaskType(),
      Settings.getAllPriority()
    ])
      .then(([taskTypesRes, prioritiesRes]) => {
        const types = taskTypesRes?.data || taskTypesRes || [];
        const uniqueTypes = [];
        const seenIds = new Set();

        types.forEach(type => {
          const typeId = type.task_type_id || type.id;
          if (typeId && !seenIds.has(typeId)) {
            seenIds.add(typeId);
            uniqueTypes.push(type);
          } else if (!typeId) {
            uniqueTypes.push(type);
          }
        });

        setTaskTypes(uniqueTypes);

        const priorityList = prioritiesRes || [];
        const formattedPriorities = priorityList.map(p => ({
          value: p.priority_id,
          name: p.priority_name
        }));
        setPriorities(formattedPriorities);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setAlertMessage("Failed to load task types or priorities.");
        setShowErrorAlert(true);
      });
  }, []);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks Template");

    // Add instructions sheet
    const instructions = [
      ["BULK TASK UPLOAD - TEMPLATE INSTRUCTIONS"],
      [""],
      ["REQUIRED FIELDS (marked with *):"],
      ["  • Title*: Task title (max 100 characters)"],
      ["  • Task Type*: Must match exactly with available task types"],
      // ["  • Task Type Role: Optional, can be used for filtering"],
      ["  • Priority*: High, Medium, Low (case-insensitive)"],
      ["  • Assigned Date Time*: Format: YYYY-MM-DD HH:MM (24-hour)"],
      ["  • Due Date Time*: Format: YYYY-MM-DD HH:MM (24-hour)"],
      [""],
      ["AVAILABLE TASK TYPES BY ROLE:"],
    ];

    // Group task types by role
    const groupedByRole = {};
    taskTypes.forEach(type => {
      const role = type.task_type_role || "Uncategorized";
      const typeName = type.task_type_name || type.name || type.title;
      if (!groupedByRole[role]) {
        groupedByRole[role] = [];
      }
      groupedByRole[role].push(typeName);
    });

    Object.keys(groupedByRole).sort().forEach(role => {
      instructions.push([`  ${role}:`]);
      groupedByRole[role].forEach(typeName => {
        instructions.push([`    - ${typeName}`]);
      });
    });

    instructions.push(
      [""],
      ["PRIORITIES:"],
      ...priorities.map(p => [`  - ${p.name}`]),
      [""],
      ["VALIDATION RULES:"],
      ["  1. Maximum 100 tasks per upload"],
      ["  2. Task types must match exactly"],
      ["  3. Document upload is NOT supported in bulk upload"],
      [""],
      ["TIPS:"],
      ["  • Use Ctrl+C / Ctrl+V to copy template"],
      ["  • Save file as .xlsx for best compatibility"],
      ["  • Remove example rows before uploading"],
      ["  • For tasks with documents, create them individually"]
    );

    const ws2 = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

    XLSX.writeFile(wb, "Task_Bulk_Upload_Template.xlsx");
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setAlertMessage("Please upload Excel or CSV files only.");
      setShowErrorAlert(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlertMessage("File size must be less than 5MB.");
      setShowErrorAlert(true);
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setValidationErrors([]);
    setTasks([]);
    setPreviewPage(1);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          throw new Error("No data found in the file.");
        }

        if (jsonData.length > 100) {
          setAlertMessage("Maximum 100 tasks allowed per upload. Found " + jsonData.length + " tasks.");
          setShowErrorAlert(true);
          setIsUploading(false);
          return;
        }

        const validatedTasks = validateAndTransformData(jsonData);
        setTasks(validatedTasks.validTasks);
        setValidationErrors(validatedTasks.errors);

        if (validatedTasks.errors.length > 0) {
          setAlertMessage(`Found ${validatedTasks.errors.length} validation error(s). Please fix them before submitting.`);
          setShowErrorAlert(true);
        }

      } catch (error) {
        console.error("Error processing file:", error);
        setAlertMessage("Error processing file: " + error.message);
        setShowErrorAlert(true);
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setAlertMessage("Error reading file. Please try again.");
      setShowErrorAlert(true);
    };

    reader.readAsArrayBuffer(file);
  };

  const validateAndTransformData = (data) => {
    const errors = [];
    const validTasks = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2;
      const rowErrors = [];

      // Check required fields
      if (!row['Title*'] || !row['Title*'].toString().trim()) {
        rowErrors.push("Title is required");
      }

      if (!row['Task Type*'] || !row['Task Type*'].toString().trim()) {
        rowErrors.push("Task Type is required");
      } else {
        const taskTypeName = row['Task Type*'].toString().trim();
        const taskTypeRole = row['Task Type Role'] ? row['Task Type Role'].toString().trim() : null;

        let taskType;
        if (taskTypeRole) {
          taskType = taskTypes.find(t =>
            (t.task_type_name || t.name || t.title || "").toLowerCase() === taskTypeName.toLowerCase() &&
            t.task_type_role === taskTypeRole
          );
        }

        if (!taskType) {
          taskType = taskTypes.find(t =>
            (t.task_type_name || t.name || t.title || "").toLowerCase() === taskTypeName.toLowerCase()
          );
        }

        if (!taskType) {
          const roleMsg = taskTypeRole ? ` with role "${taskTypeRole}"` : '';
          rowErrors.push(`Task Type "${taskTypeName}"${roleMsg} not found in system`);
        }
      }

      if (!row['Priority*'] || !row['Priority*'].toString().trim()) {
        rowErrors.push("Priority is required");
      } else {
        const priorityName = row['Priority*'].toString().trim();
        const priority = priorities.find(p =>
          p.name.toLowerCase() === priorityName.toLowerCase()
        );
        if (!priority) {
          rowErrors.push(`Priority "${priorityName}" not found in system`);
        }
      }

      // Validate dates
      // if (!row['Assigned Date Time*'] || !row['Assigned Date Time*'].toString().trim()) {
      //   rowErrors.push("Assigned Date Time is required");
      // } else if (!isValidDateTime(row['Assigned Date Time*'].toString().trim())) {
      //   rowErrors.push("Assigned Date Time format should be YYYY-MM-DD HH:MM");
      // }

      if (!row['Due Date Time*'] || !row['Due Date Time*'].toString().trim()) {
        rowErrors.push("Due Date Time is required");
      } else if (!isValidDateTime(row['Due Date Time*'].toString().trim())) {
        rowErrors.push("Due Date Time format should be YYYY-MM-DD HH:MM");
      // } else if (row['Assigned Date Time*'] && row['Due Date Time*']) {
      //   const assigned = new Date(row['Assigned Date Time*']);
      //   const due = new Date(row['Due Date Time*']);
      //   if (due <= assigned) {
      //     rowErrors.push("Due Date Time must be after Assigned Date Time");
      //   }
      }

      // Document upload is not supported in bulk upload

      if (rowErrors.length === 0) {
        const taskTypeName = row['Task Type*'].toString().trim();
        const taskTypeRole = row['Task Type Role'] ? row['Task Type Role'].toString().trim() : null;

        let taskType = null;
        if (taskTypeRole) {
          taskType = taskTypes.find(t =>
            (t.task_type_name || t.name || t.title || "").toLowerCase() === taskTypeName.toLowerCase() &&
            t.task_type_role === taskTypeRole
          );
        }

        if (!taskType) {
          taskType = taskTypes.find(t =>
            (t.task_type_name || t.name || t.title || "").toLowerCase() === taskTypeName.toLowerCase()
          );
        }

        const priorityName = row['Priority*'].toString().trim();
        const priority = priorities.find(p =>
          p.name.toLowerCase() === priorityName.toLowerCase()
        );

        const taskPayload = {
          user_id: currentUserId,
          title: row['Title*'].toString().trim(),
          description: row['Description'] ? row['Description'].toString().trim() : "",
          priority_id: priority ? priority.value : null,        
          task_type_id: taskType ? (taskType.task_type_id || taskType.id) : null,
          status_id: 1,
          due_date_time: formatDateTimeForAPI(row['Due Date Time*'].toString().trim()),
          remarks: row['Description'] ? row['Description'].toString().trim() : "",
          supporting_document: []
        };

        // Store metadata separately for UI purposes
        taskPayload._rowNumber = rowNumber;
        taskPayload._originalData = row;
        taskPayload._taskTypeRole = taskType?.task_type_role || taskTypeRole || null;
        taskPayload._validationStatus = 'ready';

        validTasks.push(taskPayload);
      } else {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
          data: row
        });
      }
    });

    return { validTasks, errors };
  };

  const isValidDateTime = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const formatDateTimeForAPI = (dateTimeStr) => {
    // Convert "YYYY-MM-DD HH:MM" to "YYYY-MM-DDTHH:MM:SS"
    if (!dateTimeStr) return '';
    const formatted = dateTimeStr.replace(' ', 'T');
    return formatted.length === 16 ? `${formatted}:00` : formatted;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }

    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropzoneRef.current) {
      dropzoneRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setTasks([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedRole && task._taskTypeRole !== selectedRole) {
      return false;
    }

    if (statusFilter === "ready" && task._validationStatus !== 'ready') {
      return false;
    }
    if (statusFilter === "error") {
      const hasError = validationErrors.some(error => error.row === task._rowNumber);
      if (!hasError) return false;
    }

    return true;
  });

  // Calculate paginated tasks for preview
  const paginatedTasks = filteredTasks.slice(
    (previewPage - 1) * previewPageSize,
    previewPage * previewPageSize
  );
  const totalPreviewPages = Math.ceil(filteredTasks.length / previewPageSize);

  const handleSubmit = async () => {
    if (!currentUserId) {
      setAlertMessage('User not authenticated. Please login again.');
      setShowErrorAlert(true);
      return;
    }

    const tasksToSubmit = filteredTasks.filter(task => task._validationStatus === 'ready');

    if (tasksToSubmit.length === 0) {
      setAlertMessage('No valid tasks to upload.');
      setShowErrorAlert(true);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < tasksToSubmit.length; i += batchSize) {
        batches.push(tasksToSubmit.slice(i, i + batchSize));
      }

      let successCount = 0;
      let failedTasks = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          // Clean metadata fields before sending to API
          const cleanedBatch = batch.map(task => {
            const { _rowNumber, _originalData, _taskTypeRole, _validationStatus, ...cleanTask } = task;
            return cleanTask;
          });

          const response = await TaskManagement.postPersonalTasksBulk(cleanedBatch);
          successCount += batch.length;
        } catch (error) {
          console.error(`Error in batch ${i + 1}:`, error);
          failedTasks.push(...batch.map(t => ({ ...t, error: error.message })));
        }

        setUploadProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      setIsSubmitting(false);

      if (failedTasks.length === 0) {
        setAlertMessage(`Successfully uploaded ${successCount} task(s)!`);
        setShowSuccessAlert(true);
      } else {
        setAlertMessage(
          `Uploaded ${successCount} task(s) successfully, but ${failedTasks.length} failed. ` +
          `You can download the failed tasks to review.`
        );
        setShowErrorAlert(true);
      }

    } catch (error) {
      setIsSubmitting(false);
      console.error('Error in bulk upload:', error);
      setAlertMessage('Failed to upload tasks. Please try again.');
      setShowErrorAlert(true);
    }
  };

  const handleCancel = () => {
    navigate("/hrm/tasks/personal-tasks");
  };

  const exportFilteredTasks = () => {
    const exportData = filteredTasks.map(task => ({
      "Row Number": task._rowNumber,
      "Title": task.title,
      "Task Type": taskTypes.find(t => (t.task_type_id || t.id) == task.task_type_id)?.task_type_name || 'N/A',
      "Role": task._taskTypeRole || 'N/A',
      "Priority": priorities.find(p => p.value == task.priority_id)?.name || 'N/A',
      "Assigned Date": task.assigned_date_time,
      "Due Date": task.due_date_time
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Tasks");
    XLSX.writeFile(wb, `Filtered_Tasks_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const clearFilters = () => {
    setSelectedRole("");
    setStatusFilter("all");
    setPreviewPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6" />
          <h2 className="text-xl font-bold">Personal Bulk Task Upload</h2>
        </div>
        <button
          onClick={() => setShowBulkUpload(false)}
          className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>


      <div className="flex flex-col gap-6">
        {/* Left Column: Upload Area */}
        <div className="space-y-6">
          {/* Upload File Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h3>

            {/* Dropzone */}
            <div
              ref={dropzoneRef}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${isUploading ? 'opacity-50 bg-gray-50 border-gray-300' : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                disabled={isUploading}
              />

              <div className="flex flex-col items-center justify-center gap-4">
                {isUploading ? (
                  <>
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-gray-700 font-medium">Processing file...</p>
                      <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Drag & drop your file here</p>
                      <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">Supports .xlsx, .xls, .csv (Max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* File Preview */}
            {uploadedFile && !isUploading && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{tasks.length} tasks</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Upload Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{tasks.length}</div>
                  <div className="text-sm text-blue-600">Total Tasks</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{uniqueRoles.length}</div>
                  <div className="text-sm text-purple-600">Roles Found</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">{validationErrors.length}</div>
                  <div className="text-sm text-orange-600">Errors</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{filteredTasks.length}</div>
                  <div className="text-sm text-green-600">Ready to Upload</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-start gap-4">

          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all min-w-[200px]"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Download Template</span>
          </button>
        </div>
        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Validation Errors ({validationErrors.length})</h3>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {validationErrors.slice(0, 5).map((error, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            Row {error.row}
                          </span>
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {error.data['Title*'] || 'No Title'}
                          </span>
                        </div>
                        <ul className="list-disc pl-5 text-sm text-red-600">
                          {error.errors.slice(0, 3).map((err, errIndex) => (
                            <li key={errIndex} className="mb-1">{err}</li>
                          ))}
                          {error.errors.length > 3 && (
                            <li className="text-red-500">... and {error.errors.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                      {error.data['Task Type Role'] && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium ml-2">
                          {error.data['Task Type Role']}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {validationErrors.length > 5 && (
                  <div className="text-center text-sm text-gray-500 pt-2">
                    Showing 5 of {validationErrors.length} errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks Preview */}
          {filteredTasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Tasks Ready to Upload</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {filteredTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                      disabled={previewPage === 1}
                      className={`p-2 rounded-lg ${previewPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      {previewPage} / {totalPreviewPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(Math.min(totalPreviewPages, previewPage + 1))}
                      disabled={previewPage === totalPreviewPages}
                      className={`p-2 rounded-lg ${previewPage === totalPreviewPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTasks.map((task, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {task._rowNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <div className="text-sm font-medium text-gray-900 truncate" title={task.title}>
                              {task.title}
                            </div>
                            {task._taskTypeRole && (
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded">{task._taskTypeRole}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">
                            {taskTypes.find(t => (t.task_type_id || t.id) == task.task_type_id)?.task_type_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value == task.priority_id)?.name === 'High'
                            ? 'bg-red-100 text-red-800'
                            : priorities.find(p => p.value == task.priority_id)?.name === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            }`}>
                            {priorities.find(p => p.value == task.priority_id)?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isSubmitting && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploading Tasks...</h3>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Uploading tasks to server...</span>
                  </div>
                  <span className="font-semibold text-gray-800">{uploadProgress}% complete</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {/* Buttons positioned at bottom right */}
          <div className="flex flex-row-reverse gap-3">
            <button
              onClick={() => navigate("/hrm/tasks/personal-tasks")}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow transition-all font-medium min-w-[100px]"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || filteredTasks.length === 0 || validationErrors.length > 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 min-w-[150px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {filteredTasks.length} Task(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setShowSuccessAlert(false);
            navigate("/hrm/tasks/personal-tasks");
          }}
          confirmBtnText="Go to Tasks"
          showCancel={true}
          cancelBtnText="Upload More"
          onCancel={() => {
            setShowSuccessAlert(false);
            setUploadedFile(null);
            setTasks([]);
            setValidationErrors([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
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
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}