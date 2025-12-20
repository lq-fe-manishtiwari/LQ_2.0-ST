import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { useUserProfile } from '../../../../../contexts/UserProfileContext';
import StudentProjectService from '../Service/StudentProject.service';

export default function StudentProjectDashboard() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [projects, setProjects] = useState([]);

  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Retrieve location state passed from ContentDashboard
  const { state } = useLocation();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!profile?.student_id) return;
      try {
        const response = await StudentProjectService.getMyProjects(profile.student_id);

        if (response.success && Array.isArray(response.data)) {
          setProjects([...response.data].reverse());
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setProjects([]);
      }

    };
    fetchProjects();
  }, [profile?.student_id]);

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
      // Refresh list
      const response = await StudentProjectService.getMyProjects(profile.student_id);
      if (response.success && Array.isArray(response.data)) {
        setProjects(response.data);
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
    navigate(`add-project`, {
      state: {
        studentId: profile?.student_id,
        programId: state?.programId,
        semesterId: state?.semesterId,
        academicYearId: state?.academicYearId
      }
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header: Create Project Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
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

      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-indigo-100">
        <div>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((project) => (
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
                  <p
                    className={`text-xs mb-4 px-3 py-1 rounded-full inline-block font-medium
    ${project.approval_status === "APPROVED"
                        ? "text-green-700 bg-green-50"
                        : project.approval_status === "REJECTED"
                          ? "text-red-700 bg-red-50"
                          : "text-yellow-700 bg-yellow-50"
                      }`}
                  >
                    Status: {project.approval_status}
                  </p>



                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">
                No projects submitted yet.
              </p>
            </div>
          )}
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