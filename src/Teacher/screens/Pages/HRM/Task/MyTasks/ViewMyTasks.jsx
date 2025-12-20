import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, X } from "lucide-react";
import { TaskManagement } from '../../Services/TaskManagement.service';

export default function ViewMyTasks() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);


  // Fetch task data
  useEffect(() => {
    if (id) {
      TaskManagement.getMyTaskbyID(id)
        .then(response => {
          if (response) {
            setTask(response);
          }
        })
        .catch(error => {
          console.error('Error fetching task:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return `${day}-${month}-${year} , ${strTime}`;
  };

  // Map API data to display format
  const data = task ? {
    title: task.title || "No Title",
    description: task.description || "No Description",
    assignedDate: formatDate(task.assigned_date_time),
    dueDate: formatDate(task.due_date_time),
    assignedBy: "Self",
    taskType: task.task_type?.task_type_name || "General",
    priority: task.priority?.priority_name || "Medium",
    status: task.status?.name || "Pending",
    overdue: task.overdue ? `${task.days_until_due} Days` : null,
  } : null;

  // Helper function to check if task is overdue
  const isTaskOverdue = (task) => {
    if (task.status === 'Complete' || task.status === 'Completed') return false;
    const dateStr = task.dueDate.split(' , ')[0]; // Get date part
    const [day, month, year] = dateStr.split('-');
    const dueDate = new Date(year, month - 1, day);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return dueDate < currentDate;
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border w-full text-center">
          <p className="text-gray-500">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border w-full text-center">
          <p className="text-red-500">Task not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 md:p-8">

      {/* ⭐ TOP HEADING + BACK BUTTON */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        {/* LEFT: ICON + HEADING */}
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-[#2162C1]" />
          <h2 className="pageheading text-lg sm:text-xl md:text-2xl">Task Details</h2>
        </div>

        {/* RIGHT: BACK BUTTON */}
        <button
          onClick={() => navigate("/hrm/tasks/my-tasks")}
          className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 
                     flex items-center justify-center rounded-full shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ⭐ MAIN VIEW CARD - Updated Layout */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border w-full">
        
        {/* Two Column Layout as per screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* LEFT COLUMN */}
          <div className="space-y-4 lg:space-y-6">
            
            <div className="break-words">
              <span className="font-semibold text-gray-700">Title:</span>
              <p className="text-gray-900 mt-1">{data.title}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Assigned Date & Time:</span>
              <p className="text-gray-900 mt-1">{data.assignedDate}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Assigned By:</span>
              <p className="text-gray-900 mt-1">{data.assignedBy}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">Priority:</span>
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                  data.priority === "High"
                    ? "bg-red-100 text-red-800"
                    : data.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {data.priority}
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 lg:space-y-6">
            
            <div className="break-words">
              <span className="font-semibold text-gray-700">Description:</span>
              <p className="text-gray-900 mt-1">{data.description}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Due Date & Time:</span>
              <p className={`mt-1 font-medium ${
                isTaskOverdue(data) ? 'text-red-600' : 'text-gray-900'
              }`}>
                {data.dueDate}
              </p>
              {isTaskOverdue(data) && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                  Overdue by: {data.overdue}
                </span>
              )}
            </div>

            <div>
              <span className="font-semibold text-gray-700">Task Type:</span>
              <p className="text-gray-900 mt-1">{data.taskType}</p>
            </div>

            <div>
              <span className="font-semibold text-gray-700 block mb-2">Status:</span>
              <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                data.status === 'Complete' || data.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : data.status === 'In-Progress' || data.status === 'Active'
                  ? 'bg-blue-100 text-blue-800'
                  : data.status === 'Incomplete'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data.status}
              </span>
            </div>

          </div>
        </div>
      </div>


    </div>
  );
}
