import React, { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import RoleModal from '../Components/RoleModal';
import { useParams, useNavigate } from "react-router-dom";
import Loader from '../Components/Loader';
import SweetAlert from 'react-bootstrap-sweetalert';
// import { TaskManagement } from '../../TaskManagement/Services/TaskManagement.service';
import { TaskManagement } from "../Services/TaskManagement.service";

export default function TaskView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* ---------------------------------------------------------
      FETCH TASK DETAILS (WITH CORRECT API MAPPING)
  ----------------------------------------------------------*/
  const fetchTaskDetails = async (taskId) => {
    try {
      setLoading(true);
      setError(null);

      // const response = await TaskManagement.getTaskAssignmentbyID(taskId);

      if (!response || typeof response !== "object") {
        throw new Error("Invalid API response");
      }

      // ---------------------------
      // CASE 1: response.data exists
      // ---------------------------
      if (response.data) {
        const r = response.data;

        // Set TASK object
        setTask({
          ...r,
          title: r.task?.task_name,
          description: r.task?.description,
          assignedDate: r.task?.assigned_date_time,
          dueDate: r.task?.due_date_time,
          taskType: r.task?.task_type?.task_type_name,
          status: r.assignment_status
        });

        // Set employees
        if (r.assignedEmployees) {
          setEmployees(r.assignedEmployees);
        } else {
          setEmployees([
            {
              id: r.user_id,
              name: r.user_name || `User ${r.user_id}`,
              designation: r.designation || "N/A",
              role: r.role_id,
              department: r.department_id
            }
          ]);
        }
        return;
      }

      // ---------------------------
      // CASE 2: response.task exists
      // ---------------------------
      if (response.task) {
        const r = response;

        setTask({
          ...r,
          title: r.task?.task_name,
          description: r.task?.description,
          assignedDate: r.task?.assigned_date_time,
          dueDate: r.task?.due_date_time,
          taskType: r.task?.task_type?.task_type_name,
          status: r.assignment_status
        });

        setEmployees([
          {
            id: r.user_id,
            name: r.user_name || `User ${r.user_id}`,
            designation: r.designation || "N/A",
            role: r.role_id,
            department: r.department_id
          }
        ]);
        return;
      }

      // ---------------------------
      // CASE 3: fallback
      // ---------------------------
      setTask(response);

      setEmployees([
        {
          id: response.user_id,
          name: response.user_name || `User ${response.user_id}`,
          designation: response.designation || "N/A",
          role: response.role_id,
          department: response.department_id
        }
      ]);

    } catch (err) {
      console.error("Error fetching task:", err);
      SweetAlert({
        title: "Error",
        text: err.message,
        type: "error"
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskDetails(id);
    } else {
      setError("No task ID");
      SweetAlert({
        title: "Error!",
        text: "No task ID in URL",
        type: "error",
      });
    }
  }, [id]);

  /* ---------------------------------------------------------
      HELPERS
  ----------------------------------------------------------*/
  const handleViewRoles = (employee) => {
    setSelectedEmployee(employee);
    setShowRoleModal(true);
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (isNaN(date)) return "N/A";

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${d}-${m}-${y} , ${hours}:${minutes} ${ampm}`;
  };

  const isTaskOverdue = (task) => {
    if (!task?.dueDate) return false;

    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };
  const calculateOverdueTime = (dueDate) => {
    if (!dueDate) return "Unknown";

    try {
      const due = new Date(dueDate);
      const now = new Date();

      const diffTime = now - due;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const diffMinutes = Math.floor(
        (diffTime % (1000 * 60 * 60)) / (1000 * 60)
      );

      return `${diffDays} Day ${diffHours} Hrs ${diffMinutes} Min`;
    } catch (error) {
      return "Unknown";
    }
  };

  /* ---------------------------------------------------------
      LOADING / ERROR STATES
  ----------------------------------------------------------*/
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#2162C1]" />
            <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
              Task Details
            </h2>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border w-full flex items-center justify-center py-16">
          <div className="flex flex-col items-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-gray-600">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#2162C1]" />
            <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
              Task Details
            </h2>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border w-full text-center py-16">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error loading task details</p>
            <p className="text-sm mt-2">{error || "Task not found"}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => fetchTaskDetails(id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = task;

  /* ---------------------------------------------------------
      MAIN RENDER
  ----------------------------------------------------------*/
  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">
            Task Details
          </h2>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Task Info Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT SIDE */}
          <div className="space-y-4 lg:space-y-6">
            <div className="break-words">
              <span className="font-semibold text-gray-700">Title:</span>
              <p className="text-gray-900 mt-1 text-lg font-medium">
                {data.title || "N/A"}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">
                Assigned Date & Time:
              </span>
              <p className="text-gray-900 mt-1">
                {formatDate(data.assignedDate)}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Assigned By:</span>
              <p className="text-gray-900 mt-1">
                {data.assigned_by || data.assignedBy || "N/A"}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">
                Priority:
              </span>
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                  (data.priority || "normal").toLowerCase() === "high"
                    ? "bg-red-100 text-red-800"
                    : (data.priority || "normal").toLowerCase() === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {data.priority || "Normal"}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4 lg:space-y-6">
            <div className="break-words">
              <span className="font-semibold text-gray-700">
                Description:
              </span>
              <p className="text-gray-900 mt-1 whitespace-pre-line">
                {data.description || "No description provided"}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">
                Due Date & Time:
              </span>
              <p
                className={`mt-1 font-medium ${
                  isTaskOverdue(data) ? "text-red-600" : "text-gray-900"
                }`}
              >
                {formatDate(data.dueDate)}
              </p>
              {isTaskOverdue(data) && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                  Overdue by: {calculateOverdueTime(data.dueDate)}
                </span>
              )}
            </div>

            <div>
              <span className="font-semibold text-gray-700">Task Type:</span>
              <p className="text-gray-900 mt-1">
                {data.taskType || "N/A"}
              </p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">
                Status:
              </span>
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                  (data.status || "").toLowerCase() === "complete" ||
                  (data.status || "").toLowerCase() === "completed"
                    ? "bg-green-100 text-green-800"
                    : (data.status || "").toLowerCase() === "in-progress" ||
                      (data.status || "").toLowerCase() === "inprogress" ||
                      (data.status || "").toLowerCase() === "active" ||
                      (data.status || "").toLowerCase() === "pending" ||
                      (data.status || "").toLowerCase() === "assigned"
                    ? "bg-blue-100 text-blue-800"
                    : (data.status || "").toLowerCase() === "incomplete"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Employee Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                <th className="table-th text-center">Name</th>
                <th className="table-th text-center">Designation</th>
                <th className="table-th text-center">Role</th>
                <th className="table-th text-center">Department</th>
                <th className="table-th text-center">Roles & Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees && employees.length > 0 ? (
                employees.map((employee, index) => (
                  <tr
                    key={employee.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {employee.name || employee.employeeName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {employee.designation || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {employee.role || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">
                      {employee.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewRoles(employee)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No employees assigned to this task
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {employees && employees.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              disabled={true}
              className={`px-4 py-2 rounded-md text-white bg-blue-200 text-gray-400 cursor-not-allowed`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {1}–{employees.length} of {employees.length} entries
            </span>

            <button
              disabled={true}
              className={`px-4 py-2 rounded-md text-white bg-blue-200 text-gray-400 cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Mobile View Cards */}
      <div className="lg:hidden space-y-4">
        {employees && employees.length > 0 ? (
          employees.map((employee, index) => (
            <div
              key={employee.id || index}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {employee.name || employee.employeeName || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {employee.designation || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  {employee.role || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Department:</span>{" "}
                  {employee.department || "N/A"}
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button
                  onClick={() => handleViewRoles(employee)}
                  className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No employees assigned to this task</p>
          </div>
        )}
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        employee={selectedEmployee}
      />
    </div>
  );
}
