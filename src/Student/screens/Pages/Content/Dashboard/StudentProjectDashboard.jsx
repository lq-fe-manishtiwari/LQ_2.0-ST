import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, Edit, Trash2, ChevronDown, Clock, FileText, ExternalLink } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
// import { useUserProfile } from '../../../../../contexts/UserProfileContext';
// import ContentService from './Service/Content.service';
// import StudentProjectService from './Service/StudentProject.service';

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
          <span className={`flex-1 truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
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

export default function StudentProjectDashboard() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [filters, setFilters] = useState({
    subject: "",
    module: "",
    unit: "",
  });

  // Load projects when unit is selected
  useEffect(() => {
    if (filters.unit) {
      loadProjectsByUnit(filters.unit);
    } else {
      setProjects([]);
    }
  }, [filters.unit]);

  // Load subjects when component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!profile?.student_id) return;

      try {
        // Get student's allocated subjects
        const response = await ContentService.getStudentSubjects(profile.student_id);
        if (response.success && response.data) {
          const subjectsData = Array.isArray(response.data) ? response.data : [];
          const formattedSubjects = subjectsData.map(s => ({
            label: s.subject?.name || s.name,
            value: s.subject?.subject_id || s.subject_id
          }));
          setSubjects(formattedSubjects);
        }
      } catch (err) {
        console.error("Error loading subjects:", err);
      }
    };

    fetchSubjects();
  }, [profile?.student_id]);

  // Load modules when subject changes
  useEffect(() => {
    if (!filters.subject) {
      setModules([]);
      setUnits([]);
      setFilters(prev => ({ ...prev, module: "", unit: "" }));
      return;
    }

    const loadModules = async () => {
      try {
        const response = await ContentService.getModulesAndUnits(filters.subject);
        if (response.success && response.data?.modules) {
          const formatted = response.data.modules.map(mod => ({
            label: mod.module_name,
            value: String(mod.module_id),
            units: mod.units || []
          }));
          setModules(formatted);
          setUnits([]);
          setFilters(prev => ({ ...prev, module: "", unit: "" }));
        }
      } catch (err) {
        console.error("Error fetching modules:", err);
        setModules([]);
      }
    };

    loadModules();
  }, [filters.subject]);

  // Load units when module changes
  useEffect(() => {
    if (!filters.module) {
      setUnits([]);
      setFilters(prev => ({ ...prev, unit: "" }));
      return;
    }

    const selectedModule = modules.find(m => m.value === filters.module);
    const formattedUnits = selectedModule?.units?.map(u => ({
      label: u.unit_name,
      value: String(u.unit_id),
    })) || [];

    setUnits(formattedUnits);
    setFilters(prev => ({ ...prev, unit: "" }));
  }, [filters.module, modules]);

  const loadProjectsByUnit = async (unitId) => {
    try {
      const res = await StudentProjectService.getProjectsByUnit(unitId, profile?.student_id);
      setProjects(res || []);
    } catch (err) {
      console.error("Error loading projects for unit:", err);
      setProjects([]);
    }
  };

  const getFilteredProjects = () => {
    return projects;
  };

  const handleDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    setShowAlert(false);
    try {
      await StudentProjectService.deleteProject(projectToDelete);
      setAlertMessage('Project deleted successfully!');
      setShowDeleteSuccessAlert(true);
      if (filters.unit) {
        loadProjectsByUnit(filters.unit);
      }
      setProjectToDelete(null);
    } catch (err) {
      console.error('Delete project error:', err);
      setErrorMessage('Failed to delete project. Please try again.');
      setShowDeleteErrorAlert(true);
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setProjectToDelete(null);
  };

  const handleAddProject = () => {
    const params = new URLSearchParams({
      studentId: profile?.student_id || '',
    });
    navigate(`/add-project?${params.toString()}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header: Filter + Create Project Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all flex-1 sm:flex-none sm:w-auto"
          >
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
            <ChevronDown
              className={`w-4 h-4 text-blue-600 transition-transform ${filterOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleAddProject}
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-3 rounded-md shadow-md transition-all hover:shadow-lg flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="sm:inline">Add New Project</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {filterOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <CustomSelect
              label="Subject"
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              options={subjects}
              placeholder="Select Subject"
            />

            <CustomSelect
              label="Module"
              value={filters.module}
              onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
              options={modules}
              placeholder="Select Module"
              disabled={!filters.subject}
            />

            <CustomSelect
              label="Unit"
              value={filters.unit}
              onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
              options={units}
              placeholder="Select Unit"
              disabled={!filters.module}
            />
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-indigo-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mb-6 sm:mb-8">
            {filters.unit ? 'Filtered Projects' : 'All Projects'}
          </h3>

          {(() => {
            const filteredProjects = getFilteredProjects();
            return filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.project_id}
                    className="group p-4 sm:p-6 bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-indigo-200"
                  >
                    {/* Title */}
                    <h4 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {project.project_title}
                    </h4>

                    {/* Description */}
                    {project.project_description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {project.project_description}
                      </p>
                    )}

                    {/* Project Link */}
                    <div className="flex items-center gap-2 mb-4">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        View Project
                      </a>
                    </div>

                    {/* Status */}
                    <p className={`text-xs mb-4 px-3 py-1 rounded-full inline-block font-medium ${
                      project.approval_status 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-yellow-700 bg-yellow-50'
                    }`}>
                      Status: {project.approval_status ? 'Approved' : 'Pending'}
                    </p>

                    {/* Edit + Delete Buttons */}
                    <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                      <button
                        onClick={() =>
                          navigate("edit-project", {
                            state: { project: project, filters: filters }
                          })
                        }
                        className="p-2 sm:p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition touch-manipulation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.project_id)}
                        className="p-2 sm:p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">
                  {filters.unit ? 'No projects found for selected filters.' : 'No projects available.'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete!"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          You won't be able to recover this project!
        </SweetAlert>
      )}

      {/* Success Alert */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
        >
          {alertMessage}
        </SweetAlert>
      )}

      {/* Error Alert */}
      {showDeleteErrorAlert && (
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setShowDeleteErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      )}
    </div>
  );
}