import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, Edit2, Trash2, Eye, User, X } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert";

export default function ViewUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [todayTasks, setTodayTasks] = useState([
    { id: 31, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Pending" },
    { id: 32, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Pending" },
    { id: 33, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Pending" },
    { id: 4, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Pending" },
  ]);

  const [yesterdayTasks, setYesterdayTasks] = useState([
    { id: 5, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Completed" },
    { id: 6, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Pending" },
    { id: 7, title: "Creative of Diwali", type: "Adopt", assignedBy: "Ranee Nikure", assignedOn: "20-09-2025 12:00 PM", dueOn: "20-09-2025 12:00 PM", priority: "High", status: "Completed" },
  ]);

  // User data fetch karein userId ke basis pe
  useEffect(() => {
    // Yahan aap API call karenge user data fetch karne ke liye
    // Example: 
    // fetchUserData(userId).then(data => setUserData(data));
    
    // For now, using mock data
    const mockUserData = {
      name: "Tejas Chaudhari",
      role: "Employee",
      designation: "Graphic Designer"
    };
    setUserData(mockUserData);
  }, [userId]);

  const onView = (task) => {
    console.log('View task:', task);
  };

  const onEdit = (task) => {
    console.log('Edit task:', task);
  };

  const onDelete = (taskId) => {
    setTaskToDelete(taskId);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    console.log('Delete task:', taskToDelete);
    
    // Remove task from todayTasks
    const updatedTodayTasks = todayTasks.filter(task => task.id !== taskToDelete);
    setTodayTasks(updatedTodayTasks);
    
    // Remove task from yesterdayTasks
    const updatedYesterdayTasks = yesterdayTasks.filter(task => task.id !== taskToDelete);
    setYesterdayTasks(updatedYesterdayTasks);
    
    setShowAlert(false);
    setTaskToDelete(null);
    
    // Yahan aap API call karenge actual delete karne ke liye
    // deleteTask(taskToDelete).then(() => {
    //   setShowAlert(false);
    //   setTaskToDelete(null);
    // });
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
    setTaskToDelete(null);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            {/* Search + Name/Role + Close Button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search for tasks"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
                />
              </div>

              {/* Name and Role - Centered */}
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold">Name : {userData.name}</h2>
                <p className="text-sm text-gray-600">
                  Role : {userData.role} <span className="mx-2">•</span> Designation : {userData.designation}
                </p>
              </div>

              {/* Close Button */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-md transition-all"
                onClick={() => navigate(-1)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Today Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">Today</h3>
            
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th text-center table-header">Task Title</th>
                      <th className="table-th text-center table-header">Task Type</th>
                      <th className="table-th text-center table-header">Assigned By</th>
                      <th className="table-th text-center table-header">Assigned on</th>
                      <th className="table-th text-center table-header">Due on</th>
                      <th className="table-th text-center table-header">Priority</th>
                      <th className="table-th text-center table-header">Status</th>
                      <th className="table-th text-center table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {todayTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-4 text-sm text-gray-900 truncate text-center">{task.title}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.type}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.assignedBy}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.assignedOn}</td>
                        <td className="px-3 py-4 text-sm font-semibold truncate text-center text-red-600">{task.dueOn}</td>
                        <td className="px-2 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyles(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link to={`/pms/user-dashboard/view-task/${task.id}`}>
                              <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`/pms/user-dashboard/edit-task/${task.id}`}>
                              <button className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {task.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-medium">Type:</span> {task.type}</div>
                      <div><span className="font-medium">Assigned By:</span> {task.assignedBy}</div>
                      <div><span className="font-medium">Assigned:</span> {task.assignedOn}</div>
                      <div className="col-span-2">
                        <span className="font-medium text-red-600">Due:</span> 
                        <span className="font-semibold text-red-600">{task.dueOn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    <div className="flex items-center gap-2">
                      <Link to={`/pms/user-dashboard/view-task/${task.id}`}>
                        <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to={`../users/edit-task/${task.id}`}>
                        <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yesterday Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">Yesterday</h3>
            
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th text-center table-header">Task Title</th>
                      <th className="table-th text-center table-header">Task Type</th>
                      <th className="table-th text-center table-header">Assigned By</th>
                      <th className="table-th text-center table-header">Assigned on</th>
                      <th className="table-th text-center table-header">Due on</th>
                      <th className="table-th text-center table-header">Priority</th>
                      <th className="table-th text-center table-header">Status</th>
                      <th className="table-th text-center table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {yesterdayTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-4 text-sm text-gray-900 truncate text-center">{task.title}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.type}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.assignedBy}</td>
                        <td className="px-3 py-4 text-sm text-gray-700 truncate text-center">{task.assignedOn}</td>
                        <td className="px-3 py-4 text-sm font-semibold truncate text-center">{task.dueOn}</td>
                        <td className="px-2 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyles(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === "Completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link to={`/pms/user-dashboard/view-task/${task.id}`}>
                              <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <Link to={`../users/edit-task/${task.id}`}>
                              <button className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {yesterdayTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <User className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === "Completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-medium">Type:</span> {task.type}</div>
                      <div><span className="font-medium">Assigned By:</span> {task.assignedBy}</div>
                      <div><span className="font-medium">Assigned:</span> {task.assignedOn}</div>
                      <div className="col-span-2">
                        <span className="font-medium">Due:</span> 
                        <span className="font-semibold">{task.dueOn}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    <div className="flex items-center gap-2">
                      <Link to={`/pms/user-dashboard/view-task/${task.id}`}>
                        <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link to={`../users/edit-task/${task.id}`}>
                        <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SweetAlert for Delete Confirmation */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          cancelBtnText="Cancel"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this task?
        </SweetAlert>
      )}
    </>
  );
}