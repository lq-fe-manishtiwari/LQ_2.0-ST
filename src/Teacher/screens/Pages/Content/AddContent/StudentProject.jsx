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

const MultiSelect = ({ label, values, options, onChange, placeholder, loading = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optionId) => {
    const newValues = values.includes(optionId)
      ? values.filter((id) => id !== optionId)
      : [...values, optionId];
    onChange(newValues);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`flex flex-wrap items-center gap-1 p-2 border ${disabled || loading ? "bg-gray-100 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 cursor-pointer hover:border-blue-400"
            } rounded-lg min-h-[44px] bg-white transition-all duration-150`}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          {values.length > 0 ? (
            values.map((val) => {
              const option = options.find((o) => o.id === val || o.name === val);
              const displayName = option ? option.name : val;
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {displayName}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(val);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm ml-1">{loading ? "Loading..." : placeholder}</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          />
        </div>

        {isOpen && !disabled && !loading && (
          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${values.includes(option.id) ? "bg-blue-50 font-medium text-blue-600" : "text-gray-700"
                  }`}
                onClick={() => handleToggle(option.id)}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${values.includes(option.id) ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                    }`}
                >
                  {values.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                {option.name}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 italic">No options available</div>
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
    unitIds: [],
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
  const [showApproveAlert, setShowApproveAlert] = useState(false);
  const [showRejectAlert, setShowRejectAlert] = useState(false);
  const [projectToAction, setProjectToAction] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  // --- 4. Load Projects when Module or Units Selected ---
  useEffect(() => {
    const fetchProjects = async () => {
      // If no module selected, clear projects
      if (!selectedChapter?.module_id) {
        setProjects([]);
        return;
      }

      setLoading((prev) => ({ ...prev, content: true }));
      try {
        let unitIdsToFetch = [];
        if (filters.unitIds && filters.unitIds.length > 0) {
          unitIdsToFetch = filters.unitIds;
        } else {
          // By default, fetch all units of the module
          unitIdsToFetch = (selectedChapter.units || []).map(u => u.unit_id);
        }

        if (unitIdsToFetch.length === 0) {
          setProjects([]);
          setLoading((prev) => ({ ...prev, content: false }));
          return;
        }

        const response = await contentService.getStudentProjectsByModuleAndUnits(
          selectedChapter.module_id,
          unitIdsToFetch,
          null
        );

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
  }, [selectedChapter, filters.unitIds]);

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
    setProjectToAction(projectId);
    setShowApproveAlert(true);
  };

  const handleConfirmApprove = async () => {
    setShowApproveAlert(false);
    setProcessingId(projectToAction);
    try {
      await contentService.approveStudentProject(projectToAction);
      setSuccessMessage("Project has been successfully approved!");
      setShowSuccessAlert(true);
      // Refresh list
      if (selectedChapter?.module_id) {
        let unitIdsToFetch = filters.unitIds.length > 0
          ? filters.unitIds
          : (selectedChapter.units || []).map(u => u.unit_id);

        if (unitIdsToFetch.length > 0) {
          contentService.getStudentProjectsByModuleAndUnits(selectedChapter.module_id, unitIdsToFetch, null)
            .then(res => setProjects(res || []));
        }
      }
    } catch (e) {
      console.error(e);
      showSweetAlert("Error", "Failed to approve project", "error");
    } finally {
      setProcessingId(null);
      setProjectToAction(null);
    }
  };

  const handleReject = async (projectId) => {
    setProjectToAction(projectId);
    setShowRejectAlert(true);
  };

  const handleConfirmReject = async () => {
    setShowRejectAlert(false);
    setProcessingId(projectToAction);
    try {
      await contentService.rejectStudentProject(projectToAction);
      setSuccessMessage("Project has been successfully rejected!");
      setShowSuccessAlert(true);
      if (selectedChapter?.module_id) {
        let unitIdsToFetch = filters.unitIds.length > 0
          ? filters.unitIds
          : (selectedChapter.units || []).map(u => u.unit_id);

        if (unitIdsToFetch.length > 0) {
          contentService.getStudentProjectsByModuleAndUnits(selectedChapter.module_id, unitIdsToFetch, null)
            .then(res => setProjects(res || []));
        }
      }
    } catch (e) {
      console.error(e);
      showSweetAlert("Error", "Failed to reject project", "error");
    } finally {
      setProcessingId(null);
      setProjectToAction(null);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Student Projects Review</h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0"
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
            <MultiSelect
              label="Program"
              values={filters.program}
              options={programOptions.map((p) => ({ id: p.name, name: p.name }))}
              onChange={(newValues) => {
                if (newValues.length > 0) {
                  const lastValue = newValues[newValues.length - 1];
                  handleProgramChange({ target: { value: lastValue } });
                } else {
                  removeProgram();
                }
              }}
              placeholder="Select Program"
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
                  unitIds: [],
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
                setFilters((prev) => ({ ...prev, chapter: chapterName, unitIds: [] }));
                const units = chapterObj?.units || [];
                setTopicOptions(units.map((u) => ({ unit_id: u.unit_id, unit_name: u.unit_name })));
              }}
              options={chapterOptions.map((c) => c.module_name)}
              placeholder="Select Module"
              loading={loading.chapters}
              disabled={chapterOptions.length === 0}
            />

            {/* Unit (MultiSelect) */}
            <MultiSelect
              label="Unit"
              values={filters.unitIds}
              options={topicOptions.map((t) => ({ id: t.unit_id, name: t.unit_name }))}
              onChange={(newIds) => setFilters((prev) => ({ ...prev, unitIds: newIds }))}
              placeholder="Select Unit"
              disabled={topicOptions.length === 0}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {filters.chapter ? `Projects for ${filters.chapter}` : "Select a Module to view projects"}
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
              <div key={project.project_id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Status Indicator Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.approval_status === 'APPROVED' ? 'bg-green-500' :
                  project.approval_status === 'REJECTED' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pl-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-800">{project.project_title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${project.approval_status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        project.approval_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                        {project.approval_status || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{project.project_description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Student:</span>
                        <span>{project.student_name || `ID: ${project.student_id}`}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={project.project_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline">
                          <Eye className="w-4 h-4" /> View Project Link
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 justify-end sm:border-l sm:pl-4 border-gray-100">
                    {(project.approval_status === 'PENDING' || !project.approval_status) && (
                      <>
                        <button
                          onClick={() => handleApprove(project.project_id)}
                          disabled={processingId === project.project_id}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(project.project_id)}
                          disabled={processingId === project.project_id}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {project.approval_status !== 'PENDING' && project.approval_status && (
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
            <h3 className="text-gray-500 font-medium">{filters.chapter ? "No projects found" : "Select a Module to start"}</h3>
            <p className="text-gray-400 text-sm mt-1">Select Program, Semester, Paper and Module from the filters.</p>
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

      {/* Approve Confirmation Alert */}
      {showApproveAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Approve"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Approve Project?"
          onConfirm={handleConfirmApprove}
          onCancel={() => {
            setShowApproveAlert(false);
            setProjectToAction(null);
          }}
        >
          Are you sure you want to approve this project? This action will mark it as approved.
        </SweetAlert>
      )}

      {/* Reject Confirmation Alert */}
      {showRejectAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Reject"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Reject Project?"
          onConfirm={handleConfirmReject}
          onCancel={() => {
            setShowRejectAlert(false);
            setProjectToAction(null);
          }}
        >
          Are you sure you want to reject this project? This action will mark it as rejected.
        </SweetAlert>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {successMessage}
        </SweetAlert>
      )}
    </div>
  );
};

export default StudentProject;
