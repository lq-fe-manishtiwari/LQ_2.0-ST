import React, { useState, useRef, useEffect } from "react";
import { X, Upload, FileDown, Info, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from 'react-bootstrap-sweetalert';
import { collegeService } from '../services/college.service';
import { contentService } from '../services/content.service.js';
import { fetchClassesByprogram } from '../services/student.service.js';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';

export default function BulkUploadQuestionModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Get user profile data
  const { getUserId, getCollegeId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();

  // Data
  const [programOptions, setProgramOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [academicSemesterOptions, setAcademicSemesterOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  // Selection
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedAcademicSemester, setSelectedAcademicSemester] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  // Selected values for display
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedAcademicSemesterDisplay, setSelectedAcademicSemesterDisplay] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Loading
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);

  // Preview
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [rowQuestionLevels, setRowQuestionLevels] = useState([]);

  // Question Levels
  const [questionLevelOptions, setQuestionLevelOptions] = useState([]);

  // Upload
  const [uploading, setUploading] = useState(false);

  // SweetAlert
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Handle dropdown selection
  const handleSelect = (fieldName, value) => {
    if (fieldName === 'program') {
      const program = programOptions.find(p => p.name === value);
      setSelectedProgramId(program?.id || null);
      setSelectedProgram(value);
      
      // Get academic year-semester combinations from all allocations for this program
      if (program?.allocations) {
        const academicSemesterMap = new Map();
        program.allocations.forEach(allocation => {
          if (allocation.academic_year && allocation.semester) {
            const displayId = `${allocation.academic_year_id}-${allocation.semester_id}`;
            if (!academicSemesterMap.has(displayId)) {
              academicSemesterMap.set(displayId, {
                label: `${allocation.academic_year.name} - ${allocation.semester.name}`,
                value: displayId,
                academicYearId: allocation.academic_year_id,
                semesterId: allocation.semester_id
              });
            }
          }
        });
        const academicSemesters = Array.from(academicSemesterMap.values());
        setAcademicSemesterOptions(academicSemesters);
      }
      
      setSelectedAcademicSemester(null);
      setSelectedAcademicSemesterDisplay("");
      setSelectedSubjectId(null);
      setSelectedSubject("");
      setSelectedUnitId(null);
      setSelectedChapter("");
      setSelectedTopic("");
    }
    else if (fieldName === 'academicSemester') {
      const academicSemester = academicSemesterOptions.find(as => as.label === value);
      if (academicSemester) {
        setSelectedAcademicSemester(academicSemester.value);
        setSelectedAcademicYearId(academicSemester.academicYearId);
        setSelectedSemesterId(academicSemester.semesterId);
      }
      setSelectedAcademicSemesterDisplay(value);
      setSelectedSubjectId(null);
      setSelectedSubject("");
      setSelectedUnitId(null);
      setSelectedChapter("");
      setSelectedTopic("");
    }
    else if (fieldName === 'subject') {
      const subject = subjectOptions.find(s => s.name === value);
      setSelectedSubjectId(subject?.id || null);
      setSelectedSubject(value);
      setSelectedUnitId(null);
      setSelectedChapter("");
      setSelectedTopic("");
    }
    else if (fieldName === 'chapter') {
      const module = chapterOptions.find(m => m.module_name === value);
      const units = module?.units || [];
      setTopicOptions(units);
      setSelectedChapter(value);
      setSelectedModuleId(module?.module_id || null);
      setSelectedUnitId(null);
      setSelectedTopic("");
    }
    else if (fieldName === 'topic') {
      const unit = topicOptions.find(u => u.unit_name === value);
      setSelectedUnitId(unit?.unit_id || null);
      setSelectedTopic(value);
    }

    setOpenDropdown(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!Object.values(dropdownRefs.current).some(ref => ref?.contains(e.target))) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!isProfileLoaded || profileLoading) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }

      const teacherId = getTeacherId();

      if (!teacherId) {
        console.warn('No teacher ID found. Please ensure you are logged in.');
        return;
      }

      try {
        console.log('Fetching programs for teacher ID:', teacherId);
        const response = await api.getTeacherAllocatedPrograms(teacherId);
        console.log('Programs response:', response);

        if (response.success && response.data) {
          // Flatten class_teacher_allocation and normal_allocation into single array
          const classTeacherPrograms = response.data.class_teacher_allocation || [];
          const normalPrograms = response.data.normal_allocation || [];
          const allPrograms = [...classTeacherPrograms, ...normalPrograms];

          // Group allocations by program_id and merge them
          const programMap = new Map();
          allPrograms.forEach(allocation => {
            const programId = allocation.program_id;
            const programName = allocation.program?.program_name || allocation.program_name || `Program ${programId}`;
            if (!programMap.has(programId)) {
              programMap.set(programId, {
                id: programId,
                name: programName,
                allocations: []
              });
            }
            programMap.get(programId).allocations.push(allocation);
          });
          const uniquePrograms = Array.from(programMap.values());

          setProgramOptions(uniquePrograms);
          console.log('Formatted programs:', uniquePrograms);
        } else {
          console.error('Failed to fetch programs:', response.message);
          setProgramOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setProgramOptions([]);
      }
    };
    fetchPrograms();
  }, [isProfileLoaded, profileLoading, getTeacherId]);

  // Fetch Subjects using same API as objectivequetions.jsx
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedAcademicYearId || !selectedSemesterId) {
        setSubjectOptions([]);
        setSelectedSubjectId(null);
        return;
      }

      if (!isProfileLoaded || profileLoading) {
        console.log('Profile not loaded yet, waiting...');
        return;
      }

      const teacherId = getTeacherId();
      if (!teacherId) {
        console.warn('No teacher ID found. Please ensure you are logged in.');
        return;
      }

      setLoadingSubjects(true);
      try {
        console.log('Fetching subjects for teacher:', teacherId, 'academicYearId:', selectedAcademicYearId, 'semesterId:', selectedSemesterId);
        const response = await contentService.getTeacherSubjectsAllocated(teacherId, selectedAcademicYearId, selectedSemesterId);
        console.log('Teacher allocated subjects response:', response);

        if (Array.isArray(response)) {
          const subjects = response.map(subjectInfo => ({
            id: subjectInfo.subject_id || subjectInfo.id,
            name: subjectInfo.subject_name || subjectInfo.name
          })).filter(s => s.name && s.id);

          const unique = Array.from(new Map(subjects.map(s => [s.name, s])).values());
          setSubjectOptions(unique);
          console.log('Formatted allocated subjects:', unique);
        } else {
          console.error('Subjects response is not valid:', response);
          setSubjectOptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch teacher allocated subjects:', err);
        setSubjectOptions([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedAcademicYearId, selectedSemesterId, isProfileLoaded, profileLoading, getTeacherId]);

  // Fetch Modules & Units by Subject ID
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) {
        setChapterOptions([]);
        setTopicOptions([]);
        return;
      }

      setLoadingModules(true);
      try {
        const response = await contentService.getModulesbySubject(selectedSubjectId);
        const modules = response?.modules || response || [];

        if (Array.isArray(modules)) {
          setChapterOptions(modules.map(m => ({
            module_id: m.module_id,
            module_name: m.module_name,
            units: m.units || []
          })));
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setChapterOptions([]);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [selectedSubjectId]);

  // Fetch Question Levels
  useEffect(() => {
    const fetchQuestionLevels = async () => {
      try {
        const levels = await contentService.getAllQuestionLevel();
        if (Array.isArray(levels)) {
          setQuestionLevelOptions(levels);
        }
      } catch (error) {
        console.error("Failed to fetch question levels:", error);
      }
    };
    fetchQuestionLevels();
  }, []);

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      "QUESTION LEVEL",
      "NO OF OPTIONS",
      "DEFAULT MARKS",
      "QUESTION",
      "OPTION 1",
      "OPTION 2",
      "OPTION 3",
      "OPTION 4",
      "OPTION 5",
      "CORRECT ANSWER",
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();

    // Add data validation for question level column (A2:A1000) using direct list
    const levelList = questionLevelOptions.map(l => l.question_level_type).join(',');
    if (!worksheet['!dataValidation']) worksheet['!dataValidation'] = {};
    for (let i = 2; i <= 1000; i++) {
      worksheet['!dataValidation'][`A${i}`] = {
        type: 'list',
        formula1: `"${levelList}"`,
        allowBlank: true
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Objective_Template");
    XLSX.writeFile(workbook, "Objective_Question_Template.xlsx");
  };

  //  File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1) || [];
        setPreviewHeaders(headers);
        setPreviewData(rows);
        setEditedData(rows.map(row => [...row]));
        setRowQuestionLevels(rows.map(row => row[0] || "Easy"));
      };
      reader.readAsArrayBuffer(file);
    } else {
      setPreviewHeaders([]);
      setPreviewData([]);
      setEditedData([]);
      setRowQuestionLevels([]);
    }
  };

  // Handle Upload
  const handleUpload = async () => {
    if (!selectedModuleId) {
      showSweetAlert('Warning', 'Please select a Module', 'warning');
      return;
    }
    if (!editedData.filter(row => row[3] && row[3].trim()).length) {
      showSweetAlert('Warning', 'No valid questions to upload', 'warning');
      return;
    }

    setUploading(true);
    try {
      const userId = getUserId();
      const easyLevel = questionLevelOptions.find(l => l.question_level_type === "Easy");
      const questions = editedData
        .filter(row => row[3] && row[3].trim()) // only rows with question
        .map((row, index) => {
          const selectedLevel = rowQuestionLevels[index] || "Easy";
          const level = questionLevelOptions.find(l => l.question_level_type === selectedLevel) || easyLevel;
          return {
            question: row[3],
            option1: row[4] || null,
            option2: row[5] || null,
            option3: row[6] || null,
            option4: row[7] || null,
            option5: row[8] || null,
            answer: row[9], // assuming it's the number
            option_count: parseInt(row[1]) || 4,
            unit_id: selectedUnitId || null,
            module_id: selectedModuleId,
            question_level_id: level ? level.question_level_id : null,
            default_weightage: parseFloat(row[2]) || 1.0,
            user_id: userId,
            admin: true
          };
        });

      await contentService.bulkUploadQuestions(questions);
      showSweetAlert('Success', 'Questions uploaded successfully!', 'success', 'OK');
    } catch (err) {
      console.error(err);
      showSweetAlert('Error', err.response?.data?.message || 'Failed to upload questions', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Show SweetAlert
  const showSweetAlert = (title, text, type = 'success', confirmText = 'OK') => {
    setAlertConfig({
      title,
      text,
      type,
      confirmBtnText: confirmText,
      onConfirm: () => {
        setShowAlert(false);
        if (type === 'success') {
          onClose(); // Close modal only after user clicks OK on success
        }
      }
    });
    setShowAlert(true);
  };

  // Custom Dropdown
  const CustomDropdown = ({ fieldName, label, value, options, placeholder, required = false, loading = false, disabled = false }) => (
    <div ref={el => dropdownRefs.current[fieldName] = el} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border rounded-lg min-h-[44px] flex items-center justify-between cursor-pointer transition-all
          ${disabled || loading ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'bg-white hover:border-blue-500'}
          border-gray-300
        `}
        onClick={() => !disabled && !loading && setOpenDropdown(openDropdown === fieldName ? null : fieldName)}
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {loading ? 'Loading...' : (value || placeholder)}
        </span>
        {!loading && !disabled && <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === fieldName ? 'rotate-180' : ''}`} />}
      </div>

      {openDropdown === fieldName && !loading && !disabled && options.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelect(fieldName, '')}>
            {placeholder}
          </div>
          {options.map((opt) => {
            const display = opt?.module_name || opt?.unit_name || opt?.name || opt;
            const key = opt?.module_id || opt?.unit_id || opt?.id || display;
            return (
              <div
                key={key}
                className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSelect(fieldName, display)}
              >
                {display}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ---------- Header ---------- */}
        <div className="flex justify-between items-center border-b border-gray-200 bg-blue-600 p-4 sm:p-5 lg:p-6 rounded-t-2xl">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate pr-2">
            Bulk Upload Questions
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
            <CustomDropdown fieldName="program" label="Program" value={selectedProgram} options={programOptions.map(p => p.name)} placeholder="Select Program" required />
            <CustomDropdown fieldName="academicSemester" label="Academic Year - Semester" value={selectedAcademicSemesterDisplay} options={academicSemesterOptions.map(as => as.label)} placeholder="Select Academic Year - Semester" required disabled={!selectedProgram} />
            <CustomDropdown fieldName="subject" label="Paper" value={selectedSubject} options={subjectOptions.map(s => s.name)} placeholder="Select Paper" required loading={loadingSubjects} disabled={!selectedAcademicSemesterDisplay} />
            <CustomDropdown fieldName="chapter" label="Module" value={selectedChapter} options={chapterOptions.map(m => m.module_name)} placeholder="Select Module" required loading={loadingModules} disabled={!selectedSubjectId} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2 mb-6">
            <CustomDropdown fieldName="topic" label="Unit (Topic)" value={selectedTopic} options={topicOptions.map(u => u.unit_name)} placeholder="Select Unit (Optional)" disabled={!selectedChapter} />
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

          {/* Preview */}
          {editedData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Preview</h3>
              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewHeaders.map((header, index) => (
                        <th key={index} className="px-4 py-3 border-b border-gray-300 text-left text-sm font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {editedData.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          cellIndex === 0 ? (
                            <td key={cellIndex} className="px-4 py-3 border-b border-gray-300 text-sm text-gray-900">
                              <select
                                value={rowQuestionLevels[rowIndex] || "Easy"}
                                onChange={(e) => {
                                  const newLevels = [...rowQuestionLevels];
                                  newLevels[rowIndex] = e.target.value;
                                  setRowQuestionLevels(newLevels);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                {questionLevelOptions.map(level => (
                                  <option key={level.question_level_id} value={level.question_level_type}>
                                    {level.question_level_type}
                                  </option>
                                ))}
                              </select>
                            </td>
                          ) : (
                            <td key={cellIndex} className="px-4 py-3 border-b border-gray-300 text-sm text-gray-900">
                              <input
                                type="text"
                                value={cell || ''}
                                onChange={(e) => {
                                  const newData = [...editedData];
                                  newData[rowIndex][cellIndex] = e.target.value;
                                  setEditedData(newData);
                                }}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </td>
                          )
                        ))}
                      </tr>
                    ))}
                    {editedData.length > 10 && (
                      <tr>
                        <td colSpan={previewHeaders.length} className="px-4 py-3 text-center text-sm text-gray-500">
                          ... and {editedData.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Alert */}
          <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-blue-700 text-xs sm:text-sm leading-relaxed">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              Upload only Excel files (.xlsx, .xls) with correct column names for Objective questions. You can download the template below.
            </span>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-start">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-lg font-medium shadow bg-green-600 hover:bg-green-700 text-white transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              <FileDown className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Download Template</span>
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
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg font-medium shadow-md transition-all text-sm sm:text-base ${uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* SweetAlert */}
      {showAlert && (
        <SweetAlert
          title={alertConfig.title}
          onConfirm={alertConfig.onConfirm}
          type={alertConfig.type}
          confirmBtnText={alertConfig.confirmBtnText}
          confirmBtnCssClass="btn-confirm"
          showCancel={false}
        >
          {alertConfig.text}
        </SweetAlert>
      )}
    </div>
  );
}