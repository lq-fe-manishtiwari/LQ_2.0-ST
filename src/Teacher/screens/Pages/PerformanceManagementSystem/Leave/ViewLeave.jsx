'use client';
import React, { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';

export default function ViewLeave() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the leave ID from URL params

  // Delete Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(false);
  const [password, setPassword] = useState('');
  
  // Success/Error Alert States
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const [showDeleteErrorAlert, setShowDeleteErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Sample previous leaves data
  const previousLeaves = [
    {
      id: "PL001",
      fromDate: "25-10-2025",
      toDate: "25-10-2025",
      leaveType: "Medical Leave",
      subject: "To weekly health check up",
      leaveDays: "1 Day"
    },
    {
      id: "PL002",
      fromDate: "25-10-2025",
      toDate: "26-10-2025",
      leaveType: "Medical Leave",
      subject: "To weekly health check up",
      leaveDays: "2 Day"
    }
  ];

  // DELETE HANDLERS
  const handleDelete = (id) => {
    setLeaveToDelete(id);
    setShowAlert(true);
  };
  
  const handleConfirmDelete = () => {
    setShowAlert(false);
    setPasswordAlert(true);
  };
  
  const handleCancelDelete = () => {
    setShowAlert(false);
    setLeaveToDelete(null);
  };
  
  const handlePasswordConfirm = () => {
    if (password === 'admin123') {
      setTimeout(() => {
        setPasswordAlert(false);
        setPassword('');
        setLeaveToDelete(null);
        setAlertMessage('Leave record deleted successfully!');
        setShowDeleteSuccessAlert(true);
      }, 500);
    } else {
      setPasswordAlert(false);
      setPassword('');
      setAlertMessage('Incorrect password. Leave deletion failed.');
      setShowDeleteErrorAlert(true);
    }
  };
  
  const handleCancelPassword = () => {
    setPasswordAlert(false);
    setPassword('');
    setLeaveToDelete(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-4 md:p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-pink-100 text-black px-4 py-2 
        rounded-full hover:bg-pink-200 transition mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Main Card */}
      <div className="bg-white w-full p-5 md:p-8 rounded-xl shadow-md max-w-6xl mx-auto mb-6">

        {/* Leave Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">

          <p><strong>Name :</strong> Tejas Chaudhari</p>
          <p><strong>Department :</strong> Digital Marketing</p>

          <p><strong>Leave Type :</strong> Casual Leave</p>
          <p><strong>Subject :</strong> traveling to my home town</p>

          <p><strong>From Date :</strong> 20-11-2025</p>
          <p><strong>To Date :</strong> 20-11-2025</p>

          <p><strong>Leave Days :</strong> 1 Day</p>
          <p><strong>Leave Pending :</strong> 10 Leave</p>
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="bg-green-100 text-green-600 font-semibold px-4 py-1 rounded-full">
            Total Leaves : 12
          </span>

          <span className="bg-red-100 text-red-600 font-semibold px-4 py-1 rounded-full">
            Leaves Taken : 3
          </span>
        </div>
      </div>

      {/* Previous Leaves Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md">

        <h3 className="p-4 font-semibold text-sm">Previous Leaves :</h3>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="table-th text-left">From Date</th>
                <th className="table-th text-left">To Date</th>
                <th className="table-th text-left">Leave Type</th>
                <th className="table-th text-left">Subject</th>
                <th className="table-th text-left">Leave Days</th>
                <th className="table-th text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {previousLeaves.map((leave) => (
                <tr key={leave.id} className="border-b">
                  <td className="p-3">{leave.fromDate}</td>
                  <td className="p-3">{leave.toDate}</td>
                  <td className="p-3">{leave.leaveType}</td>
                  <td className="p-3">{leave.subject}</td>
                  <td className="p-3">{leave.leaveDays}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="text-pink-500 hover:text-red-600 cursor-pointer transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="lg:hidden p-4 space-y-4">
          {previousLeaves.map((leave) => (
            <div key={leave.id} className="border rounded-xl p-4 shadow-sm bg-white">
              <p><strong>From Date:</strong> {leave.fromDate}</p>
              <p><strong>To Date:</strong> {leave.toDate}</p>
              <p><strong>Leave Type:</strong> {leave.leaveType}</p>
              <p><strong>Subject:</strong> {leave.subject}</p>
              <p><strong>Leave Days:</strong> {leave.leaveDays}</p>

              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDelete(leave.id)}
                  className="text-pink-500 hover:text-red-600 cursor-pointer transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALERT COMPONENTS */}
      {/* Delete Confirmation Alert */}
      {showAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete this Leave Record?
        </SweetAlert>
      )}
      
      {/* Password Protected Delete Confirmation */}
      {passwordAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4 sm:px-0">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md animate-fadeIn">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
              Admin Verification Required
            </h3>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              Enter your admin password to confirm deletion.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordConfirm();
              }}
              className="flex flex-col"
            >
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 text-center text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success/Error Alerts */}
      {showDeleteSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowDeleteSuccessAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
      
      {showDeleteErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowDeleteErrorAlert(false)}
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}
    </div>
  );
}