import React, { useState } from "react";
import { X, Upload, FileDown, Info } from "lucide-react";
import * as XLSX from "xlsx";

export default function BulkUploadAssessmentModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [questionCategory, setQuestionCategory] = useState("");

  // Download Excel Template (Dynamic)
  const handleDownloadTemplate = () => {
    if (!questionCategory) {
      alert("Please select Question Category before downloading the template.");
      return;
    }

    let headers = [];

    if (questionCategory === "Subjective") {
      headers = [
        "QUESTION",
        "DEFAULT MARKS",
        "SUBJECT TITLE",
        "CHAPTER TITLE",
        "TOPIC TITLE",
        "GRADE NAME",
      ];
    } else if (questionCategory === "Objective") {
      headers = [
        "QUESTION",
        "OPTION 1",
        "OPTION 2",
        "OPTION 3",
        "OPTION 4",
        "CORRECT OPTION",
        "SUBJECT TITLE",
        "CHAPTER TITLE",
        "TOPIC TITLE",
        "DEFAULT MARKS",
        "GRADE NAME",
        "COURSE OUTCOME",
        "BLOOMS LEVEL NUMBER",
      ];
    }

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    const sheetName =
      questionCategory === "Subjective"
        ? "Subjective_Template"
        : "Objective_Template";

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${questionCategory}_Question_Template.xlsx`);
  };

  //  File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4 lg:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl animate-slideUp overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* ---------- Header ---------- */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-blue-600 p-4 sm:p-5 lg:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate pr-2">
            Bulk Upload Assessment Data
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 overflow-y-auto flex-1">
          
          {/* Question Category Dropdown */}
          <div className="relative w-full">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Question Category <span className="text-red-500">*</span>
            </label>
            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-colors"
            >
              <option value="">Select Question Category</option>
              <option value="Objective">OBJECTIVE QUESTION</option>
              <option value="Subjective">SUBJECTIVE QUESTION</option>
            </select>

            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none mt-2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 sm:py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition text-sm sm:text-base"
            />
            {selectedFile && (
              <p className="text-sm text-green-700 mt-2 break-words">
                Selected File: <strong>{selectedFile.name}</strong>
              </p>
            )}
          </div>

          {/* Info Alert */}
          <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-blue-700 text-xs sm:text-sm leading-relaxed">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Please select a Question Category and upload only Excel files (.xlsx,
              .xls) with correct column names. You can download the respective
              template below.
            </span>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-start">
            <button
              onClick={handleDownloadTemplate}
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-lg font-medium shadow transition-all text-sm sm:text-base w-full sm:w-auto ${
                questionCategory
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
              disabled={!questionCategory}
            >
              <FileDown className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {questionCategory
                  ? `Download ${questionCategory} Template`
                  : "Select Category to Download"}
              </span>
            </button>
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 p-4 sm:p-5 lg:p-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all text-sm sm:text-base font-medium"
          >
            Cancel
          </button>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all text-sm sm:text-base">
            <Upload className="w-4 h-4 flex-shrink-0" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}