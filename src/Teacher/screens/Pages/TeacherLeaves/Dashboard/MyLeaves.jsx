import React, { useState, useEffect } from 'react';
import { leaveService } from '../Services/Leave.Service';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
  Eye,
  Edit,
  Trash2,
  FileWarning,
  FileText,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Calendar,
  Clock,
  File,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function MyLeaves() {
  // ── STATE ───────────────────────────────────────────────────────────────
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Form states
  const [showFullPageForm, setShowFullPageForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [oldDays, setOldDays] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);

  const [leaveForm, setLeaveForm] = useState({
    type: '',
    leaveFor: 'FULL_DAY',
    fromDate: '',
    toDate: '',
    days: '',
    reason: '',
    newAttachments: [],
    existingAttachments: [],
  });

  const [leaveTypes, setLeaveTypes] = useState([]);

  // SweetAlert states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── DATA FETCHING ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const collegeId = userProfile?.college_id || '16';
        const userId = userProfile?.user?.user_id || userProfile?.user_id;

        if (!collegeId || !userId) {
          setError('User profile not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Leave types
        const typesResponse = await leaveService.getLeaveTypesByCollegeId(collegeId);
        const studentLeaveTypes = Array.isArray(typesResponse)
          ? typesResponse.filter((lt) => lt.user_type === 'TEACHER' && lt.is_active)
          : [];
        setLeaveTypes(studentLeaveTypes);

        // User's leaves
        const leavesResponse = await leaveService.getLeavesByUserId(userId);
        const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
        const leavesWithSr = leaves.map((leave, index) => ({
          ...leave,
          sr: index + 1,
        }));
        setLeaveRecords(leavesWithSr);

        // Summary
        const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
        setLeaveSummary(summaryResponse);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load leave data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetchLeaves = async () => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const userId = userProfile?.user?.user_id || userProfile?.user_id;

      const leavesResponse = await leaveService.getLeavesByUserId(userId);
      const leaves = Array.isArray(leavesResponse) ? leavesResponse : [];
      const leavesWithSr = leaves.map((leave, index) => ({
        ...leave,
        sr: index + 1,
      }));
      setLeaveRecords(leavesWithSr);

      const summaryResponse = await leaveService.getLeavesSummaryByUserId(userId);
      setLeaveSummary(summaryResponse);
    } catch (err) {
      console.error('Error refetching leaves:', err);
    }
  };

  // ── FORM HANDLERS ───────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'type') {
      const policyObj = leaveTypes.find((lt) => lt.leave_type_id === parseInt(value));
      setSelectedPolicy(policyObj?.leave_policy || null);
    }

    if (name === 'attachment') {
      setLeaveForm((prev) => ({
        ...prev,
        newAttachments: Array.from(files),
      }));
    } else {
      setLeaveForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetFormAndClose = () => {
    setShowFullPageForm(false);
    setIsEditMode(false);
    setEditingLeaveId(null);
    setEditingStatus(null);
    setOldDays(0);
    setLeaveForm({
      type: '',
      leaveFor: 'FULL_DAY',
      fromDate: '',
      toDate: '',
      days: '',
      reason: '',
      newAttachments: [],
      existingAttachments: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const user_id = userProfile?.user?.user_id || userProfile?.user_id;
      const college_id = userProfile?.college_id || '16';

      if (!user_id || !college_id) {
        setErrorMessage('User information missing. Please log in again.');
        setShowErrorAlert(true);
        return;
      }

      const basePayload = {
        college_id,
        user_id,
        leave_type_id: leaveForm.type,
        leaveFor: leaveForm.leaveFor,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        days: leaveForm.days,
        reason: leaveForm.reason,
        attachment: leaveForm.newAttachments,
      };

      if (isEditMode) {
        await leaveService.updateLeaveForm(editingLeaveId, basePayload);
        setSuccessMessage('Leave updated successfully!');
      } else {
        await leaveService.applyLeave({
          ...basePayload,
          leave_status: 'Pending',
        });
        setSuccessMessage('Leave applied successfully!');
      }

      setShowSuccessAlert(true);
      resetFormAndClose();
      await refetchLeaves();
    } catch (error) {
      console.error('Failed to save leave:', error);
      setErrorMessage(error?.response?.data?.message || 'Failed to save leave. Please try again.');
      setShowErrorAlert(true);
    }
  };

  // ── UTILITY FUNCTIONS ───────────────────────────────────────────────────
  const countWeekdays = (startDate, endDate) => {
    let count = 0;
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count += 1;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // Auto-calculate days
  useEffect(() => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.type) {
      setLeaveForm((prev) => ({ ...prev, days: '' }));
      return;
    }

    const selectedType = leaveTypes.find((lt) => lt.leave_type_id === parseInt(leaveForm.type));
    if (!selectedType) return;

    const from = new Date(leaveForm.fromDate);
    const to = new Date(leaveForm.toDate);

    if (to < from) {
      setLeaveForm((prev) => ({ ...prev, days: '' }));
      return;
    }

    const diffTime = to - from;
    const totalCalendarDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let calculatedDays = 0;

    if (leaveForm.leaveFor === 'HALF_DAY') {
      setLeaveForm((prev) => ({ ...prev, toDate: prev.fromDate }));
      calculatedDays = 0.5;

      if (!selectedType.is_includes_weekends) {
        const day = from.getDay();
        if (day === 0 || day === 6) calculatedDays = 0;
      }
    } else {
      const weekdays = countWeekdays(leaveForm.fromDate, leaveForm.toDate);
      if (selectedType.is_includes_weekends) {
        calculatedDays = totalCalendarDays;
      } else {
        if (selectedType.is_sandwich_leaves && totalCalendarDays > weekdays) {
          calculatedDays = totalCalendarDays;
        } else {
          calculatedDays = weekdays;
        }
      }
    }

    setLeaveForm((prev) => ({
      ...prev,
      days: calculatedDays > 0 ? calculatedDays.toFixed(1) : '',
    }));
  }, [leaveForm.fromDate, leaveForm.toDate, leaveForm.leaveFor, leaveForm.type, leaveTypes]);

  const handleEdit = (leave) => {
    console.log("Editing leave → full object:", leave);
    console.log("leave_status:", leave.leave_status);
    console.log("attachment field:", leave.attachment);
    console.log("typeof attachment:", typeof leave.attachment);
    console.log("Array.isArray(attachment):", Array.isArray(leave.attachment));

    setIsEditMode(true);
    setEditingLeaveId(leave.apply_leave_id || leave.id);
    setEditingStatus(leave.leave_status);
    setOldDays(leave.days || leave.no_of_days);

    let attachments = [];
    if (Array.isArray(leave.attachment)) {
      attachments = leave.attachment.filter(Boolean);
    } else if (typeof leave.attachment === 'string' && leave.attachment.trim()) {
      attachments = [leave.attachment.trim()];
    } else if (leave.attachments) {           // ← maybe backend uses plural
      attachments = Array.isArray(leave.attachments)
        ? leave.attachments.filter(Boolean)
        : [leave.attachments].filter(Boolean);
    }

    console.log("Final existingAttachments:", attachments);

    setLeaveForm({
      type: String(leave.leave_type_id || leave.leave_type || ''),
      leaveFor: leave.leave_duration || leave.leaveFor || 'FULL_DAY',
      fromDate: leave.from || leave.start_date || leave.fromDate || '',
      toDate: leave.to || leave.end_date || leave.toDate || '',
      days: leave.days || leave.no_of_days || '',
      reason: leave.reason || leave.remark || '',
      existingAttachments: attachments,
      newAttachments: [],
    });

    setShowFullPageForm(true);
  };

  const confirmDelete = (leaveId) => {
    setDeleteLeaveId(leaveId);
    setShowConfirmDelete(true);
  };

  const handleDelete = async () => {
    try {
      await leaveService.hardDeleteLeave(deleteLeaveId);
      setSuccessMessage('Leave deleted successfully!');
      setShowSuccessAlert(true);
      await refetchLeaves();
    } catch (error) {
      console.error('Failed to delete leave', error);
      setErrorMessage('Failed to delete leave. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setShowConfirmDelete(false);
      setDeleteLeaveId(null);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Rejected':
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'Rejected':
      case 'REJECTED':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  const displayLeaveFor = (leaveFor) => {
    return leaveFor === 'HALF_DAY' ? 'Half Day' : 'Full Day';
  };

  const getAvailableDays = (leaveTypeId) => {
    if (leaveSummary && leaveSummary.leave_summary) {
      const summaryItem = leaveSummary.leave_summary.find(
        (item) => item.leave_type_id === parseInt(leaveTypeId)
      );
      if (summaryItem && summaryItem.balance !== undefined) {
        return Math.max(0, parseFloat(summaryItem.balance));
      }
    }

    const selectedType = leaveTypes.find((lt) => lt.leave_type_id === parseInt(leaveTypeId));
    if (!selectedType || selectedType.no_of_days_allowed == null) return Infinity;

    const allowed = parseFloat(selectedType.no_of_days_allowed);
    let approvedDays = 0;
    let pendingDays = 0;

    leaveRecords.forEach((leave) => {
      if (leave.leave_type_id === parseInt(leaveTypeId)) {
        const days = parseFloat(leave.days || leave.no_of_days || 0);
        if (leave.leave_status === 'Approved' || leave.leave_status === 'APPROVED') {
          approvedDays += days;
        } else if (leave.leave_status === 'Pending') {
          pendingDays += days;
        }
      }
    });

    if (isEditMode && editingLeaveId) {
      const oldD = parseFloat(oldDays || 0);
      if (editingStatus === 'Approved' || editingStatus === 'APPROVED') approvedDays -= oldD;
      else if (editingStatus === 'Pending') pendingDays -= oldD;
    }

    return Math.max(0, allowed - (approvedDays + pendingDays));
  };

  const getDaysValidationMessage = () => {
    if (!leaveForm.type) return null;

    const available = getAvailableDays(leaveForm.type);

    if (available === Infinity) {
      if (!leaveForm.days || parseFloat(leaveForm.days) <= 0) {
        return '⚠️ Invalid date selection (e.g., weekends not counted)';
      }
      return `✓ ${leaveForm.days} day${leaveForm.days !== '1' ? 's' : ''} requested (Unlimited)`;
    }

    if (available <= 0) {
      return '❌ No leave balance remaining for this type';
    }

    if (!leaveForm.days || parseFloat(leaveForm.days) <= 0) {
      return '⚠️ Invalid date selection';
    }

    const requested = parseFloat(leaveForm.days);

    if (requested > available + 0.0001) {
      return `⚠️ Exceeds limit: Only ${available} day${available !== 1 ? 's' : ''} available`;
    }

    return `✓ ${requested} day${requested !== 1 ? 's' : ''} requested (${available} remaining)`;
  };

  const isSubmitDisabled = () => {
    if (
      !leaveForm.type ||
      !leaveForm.fromDate ||
      !leaveForm.toDate ||
      !leaveForm.days ||
      parseFloat(leaveForm.days) <= 0
    ) {
      return true;
    }

    const available = getAvailableDays(leaveForm.type);
    if (available !== Infinity && parseFloat(leaveForm.days) > available + 0.0001) {
      return true;
    }

    return false;
  };

  // ── PAGINATION CALCULATIONS ───────────────────────────────────────────────
  const totalEntries = leaveRecords.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  const currentEntries = leaveRecords.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );


  // ── RENDER ──────────────────────────────────────────────────────────────
  // Full page form
  if (showFullPageForm) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                {/* Title */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">
                  {isEditMode ? "Edit Leave" : "Apply Leave"}
                </h2>

                {/* Right side buttons */}
                <div className="flex items-center gap-3">
                  {/* View Leave Policy */}
                  {selectedPolicy && (
                    <button
                      type="button"
                      onClick={() => setShowPolicy(!showPolicy)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition text-sm font-medium"
                    >
                      <FileWarning size={18} />
                      View Leave Policy
                    </button>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={resetFormAndClose}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 border rounded border-black-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                </div>
              </div>


              {/* {selectedPolicy && (
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => setShowPolicy(!showPolicy)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition text-sm font-medium w-full sm:w-auto"
                  >
                    <FileWarning size={18} />
                    View Leave Policy
                  </button>
                </div>
              )} */}

              {showPolicy && selectedPolicy && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-700 mb-2">
                    Leave Policy Details
                  </h3>

                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {typeof selectedPolicy === "string"
                      ? selectedPolicy
                      : selectedPolicy?.description || "No policy details available."}
                  </p>
                </div>
              )}

            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={leaveForm.type}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => {
                    const available = getAvailableDays(lt.leave_type_id);
                    const isDisabled = available <= 0 && available !== Infinity;

                    return (
                      <option
                        key={lt.leave_type_id}
                        value={lt.leave_type_id}
                        disabled={isDisabled}
                        className="text-sm"
                      >
                        {lt.leave_type}{' '}
                        {lt.no_of_days_allowed
                          ? `(Max: ${lt.no_of_days_allowed} days, ${lt.is_paid ? 'Paid' : 'Unpaid'
                          }) ${isDisabled ? '- No balance left' : `- ${available} day${available !== 1 ? 's' : ''} left`}`
                          : `(Unlimited, ${lt.is_paid ? 'Paid' : 'Unpaid'})`}
                      </option>
                    );
                  })}
                </select>

                {leaveForm.type &&
                  getAvailableDays(leaveForm.type) <= 0 &&
                  getAvailableDays(leaveForm.type) !== Infinity && (
                    <p className="text-red-600 text-sm mt-2">
                      ❌ You have no remaining balance for this leave type.
                    </p>
                  )}
              </div>

              {/* Leave Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Leave Duration</label>
                <select
                  name="leaveFor"
                  value={leaveForm.leaveFor}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="FULL_DAY">Full Day</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={leaveForm.fromDate}
                    onChange={handleFormChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={leaveForm.toDate}
                    onChange={handleFormChange}
                    required
                    min={leaveForm.fromDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  {leaveForm.leaveFor === 'HALF_DAY' && (
                    <p className="text-xs text-gray-500 mt-1">
                      To Date auto-set to From Date for Half Day
                    </p>
                  )}
                </div>
              </div>

              {/* Number of Days */}
              <div>
                <label className="block text-sm font-medium mb-2">Number of Days</label>
                <input
                  type="text"
                  value={leaveForm.days || ''}
                  readOnly
                  placeholder="Auto-calculated"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-sm sm:text-base"
                />
                {getDaysValidationMessage() && (
                  <p
                    className={`mt-3 text-sm font-medium ${getDaysValidationMessage().includes('Exceeds') ||
                      getDaysValidationMessage().includes('No balance') ||
                      getDaysValidationMessage().includes('Invalid')
                      ? 'text-red-600'
                      : 'text-green-600'
                      }`}
                  >
                    {getDaysValidationMessage()}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <textarea
                  name="reason"
                  placeholder="Reason for leave (optional)"
                  value={leaveForm.reason}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium mb-2">Attachment (Optional)</label>
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFormChange}
                  multiple
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:text-xs sm:file:text-sm"
                />

                {leaveForm.newAttachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {leaveForm.newAttachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 truncate">
                          <FileText size={14} className="flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const url = URL.createObjectURL(file);
                            setPreviewFile({
                              name: file.name,
                              type: file.type,
                              url: url,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex-shrink-0 ml-2"
                        >
                          <Eye size={14} />
                          <span className="hidden xs:inline">View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show existing attachments in BOTH new & edit mode when available */}
                {leaveForm.existingAttachments?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {isEditMode ? "Existing" : "Attached"} Attachments
                    </p>
                    <ul className="space-y-2">
                      {leaveForm.existingAttachments.map((url, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 truncate">
                            <FileText size={14} className="flex-shrink-0" />
                            <span className="truncate">Attachment {idx + 1}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const urlObj = URL.createObjectURL
                                ? { name: `Attachment ${idx + 1}`, type: 'image/jpeg', url } // fallback type
                                : { name: `Attachment ${idx + 1}`, type: url.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg', url };
                              setPreviewFile(urlObj);
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex-shrink-0 ml-2"
                          >
                            <Eye size={14} />
                            <span className="hidden xs:inline">View</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6">
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto"
                >
                  {isEditMode ? 'Update Leave' : 'Apply Leave'}
                </button>
              </div>

              {/* File Preview Modal */}
              {previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold truncate">
                        {previewFile.name}
                      </h3>
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(previewFile.url);
                          setPreviewFile(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50">
                      {previewFile.type.startsWith("image/") ? (
                        <img
                          src={previewFile.url}
                          alt={previewFile.name}
                          className="w-full h-full object-contain"
                        />
                      ) : previewFile.type === "application/pdf" ? (
                        <iframe
                          src={previewFile.url}
                          title={previewFile.name}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                          <FileText className="w-16 h-16 mb-4 text-gray-400" />
                          <p>Preview not available for this file type.</p>
                          <a
                            href={previewFile.url}
                            download={previewFile.name}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Download Instead
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>

        {/* SweetAlerts in form view */}
        <SweetAlert
          show={showConfirmDelete}
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        >
          This action cannot be undone.
        </SweetAlert>
        <SweetAlert
          show={showSuccessAlert}
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>
        <SweetAlert
          show={showErrorAlert}
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      </div>
    );
  }

  // ── MAIN LIST VIEW ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700">My Leaves</h1>
            {leaveSummary && leaveSummary.total_balance !== undefined && (
              <p className="text-sm text-gray-600 mt-1">
                Total balance: {leaveSummary.total_balance} days
              </p>
            )}
          </div>

          <button
            onClick={() => setShowFullPageForm(true)}
            style={{ backgroundColor: '#fcd34d' }}
            className="px-4 py-2.5 sm:px-5 sm:py-2 text-black rounded-lg hover:opacity-90 transition font-medium w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>Apply Leave</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-10 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              Loading leaves...
            </div>
          ) : error ? (
            <div className="p-8 sm:p-10 text-center text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              {error}
            </div>
          ) : leaveRecords.length === 0 ? (
            <div className="p-8 sm:p-10 text-center text-gray-500">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No leave records</h3>
                <p className="text-gray-500 mb-6">You haven't applied for any leaves yet.</p>
                <button
                  onClick={() => setShowFullPageForm(true)}
                  style={{ backgroundColor: '#fcd34d' }}
                  className="px-6 py-2.5 text-black rounded-lg hover:opacity-90 transition font-medium"
                >
                  + Apply Your First Leave
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="table-header">
                      <tr>
                        <th className="table-th p-4 text-left font-semibold">#</th>
                        <th className="table-th p-4 text-left font-semibold">Leave Type</th>
                        <th className="table-th p-4 text-left font-semibold">Duration</th>
                        <th className="table-th p-4 text-left font-semibold">From</th>
                        <th className="table-th p-4 text-left font-semibold">To</th>
                        <th className="table-th p-4 text-left font-semibold">Days</th>
                        <th className="table-th p-4 text-left font-semibold">Status</th>
                        <th className="table-th p-4 text-left font-semibold">Reason</th>
                        <th className="table-th p-4 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEntries.map((leave) => (
                        <tr key={leave.sr} className="border-t hover:bg-blue-50 transition-colors">
                          <td className="p-4">{leave.sr}</td>
                          <td className="p-4 font-medium">{leave.leave_type_name || leave.leave_type}</td>
                          <td className="p-4">{displayLeaveFor(leave.leave_duration || leave.leaveFor)}</td>
                          <td className="p-4">{leave.from || leave.start_date}</td>
                          <td className="p-4">{leave.to || leave.end_date}</td>
                          <td className="p-4">{leave.days || leave.no_of_days}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${statusColor(
                                leave.leave_status
                              )}`}
                            >
                              {getStatusIcon(leave.leave_status)}
                              {leave.leave_status}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate">{leave.reason || leave.remark || '-'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(leave)}
                                className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition border border-amber-200"
                                title="Edit Leave"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => confirmDelete(leave.apply_leave_id || leave.id)}
                                className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                                title="Delete Leave"
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
              <div className="lg:hidden">
                <div className="p-4 space-y-4">
                  {currentEntries.map((leave) => (
                    <div
                      key={leave.sr}
                      className="bg-white border rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            #{leave.sr}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center ${statusColor(
                              leave.leave_status
                            )}`}
                          >
                            {getStatusIcon(leave.leave_status)}
                            {leave.leave_status}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-800">
                          {leave.days || leave.no_of_days} day
                          {parseFloat(leave.days || leave.no_of_days) !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Main Content */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {leave.leave_type_name || leave.leave_type}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {leave.reason || leave.remark || 'No reason provided'}
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">From</p>
                              <p className="text-sm font-medium">{leave.from || leave.start_date}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">To</p>
                              <p className="text-sm font-medium">{leave.to || leave.end_date}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-medium">
                                {displayLeaveFor(leave.leave_duration || leave.leaveFor)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Actions</p>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleEdit(leave)}
                                  className="p-1.5 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition border border-amber-200"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(leave.apply_leave_id || leave.id)}
                                  className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                      {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => {
                          // Simple ellipsis logic for mobile
                          if (window.innerWidth < 640 && Math.abs(i + 1 - currentPage) > 1 && i + 1 !== 1 && i + 1 !== totalPages) {
                            if (i + 1 === currentPage - 2 || i + 1 === currentPage + 2) {
                              return <span key={i} className="px-2 py-1">...</span>;
                            }
                            return null;
                          }

                          return (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`px-3 py-1.5 rounded text-sm ${currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Global SweetAlerts */}
        <SweetAlert
          show={showConfirmDelete}
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        >
          This action cannot be undone.
        </SweetAlert>

        <SweetAlert
          show={showSuccessAlert}
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </SweetAlert>

        <SweetAlert
          show={showErrorAlert}
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      </div>
    </div>
  );
}