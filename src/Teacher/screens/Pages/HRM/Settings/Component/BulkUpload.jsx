// BulkUpload.js
import React, { useState } from "react";
import { X, Upload, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from '../Settings.service';
import SweetAlert from "react-bootstrap-sweetalert";

export default function BulkUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // ✅ Close modal function
  const handleClose = () => {
    const basePath = location.pathname.replace(/\/bulkupload$/, "");
    navigate(basePath);
  };

  // ✅ Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Dynamic template configuration based on current route
  const getTemplateConfig = () => {
    if (location.pathname.includes("roles-responsibility")) {
      return {
        columnName: "Roles Responsibility", 
        fileName: "RolesResponsibility_Template.xlsx",
        apiType: "roles-responsibility"
      };
    } else if (location.pathname.includes("API")) {
      return {
        columnName: "API", 
        fileName: "API_Template.xlsx",
        apiType: "api"
      };
    } else if (location.pathname.includes("user-access-level")) {
      return {
        columnName: "User Access Level", 
        fileName: "User-Access-Level_Template.xlsx",
        apiType: "user-access-level"
      };
    } else if (location.pathname.includes("task-type")) {
      return {
        columnName: "Task Type", 
        fileName: "Task-type_Template.xlsx",
        apiType: "task-type"
      };
    } else if (location.pathname.includes("role")) {
      return {
        columnName: "Role",
        fileName: "Role_Template.xlsx",
        apiType: "role"
      };
    } else if (location.pathname.includes("department")) {
      return {
        columnName: "Department",
        fileName: "Department_Template.xlsx",
        apiType: "department"
      };
    } else if (location.pathname.includes("designation")) {
      return {
        columnName: "Designation",
        fileName: "Designation_Template.xlsx",
        apiType: "designation"
      };
    } else {
      return {
        columnName: "Default",
        fileName: "Template.xlsx",
        apiType: "default"
      };
    }
  };

  // Function: Download Excel Template with dynamic column
  const downloadTemplate = () => {
    const config = getTemplateConfig();
    const header = [[config.columnName]];

    const ws = XLSX.utils.aoa_to_sheet(header);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, config.fileName);
  };

  // Process Excel file and prepare data for API
  const processExcelData = (data, apiType) => {
    const items = data.filter(item => item[0] && item[0].trim() !== "");
    
    switch(apiType) {
      case "roles-responsibility":
        return {
          roles_responsibilities: items.map(item => item[0].trim())
        };
      
      case "api":
        return {
          apis: items.map(item => item[0].trim())
        };
      
      case "task-type":
        return items.map(item => ({
          task_type_id: null,
          task_type_name: item[0].trim()
        }));
      
      case "department":
        // Get active college from localStorage for department bulk upload
        const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
        const collegeId = activeCollege?.id;
        
        if (!collegeId) {
          throw new Error("No active institute selected. Please set an active institute first.");
        }

        return items.map(item => ({
          department_name: item[0].trim(),
          college_id: collegeId
        }));
      
      default:
        return items.map(item => item[0].trim());
    }
  };

  // Handle file upload and processing
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const config = getTemplateConfig();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Remove header row and process data
        const processedData = jsonData.slice(1);
        const apiData = processExcelData(processedData, config.apiType);
        
        // Store the processed data for upload
        event.target._processedData = apiData;
        
        console.log(`Processed ${config.columnName} data:`, apiData);
        setAlertMessage(`${config.columnName} file "${file.name}" processed successfully! Ready to upload.`);
        setAlertType("success");
        setShowAlert(true);
        
      } catch (error) {
        console.error("Error processing file:", error);
        setAlertMessage(error.message || "Error processing file. Please check the format.");
        setAlertType("error");
        setShowAlert(true);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    document.getElementById('file-input').click();
  };

  // Handle form upload submission to API
  const handleUploadSubmit = async () => {
    const fileInput = document.getElementById('file-input');
    if (!fileInput._processedData) {
      setAlertMessage("Please select and process a file first!");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    const config = getTemplateConfig();
    
    try {
      setUploading(true);
      
      let response;
      
      switch(config.apiType) {
        case "roles-responsibility":
          response = await Settings.postRoleResponsibility(fileInput._processedData);
          break;
        
        case "api":
          response = await Settings.postApi(fileInput._processedData);
          break;
        
        case "task-type":
          response = await Settings.postTaskType(fileInput._processedData);
          break;
        
        case "department":
          // Use DepartmentService for department bulk upload
          response = await DepartmentService.bulkCreateDepartments(fileInput._processedData);
          break;
        
        default:
          throw new Error(`Unsupported API type: ${config.apiType}`);
      }

      console.log("Upload response:", response);
      
      setAlertMessage(`${config.columnName} data uploaded successfully!`);
      setAlertType("success");
      setShowAlert(true);
      
      // Reset file input
      fileInput.value = '';
      delete fileInput._processedData;
      
      // Close modal after successful upload
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error("Upload error:", error);
      setAlertMessage(`Failed to upload ${config.columnName} data. Please try again.`);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      setUploading(false);
    }
  };

  const config = getTemplateConfig();

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      
      <div 
        className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bulk Upload {config.columnName}</h2>
          <button 
            onClick={handleClose}
            className="hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* File Upload Box */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Upload Excel File
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              id="file-input"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Visible upload box */}
            <div 
              onClick={handleUploadClick}
              className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 hover:border-blue-500 transition cursor-pointer"
            >
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 text-sm">Choose .xlsx file</span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Only .xlsx template files are supported. File will be processed automatically.
            </p>
          </div>

          {/* Download Template */}
          <div>
            <button
              onClick={downloadTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow"
            >
              <FileDown className="w-4 h-4" />
              Download {config.columnName} Template
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Template will contain one column: <strong>{config.columnName}</strong>
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button 
            onClick={handleUploadSubmit}
            disabled={uploading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {config.columnName}
              </>
            )}
          </button>
        </div>

      </div>

      {/* Success/Error Alert */}
      {showAlert && (
        <SweetAlert
          success={alertType === "success"}
          error={alertType === "error"}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          title={alertType === "success" ? "Success!" : "Error!"}
          onConfirm={() => setShowAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}