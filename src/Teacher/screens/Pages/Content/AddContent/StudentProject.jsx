import React, { useState, useEffect, useRef } from "react";
import { Filter, ChevronDown, Plus, X, Search, Clock, FileText, Check, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import { contentService } from "../services/content.service";
import { api } from "../../../../../_services/api";
import SweetAlert from "react-bootstrap-sweetalert";

const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, loading = false }) => {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = typeof value === "object" && value !== null ? value.name : value;

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled || loading
            ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
            } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <span className={`flex-1 truncate ${displayValue && !loading ? "text-gray-900" : "text-gray-400"}`}>
            {loading ? "Loading..." : displayValue || placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect("")}
            >
              {placeholder}
            </div>
            {options.map((option) => {
              const optionName = typeof option === "object" && option !== null ? option.name : option;
              const optionId =
                typeof option === "object" && option !== null
                  ? option.module_id || option.unit_id || option.id || optionName
                  : option;
              return (
                <div
                  key={optionId}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => handleSelect(option)}
                >
                  {optionName}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MultiSelectProgram = ({ label, selectedPrograms, programOptions, onProgramChange, onProgramRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const availableOptions = programOptions.filter((p) => !selectedPrograms.includes(p));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[44px] bg-white cursor-pointer hover:border-blue-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedPrograms.length > 0 ? (
            selectedPrograms.map((prog) => (
              <span
                key={prog}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {prog}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProgramRemove();
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm ml-1">Select Program</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map((prog) => (
                <div
                  key={prog}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => onProgramChange({ target: { value: prog } })}
                >
                  {prog}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">All programs selected</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StudentProject = () => {
  // User Context
  const { getUserId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  // States for Filters
  const [filters, setFilters] = useState({
    filterOpen: true,
    program: [],
    semester: "",
    gradeDivisionId: [],
    chapter: "",
    topic: "",
    activeInactiveStatus: "all",
  });

  // States for Data Options
  const [programOptions, setProgramOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);

  // Selection States
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  // Logic States
  const [loading, setLoading] = useState({
    chapters: false,
    topics: false,
    content: false,
    delete: false,
  });
  const [projects, setProjects] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // SweetAlert
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const showSweetAlert = (title, text, type = "success", confirmText = "OK", onConfirm = null) => {
    setAlertConfig({
      title,
      text,
      type,
      confirmBtnText: confirmText,
      confirmBtnCssClass: "btn-confirm",
      onConfirm: () => {
        setShowAlert(false);
        if (onConfirm && typeof onConfirm === "function") {
          onConfirm();
        }
      },
    });
    setShowAlert(true);
  };

  // --- 1. Fetch Programs ---
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!isProfileLoaded || profileLoading) return;
      const teacherId = getTeacherId();
      if (!teacherId) return;

      try {
        const response = await api.getTeacherAllocatedPrograms(teacherId);
        if (response.success && response.data) {
          const classTeacherPrograms = response.data.class_teacher_allocation || [];
          const normalPrograms = response.data.normal_allocation || [];
          const allPrograms = [...classTeacherPrograms, ...normalPrograms];
          setAllAllocations(allPrograms);

          const programMap = new Map();
          allPrograms.forEach((allocation) => {
            const pid = allocation.program_id;
            const pname = allocation.program?.program_name || allocation.program_name || `Program ${pid}`;
            if (!programMap.has(pid)) {
              programMap.set(pid, { id: pid, name: pname, allocations: [] });
            }
            programMap.get(pid).allocations.push(allocation);
          });
          const uniquePrograms = Array.from(programMap.values());
          setProgramOptions(uniquePrograms);
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      }
    };
    fetchPrograms();
  }, [isProfileLoaded, profileLoading, getTeacherId]);

  // --- 2. Fetch Subjects ---
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedAcademicYearId || !selectedSemesterId) {
        setSubjectOptions([]);
        return;
      }
      const teacherId = getTeacherId();
      if (!teacherId) return;

      try {
        const response = await contentService.getTeacherSubjectsAllocated(
          teacherId,
          selectedAcademicYearId,
          selectedSemesterId
        );

        if (Array.isArray(response)) {
          const subjects = response
            .map((subjectInfo) => ({
              id: subjectInfo.subject_id || subjectInfo.id,
              name: subjectInfo.subject_name || subjectInfo.name,
            }))
            .filter((s) => s.name && s.id);
          const unique = Array.from(new Map(subjects.map((s) => [s.name, s])).values());
          setSubjectOptions(unique);
        } else {
          setSubjectOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjectOptions([]);
      }
    };
    fetchSubjects();
  }, [selectedAcademicYearId, selectedSemesterId, getTeacherId]);

  // --- 3. Fetch Modules/Units ---
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubjectId) {
        setChapterOptions([]);
        setTopicOptions([]);
        return;
      }
      setLoading((prev) => ({ ...prev, chapters: true }));
      try {
        const response = await contentService.getModulesbySubject(selectedSubjectId);
        const modulesArray = response?.modules || response || [];
        if (Array.isArray(modulesArray)) {
          const formatted = modulesArray.map((mod) => ({
            module_id: mod.module_id,
            module_name: mod.module_name,
            units: mod.units || [],
          }));
          setChapterOptions(formatted);
        } else {
          setChapterOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        setChapterOptions([]);
      } finally {
        setLoading((prev) => ({ ...prev, chapters: false }));
      }
    };
    fetchModules();
  }, [selectedSubjectId]);

  // --- 4. Load Projects when Unit Selected ---
  useEffect(() => {
    const fetchProjects = async () => {
      const selectedTopic = topicOptions.find((t) => t.unit_name === filters.topic);

      // If no topic selected, or topic not found, clear projects
      if (!filters.topic || !selectedTopic?.unit_id) {
        setProjects([]);
        return;
      }

      setLoading((prev) => ({ ...prev, content: true }));
      try {
        // Fetch ALL projects (Pending, Approved, Rejected)
        const unitId = selectedTopic.unit_id;
        // We'll fetch 'PENDING' by default or maybe we want all statuses? 
        // The requirement mentions 'request show', typically meaning Pending.
        const res = await contentService.getStudentProjectsByUnit(unitId, ""); // Empty status fetches all? Or need adjust API
        // API implementation: getStudentProjectsByUnit(unitId, status)
        // If we pass empty string, API needs to handle it. 
        // Let's assume we want to see PENDING requests mostly.
        // But let's verify if we can fetch all. The API logic was: query params status (Optional).
        // If I pass "", status might be empty string. Best to pass PENDING or APPROVED or nothing (null/undefined).

        const response = await contentService.getStudentProjectsByUnit(unitId, null); // Pass null for all statuses
        if (Array.isArray(response)) {
          setProjects(response);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setProjects([]);
      } finally {
        setLoading((prev) => ({ ...prev, content: false }));
      }
    };

    fetchProjects();
  }, [filters.topic, topicOptions]);

  // --- Handlers ---
  const handleProgramChange = (e) => {
    const value = e.target.value;
    const program = programOptions.find((p) => p.name === value);
    if (program) {
      setSelectedProgramId(program.id);
      const semesters = [...new Set(program.allocations.map((a) => a.semester?.name).filter(Boolean))];
      setSemesterOptions(semesters);
      setFilters((prev) => ({ ...prev, program: [value], semester: "", gradeDivisionId: [] }));
      setSubjectOptions([]);
    }
  };

  const removeProgram = () => {
    setFilters((prev) => ({ ...prev, program: [], semester: "", gradeDivisionId: [] }));
    setSelectedProgramId(null);
    setSelectedAcademicYearId(null);
    setSelectedSemesterId(null);
    setSemesterOptions([]);
    setSubjectOptions([]);
  };

  const handleApprove = async (projectId) => {
    setProcessingId(projectId);
    try {
      await contentService.approveStudentProject(projectId);
      showSweetAlert("Approved", "Project has been approved.", "success", "OK", () => {
        // Refresh list
        const selectedTopic = topicOptions.find((t) => t.unit_name === filters.topic);
        if (selectedTopic?.unit_id) {
          // Trigger effect again or manually fetch
          contentService.getStudentProjectsByUnit(selectedTopic.unit_id, null).then(res => setProjects(res || []));
        }
      });
    } catch (e) {
      console.error(e);
      showSweetAlert("Error", "Failed to approve project", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (projectId) => {
    setProcessingId(projectId);
    try {
      await contentService.rejectStudentProject(projectId);
      showSweetAlert("Rejected", "Project has been rejected.", "warning", "OK", () => {
        const selectedTopic = topicOptions.find((t) => t.unit_name === filters.topic);
        if (selectedTopic?.unit_id) {
          contentService.getStudentProjectsByUnit(selectedTopic.unit_id, null).then(res => setProjects(res || []));
        }
      });
    } catch (e) {
      console.error(e);
      showSweetAlert("Error", "Failed to reject project", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">Student Projects Review</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
        {/* Filter Toggle Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filters</span>
            <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${filters.filterOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        {/* Filter Inputs */}
        {filters.filterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 transition-all">
            {/* Program */}
            <MultiSelectProgram
              label="Program"
              selectedPrograms={filters.program}
              programOptions={programOptions.map((p) => p.name)}
              onProgramChange={handleProgramChange}
              onProgramRemove={removeProgram}
            />

            {/* Semester */}
            <CustomSelect
              label="Semester"
              value={filters.semester}
              onChange={(e) => {
                const semesterName = e.target.value;
                setFilters((prev) => ({ ...prev, semester: semesterName, gradeDivisionId: [] }));
                if (semesterName && selectedProgramId) {
                  const program = programOptions.find((p) => p.id === selectedProgramId);
                  const semesterAllocation = program?.allocations.find((a) => a.semester?.name === semesterName);
                  if (semesterAllocation) {
                    setSelectedSemesterId(semesterAllocation.semester_id);
                    setSelectedAcademicYearId(semesterAllocation.academic_year_id);
                  }
                } else {
                  setSelectedSemesterId(null);
                  setSelectedAcademicYearId(null);
                }
                setSubjectOptions([]);
              }}
              options={semesterOptions}
              placeholder="Select Semester"
              disabled={filters.program.length === 0}
            />

            {/* Subject (Paper) */}
            <CustomSelect
              label="Paper"
              value={filters.gradeDivisionId[0] || ""}
              onChange={(e) => {
                const subjectObj = subjectOptions.find((s) => s.name === e.target.value);
                setSelectedSubjectId(subjectObj ? subjectObj.id : null);
                setFilters((prev) => ({
                  ...prev,
                  gradeDivisionId: e.target.value ? [e.target.value] : [],
                  chapter: "",
                  topic: "",
                }));
                setChapterOptions([]);
                setTopicOptions([]);
              }}
              options={subjectOptions.map((s) => s.name)}
              placeholder="Select Paper"
            />

            {/* Module */}
            <CustomSelect
              label="Module"
              value={filters.chapter}
              onChange={(e) => {
                const chapterName = e.target.value;
                const chapterObj = chapterOptions.find((c) => c.module_name === chapterName);
                setSelectedChapter(chapterObj || null);
                setFilters((prev) => ({ ...prev, chapter: chapterName, topic: "" }));
                const units = chapterObj?.units || [];
                setTopicOptions(units.map((u) => ({ unit_id: u.unit_id, unit_name: u.unit_name })));
              }}
              options={chapterOptions.map((c) => c.module_name)}
              placeholder="Select Module"
              loading={loading.chapters}
              disabled={chapterOptions.length === 0}
            />

            {/* Unit */}
            <CustomSelect
              label="Unit"
              value={filters.topic}
              onChange={(e) => setFilters((prev) => ({ ...prev, topic: e.target.value }))}
              options={topicOptions.map((t) => t.unit_name)}
              placeholder="Select Unit"
              disabled={topicOptions.length === 0}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {filters.topic ? `Projects for ${filters.topic}` : "Select a Unit to view projects"}
          {projects.length > 0 && <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">{projects.length}</span>}
        </h3>

        {loading.content ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div key={project.projectId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.approvalStatus === 'APPROVED' ? 'bg-green-500' :
                    project.approvalStatus === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pl-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-800">{project.projectTitle}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${project.approvalStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          project.approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                        {project.approvalStatus}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{project.projectDescription}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Student:</span>
                        <span>{project.studentName || `ID: ${project.studentId}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={project.projectLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
                          <Eye className="w-4 h-4" /> View Project Link
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 justify-end sm:border-l sm:pl-4 border-gray-100">
                    {project.approvalStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(project.projectId)}
                          disabled={processingId === project.projectId}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(project.projectId)}
                          disabled={processingId === project.projectId}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {project.approvalStatus !== 'PENDING' && (
                      <div className="text-sm text-gray-400 italic text-center px-4">
                        Action taken
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">{filters.topic ? "No projects found" : "Select a Unit to start"}</h3>
            <p className="text-gray-400 text-sm mt-1">Select Program, Semester, Paper, Module and Unit from the filters.</p>
          </div>
        )}
      </div>

      {showAlert && (
        <SweetAlert
          {...alertConfig}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
        />
      )}
    </div>
  );
};

export default StudentProject;
