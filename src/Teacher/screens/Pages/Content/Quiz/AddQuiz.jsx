import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, ChevronDown } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { fetchClassesByprogram } from '../services/student.service';
import { contentService } from '../services/content.service';
import { contentQuizService } from '../services/contentQuiz.service';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import { api } from '../../../../../_services/api';
// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border ${disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
            } rounded-lg min-h-[44px] flex items-center justify-between transition-all duration-150`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'
              }`}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect({ value: '', label: placeholder })}
            >
              {placeholder}
            </div>
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AddQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedFilters = location.state?.filters || {};

  // Get user profile data
  const { getUserId, getCollegeId, getTeacherId, isLoaded: isProfileLoaded, loading: profileLoading } = useUserProfile();
  const userId = getUserId();
  const collegeId = getCollegeId();

  const [formData, setFormData] = useState({
    program: passedFilters.program || "",
    semester: passedFilters.semester || "",
    batch: passedFilters.batch || "",
    paper: passedFilters.paper || "",
    module: "",  // Don't pre-populate module
    unit: "",     // Don't pre-populate unit
    quizName: "",
    duration: "",
    instructions: "",
  });

  // Additional state for tracking selections
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);

  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [papers, setPapers] = useState([]);
  const [modules, setModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch programs
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

          allPrograms.forEach(allocation => {
            const programId = allocation.program_id;
            const programName = allocation.program?.program_name || allocation.program_name || `Program ${programId}`;

            if (!programMap.has(programId)) {
              programMap.set(programId, {
                id: programId,
                label: programName,
                value: String(programId),
                allocations: []
              });
            }

            programMap.get(programId).allocations.push(allocation);
          });

          const uniquePrograms = Array.from(programMap.values());
          setPrograms(uniquePrograms);
        }
      } catch (err) {
        console.error('Failed to fetch programs:', err);
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, [isProfileLoaded, profileLoading, getTeacherId]);

  // Fetch semesters when program changes
  useEffect(() => {
    if (!formData.program) {
      setSemesters([]);
      setBatches([]);
      setPapers([]);
      setModules([]);
      setUnits([]);
      setSelectedProgramId(null);
      return;
    }

    const program = programs.find(p => p.value === formData.program);
    if (program) {
      setSelectedProgramId(program.id);

      // Create Academic Year - Semester format
      const academicSemesters = program.allocations.map(allocation => {
        const academicYear = allocation.academic_year?.name || allocation.academic_year_name || 'Unknown Year';
        const semester = allocation.semester?.name || allocation.semester_name || 'Unknown Semester';
        const combinedLabel = `${academicYear} - ${semester}`;

        return {
          label: combinedLabel,
          value: combinedLabel,
          academicYearId: allocation.academic_year_id,
          semesterId: allocation.semester_id,
          allocation: allocation
        };
      }).filter(item => item.label !== 'Unknown Year - Unknown Semester');

      // Remove duplicates based on label
      const uniqueSemesters = academicSemesters.filter((item, index, self) =>
        index === self.findIndex(t => t.label === item.label)
      );

      setSemesters(uniqueSemesters);
    }
  }, [formData.program, programs]);

  // Load batches when semester changes
  useEffect(() => {
    if (!formData.semester) {
      setBatches([]);
      return;
    }

    const selectedSemesterObj = semesters.find(s => s.value === formData.semester);
    if (selectedSemesterObj) {
      // Get batches for the selected semester
      const program = programs.find(p => p.id === selectedProgramId);
      if (program) {
        const batchesForSemester = program.allocations
          .filter(allocation =>
            allocation.academic_year_id === selectedSemesterObj.academicYearId &&
            allocation.semester_id === selectedSemesterObj.semesterId
          )
          .map(allocation => ({
            label: allocation.batch?.batch_name || allocation.batch_name || 'Default Batch',
            value: allocation.batch_id || allocation.batch?.batch_id || 'default'
          }))
          .filter((batch, index, self) =>
            index === self.findIndex(b => b.value === batch.value)
          );

        setBatches(batchesForSemester);
      }
    }
  }, [formData.semester, semesters, programs, selectedProgramId]);

  // Fetch papers when semester changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedProgramId || !formData.semester) {
        setPapers([]);
        setModules([]);
        setUnits([]);
        return;
      }

      // Find the selected semester object from the semesters array
      const selectedSemesterObj = semesters.find(s => s.value === formData.semester);
      if (selectedSemesterObj) {
        setSelectedSemesterId(selectedSemesterObj.semesterId);
        setSelectedAcademicYearId(selectedSemesterObj.academicYearId);

        if (!isProfileLoaded || profileLoading) return;

        const teacherId = getTeacherId();
        if (!teacherId) return;

        try {
          const response = await contentService.getTeacherSubjectsAllocated(teacherId, selectedSemesterObj.academicYearId, selectedSemesterObj.semesterId);

          if (Array.isArray(response)) {
            const subjects = response.map(subjectInfo => ({
              label: subjectInfo.subject_name || subjectInfo.name,
              value: subjectInfo.subject_id || subjectInfo.id
            })).filter(s => s.label && s.value);

            const unique = Array.from(new Map(subjects.map(s => [s.label, s])).values());
            setPapers(unique);
          }
        } catch (err) {
          console.error('Failed to fetch teacher allocated subjects:', err);
          setPapers([]);
        }
      }
    };

    fetchSubjects();
  }, [formData.semester, selectedProgramId, semesters, isProfileLoaded, profileLoading, getTeacherId]);

  // Fetch modules
  useEffect(() => {
    if (!formData.paper) {
      setModules([]);
      setUnits([]);
      return;
    }

    setSelectedSubjectId(formData.paper);

    const loadModules = async () => {
      try {
        const response = await contentService.getModulesbySubject(formData.paper);
        const modulesArray = response?.modules || response || [];

        if (Array.isArray(modulesArray) && modulesArray.length > 0) {
          setModules(modulesArray);
        } else {
          setModules([]);
        }
        setUnits([]);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setModules([]);
      }
    };

    loadModules();
  }, [formData.paper]);

  // Fetch units
  useEffect(() => {
    if (!formData.module || modules.length === 0) return;

    const selectedModule = modules.find(m => String(m.module_id) === String(formData.module));
    setUnits(selectedModule?.units || []);
  }, [formData.module, modules]);

  // Fetch questions when module or unit changes
  useEffect(() => {
    if (!formData.module || modules.length === 0) {
      setQuestionsList([]);
      return;
    }

    const selectedModule = modules.find(m => String(m.module_id) === String(formData.module));
    if (!selectedModule) {
      setQuestionsList([]);
      return;
    }

    let unitIds = [];
    if (formData.unit) {
      // Specific unit selected
      unitIds = [formData.unit];
    } else {
      // No unit selected - get all units from module
      unitIds = selectedModule.units?.map(u => String(u.unit_id)) || [];
    }

    if (unitIds.length === 0) {
      setQuestionsList([]);
      return;
    }

    contentService.getQuestionsByModuleAndUnits(formData.module, unitIds, 0, 1000)
      .then(res => {
        let questionsArray = [];
        if (res?.content && Array.isArray(res.content)) {
          questionsArray = res.content;
        } else if (Array.isArray(res?.data)) {
          questionsArray = res.data;
        } else if (Array.isArray(res)) {
          questionsArray = res;
        }
        setQuestionsList(questionsArray);
      })
      .catch(err => console.error("Error fetching questions:", err));
  }, [formData.module, formData.unit, modules]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === "program") {
      updated = { ...updated, semester: "", batch: "", paper: "", module: "", unit: "" };
    }
    if (name === "semester") {
      updated = { ...updated, batch: "", paper: "", module: "", unit: "" };
    }
    if (name === "batch") {
      updated = { ...updated, paper: "", module: "", unit: "" };
    }
    if (name === "paper") {
      updated = { ...updated, module: "", unit: "" };
    }
    if (name === "module") {
      updated = { ...updated, unit: "" };
    }

    setFormData(updated);
  };

  const validateForm = () => {
    const required = ["quizName", "duration", "module"];
    for (let f of required) {
      if (!formData[f]) {
        setAlert(
          <SweetAlert
            danger
            title="Validation Error"
            onConfirm={() => setAlert(null)}
          >
            Please fill: {f}
          </SweetAlert>
        );
        return false;
      }
    }

    if (selectedQuestions.length === 0) {
      setAlert(
        <SweetAlert
          danger
          title="Validation Error"
          onConfirm={() => setAlert(null)}
        >
          Please select at least one question
        </SweetAlert>
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const quizPayload = {
      quiz_name: formData.quizName,
      duration: parseInt(formData.duration),
      question_ids: selectedQuestions.map(id => parseInt(id)),
      unit_id: formData.unit ? parseInt(formData.unit) : null,
      module_id: parseInt(formData.module),
      admin: false,
      user_id: userId,
      college_id: collegeId
    };

    try {
      await contentQuizService.createQuizQuestion(quizPayload);
      setAlert(
        <SweetAlert
          success
          title="Quiz Created!"
          confirmBtnText="Yes"
          cancelBtnText="No"
          showCancel
          cancelBtnCssClass="btn-cancel"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            // Reset form but keep filters
            setFormData(prev => ({
              ...prev,
              quizName: "",
              duration: "",
              instructions: ""
            }));
            setSelectedQuestions([]);
          }}
          onCancel={() => {
            setAlert(null);
            navigate(-1);
          }}
        >
          "{formData.quizName}" has been created successfully. Do you want to add another quiz?
        </SweetAlert>
      );
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
        >
          Failed to create quiz. Please try again.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[1.75rem] font-semibold text-[#2162c1]">Add Quiz</h3>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Academic Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSelect
                label={<span>Program <span className="text-red-500">*</span></span>}
                value={formData.program}
                onChange={(e) => handleChange({ target: { name: 'program', value: e.target.value } })}
                options={programs}
                placeholder="Select Program"
              />

              <CustomSelect
                label={<span>Academic Year - Semester <span className="text-red-500">*</span></span>}
                value={formData.semester}
                onChange={(e) => handleChange({ target: { name: 'semester', value: e.target.value } })}
                options={semesters}
                placeholder="Select Academic Year - Semester"
                disabled={!formData.program}
              />

              <CustomSelect
                label="Batch"
                value={formData.batch}
                onChange={(e) => handleChange({ target: { name: 'batch', value: e.target.value } })}
                options={batches}
                placeholder="Select Batch"
                disabled={!formData.semester}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSelect
                label={<span>Paper <span className="text-red-500">*</span></span>}
                value={formData.paper}
                onChange={(e) => handleChange({ target: { name: 'paper', value: e.target.value } })}
                options={papers}
                placeholder="Select Paper"
                disabled={!formData.semester}
              />

              <CustomSelect
                label={<span>Module <span className="text-red-500">*</span></span>}
                value={formData.module}
                onChange={(e) => handleChange({ target: { name: 'module', value: e.target.value } })}
                options={modules.map(m => ({ label: m.module_name, value: String(m.module_id) }))}
                placeholder="Select Module"
                disabled={!formData.paper}
              />

              <CustomSelect
                label="Unit (Topic)"
                value={formData.unit}
                onChange={(e) => handleChange({ target: { name: 'unit', value: e.target.value } })}
                options={units.map(u => ({ label: u.unit_name, value: String(u.unit_id) }))}
                placeholder="Select Unit (Optional)"
                disabled={!formData.module}
              />
            </div>

            <label className="block mt-6 font-medium">Quiz Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="quizName"
              value={formData.quizName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg mb-4"
              placeholder="Enter Quiz Name"
            />

            <label className="block font-medium">Duration (minutes) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg mb-6"
            />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-medium">Select Questions <span className="text-red-500">*</span></label>
                {questionsList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectedQuestions.length === questionsList.length && questionsList.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions(questionsList.map(q => String(q.question_id)));
                        } else {
                          setSelectedQuestions([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium text-blue-600 cursor-pointer">
                      Select All ({questionsList.length})
                    </label>
                  </div>
                )}
              </div>
              {questionsList.length > 0 ? (
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {questionsList.map((q, index) => (
                      <div key={q.question_id} className="flex items-start gap-3 p-3 bg-white rounded border">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(String(q.question_id))}
                          onChange={(e) => {
                            const questionId = String(q.question_id);
                            if (e.target.checked) {
                              setSelectedQuestions([...selectedQuestions, questionId]);
                            } else {
                              setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
                            }
                          }}
                          className="mt-1 w-4 h-4 text-blue-600"
                        />
                        <label className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-600">Q{index + 1}.</span>
                          </div>
                          <p className="text-gray-800">{q.question || q.question_text}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
                  {formData.unit ? "No questions available for this unit" : "Please select a unit to view questions"}
                </div>
              )}
              {selectedQuestions.length > 0 && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-blue-600">
                    {selectedQuestions.length} of {questionsList.length} question(s) selected
                  </span>
                  {selectedQuestions.length > 0 && selectedQuestions.length < questionsList.length && (
                    <button
                      type="button"
                      onClick={() => setSelectedQuestions([])}
                      className="text-red-500 hover:text-red-700 underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              )}
            </div>


            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      {alert}
    </div>
  );
}