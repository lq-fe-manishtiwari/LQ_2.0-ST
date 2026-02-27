import React, { useState, useEffect } from "react";
import { X, Upload, FileDown, Info } from "lucide-react";
import * as XLSX from "xlsx";
import { QuestionsService } from "../Services/questions.service";

export default function BulkUploadAssessmentModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [questionCategory, setQuestionCategory] = useState("");
  const [questionLevel, setQuestionLevel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionLevels, setQuestionLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  // Question types — same as individual Add Question form
  const objectiveTypes = [
    { value: "MCQ", label: "MCQ" },
    { value: "TRUE_FALSE", label: "True / False" },
  ];
  const subjectiveTypes = [
    { value: "SHORT_ANSWER", label: "Short Answer" },
    { value: "LONG_ANSWER", label: "Long Answer" },
    { value: "ESSAY", label: "Essay" },
  ];

  useEffect(() => {
    const fetchLevels = async () => {
      setLoadingLevels(true);
      try {
        const res = await QuestionsService.getAllQuestionLevels();
        setQuestionLevels(res || []);
      } catch (err) {
        console.error("Failed to fetch question levels:", err);
        setQuestionLevels([
          { question_level_id: 1, question_level_type: "Basic" },
          { question_level_id: 2, question_level_type: "Intermediate" },
          { question_level_id: 3, question_level_type: "Advanced" },
        ]);
      } finally {
        setLoadingLevels(false);
      }
    };
    fetchLevels();
  }, []);

  // Reset dependent fields when category changes
  const handleCategoryChange = (val) => {
    setQuestionCategory(val);
    setQuestionType("");
  };

  // Download Excel Template
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
        "QUESTION LEVEL",
        "QUESTION TYPE",
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
        "QUESTION LEVEL",
        "QUESTION TYPE",
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

  // File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const typeOptions = questionCategory === "Objective"
    ? objectiveTypes
    : questionCategory === "Subjective"
      ? subjectiveTypes
      : [];

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

          {/* Row 1: Question Category + Question Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Question Category */}
            <div className="relative w-full">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Question Category <span className="text-red-500">*</span>
              </label>
              <select
                value={questionCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-colors"
              >
                <option value="">Select Question Category</option>
                <option value="Objective">OBJECTIVE QUESTION</option>
                <option value="Subjective">SUBJECTIVE QUESTION</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none mt-7">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Question Level */}
            <div className="relative w-full">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Question Level
              </label>
              <select
                value={questionLevel}
                onChange={(e) => setQuestionLevel(e.target.value)}
                disabled={loadingLevels}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingLevels ? "Loading..." : "Select Question Level"}
                </option>
                {questionLevels.map((level) => (
                  <option
                    key={level.question_level_id}
                    value={level.question_level_type}
                  >
                    {level.question_level_type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none mt-7">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Question Type (shown only after category is selected) */}
          {questionCategory && (
            <div className="relative w-full sm:w-1/2 pr-0 sm:pr-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-colors"
              >
                <option value="">Select Question Type</option>
                {typeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none mt-7">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

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
              className={`flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-lg font-medium shadow transition-all text-sm sm:text-base w-full sm:w-auto ${questionCategory
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