import React from 'react';
const { useState, useEffect } = React;
import { ProfessionalEthicsService } from '../Services/ProfessionalEthics.service';
import { Plus, X, ChevronDown, Eye, Edit, School, List, Loader2, Upload, ShieldCheck, Trash2, Download } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import ExcelUploadModal from '../Component/ExcelUploadModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProfessionalEthics = () => {
  // States
  const [ethicsList, setEthicsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchCollegeId, setSearchCollegeId] = useState('');
  const [selectedEthics, setSelectedEthics] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedIds, setExpandedIds] = useState([1]); // Default first one expanded
  const [isDownloading, setIsDownloading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    college_id: '',
    title: '',
    ethics_points: [{ point: '' }]
  });

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch all professional ethics on component mount
  useEffect(() => {
    fetchAllProfessionalEthics();
  }, [currentPage, rowsPerPage]);

  // API Functions - Updated to match your API response structure
  const fetchAllProfessionalEthics = async () => {
    try {
      setLoading(true);
      const response = await ProfessionalEthicsService.GetAllProfessionalEthics(currentPage, rowsPerPage);
      console.log('Get All Response:', response); // For debugging

      if (response && Array.isArray(response)) {
        // Direct array response
        setEthicsList(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / rowsPerPage));
      } else if (response && response.content) {
        // Paginated response with content property
        setEthicsList(response.content);
        setTotalItems(response.totalElements || response.content.length);
        setTotalPages(response.totalPages || Math.ceil(response.content.length / rowsPerPage));
      } else {
        setEthicsList([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      showAlert('Error!', 'Failed to fetch professional ethics', 'error');
      console.error('Error fetching ethics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCollegeId = async () => {
    if (!searchCollegeId) {
      showAlert('Warning!', 'Please enter a College ID', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await ProfessionalEthicsService.GetProfessionalEthicsByCollegeId(
        searchCollegeId,
        currentPage,
        rowsPerPage
      );
      console.log('College Search Response:', response); // For debugging

      if (response && Array.isArray(response)) {
        setEthicsList(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / rowsPerPage));
      } else if (response && response.content) {
        setEthicsList(response.content);
        setTotalItems(response.totalElements || response.content.length);
        setTotalPages(response.totalPages || Math.ceil(response.content.length / rowsPerPage));
      } else {
        setEthicsList([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      showAlert('Error!', 'Failed to fetch professional ethics for college', 'error');
      console.error('Error fetching by college:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async (id) => {
    try {
      const response = await ProfessionalEthicsService.GetProfessionalEthicsById(id);
      console.log('Get By ID Response:', response); // For debugging

      // Response should be a single object
      if (response && response.professional_ethics_id) {
        setSelectedEthics(response);
        setShowViewDialog(true);
      } else {
        showAlert('Error!', 'Invalid response format', 'error');
      }
    } catch (err) {
      showAlert('Error!', 'Failed to fetch details', 'error');
      console.error('Error fetching by ID:', err);
    }
  };

  const handleExcelConfirm = async (excelData) => {
    try {
      setLoading(true);
      setShowUploadModal(false);

      // Group by title if multiple points are in the same file for the same title
      const grouped = excelData.reduce((acc, row) => {
        const title = row.title || row.Title || 'Bulk Ethics';
        const point = row.point || row.Point || row.ethics_point || '';
        if (!acc[title]) acc[title] = [];
        if (point) acc[title].push({ point });
        return acc;
      }, {});

      const collegeId = parseInt(ethicsList[0]?.college_id || 1);

      for (const title of Object.keys(grouped)) {
        const payload = {
          college_id: collegeId,
          title: title,
          ethics_points: grouped[title]
        };
        await ProfessionalEthicsService.PostProfessionalEthics(payload);
      }

      showAlert('Success!', 'Bulk upload completed successfully!', 'success');
      fetchAllProfessionalEthics();
    } catch (err) {
      showAlert('Error!', 'Bulk upload failed', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validate form data
      if (!formData.title || formData.ethics_points.length === 0) {
        showAlert('Warning!', 'Please fill all required fields', 'warning');
        return;
      }

      // Filter out empty points
      const filteredPoints = formData.ethics_points.filter(point => point.point.trim() !== '');

      if (filteredPoints.length === 0) {
        showAlert('Warning!', 'Please add at least one ethics point', 'warning');
        return;
      }

      // Get college_id from localStorage
      const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
      const collegeId = activeCollege?.id || ethicsList[0]?.college_id || 1;

      // Prepare payload exactly as per API specification
      const payload = {
        college_id: parseInt(collegeId),
        title: formData.title.trim(),
        ethics_points: filteredPoints.map(point => ({
          point: point.point.trim()
        }))
      };

      console.log('Create Payload:', payload); // For debugging

      const response = await ProfessionalEthicsService.PostProfessionalEthics(payload);
      console.log('Create Response:', response); // For debugging

      if (response && response.professional_ethics_id) {
        showAlert('Success!', 'Professional ethics created successfully!', 'success');
        setShowCreateDialog(false);
        resetForm();
        fetchAllProfessionalEthics();
      } else {
        showAlert('Error!', 'Unexpected response format', 'error');
      }
    } catch (err) {
      showAlert('Error!', 'Failed to create professional ethics', 'error');
      console.error('Error creating:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!selectedEthics?.professional_ethics_id) return;

      // Prepare payload exactly as per API specification
      const filteredPoints = formData.ethics_points.filter(point => point.point.trim() !== '');
      const payload = {
        college_id: parseInt(formData.college_id || selectedEthics.college_id),
        title: formData.title || selectedEthics.title,
        ethics_points: filteredPoints.map(point => ({
          point: point.point.trim()
        }))
      };

      console.log('Update Payload:', payload); // For debugging

      const response = await ProfessionalEthicsService.UpdateProfessionalEthics(
        selectedEthics.professional_ethics_id,
        payload
      );
      console.log('Update Response:', response); // For debugging

      if (response && response.professional_ethics_id) {
        showAlert('Success!', 'Professional ethics updated successfully!', 'success');
        setShowCreateDialog(false);
        resetForm();
        fetchAllProfessionalEthics();
      } else {
        showAlert('Error!', 'Unexpected response format', 'error');
      }
    } catch (err) {
      showAlert('Error!', 'Failed to update professional ethics', 'error');
      console.error('Error updating:', err);
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      await ProfessionalEthicsService.SoftDeleteProfessionalEthics(id);
      showAlert('Success!', 'Professional ethics soft deleted successfully!', 'success');
      fetchAllProfessionalEthics();
    } catch (err) {
      showAlert('Error!', 'Failed to delete professional ethics', 'error');
      console.error('Error deleting:', err);
    }
  };

  const handleHardDelete = async (id) => {
    try {
      await ProfessionalEthicsService.HardDeleteProfessionalEthics(id);
      showAlert('Success!', 'Professional ethics permanently deleted!', 'success');
      fetchAllProfessionalEthics();
    } catch (err) {
      showAlert('Error!', 'Failed to delete professional ethics', 'error');
      console.error('Error deleting:', err);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePointChange = (index, value) => {
    const updatedPoints = [...formData.ethics_points];
    updatedPoints[index] = { point: value };
    setFormData(prev => ({
      ...prev,
      ethics_points: updatedPoints
    }));
  };

  const addPointField = () => {
    setFormData(prev => ({
      ...prev,
      ethics_points: [...prev.ethics_points, { point: '' }]
    }));
  };

  const removePointField = (index) => {
    if (formData.ethics_points.length > 1) {
      const updatedPoints = formData.ethics_points.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ethics_points: updatedPoints
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      college_id: '',
      title: '',
      ethics_points: [{ point: '' }]
    });
    setSelectedEthics(null);
  };

  const handleEditClick = (ethics) => {
    setSelectedEthics(ethics);
    setFormData({
      college_id: ethics.college_id.toString(),
      title: ethics.title,
      ethics_points: ethics.ethics_points.map(point => ({ point: point.point }))
    });
    setShowCreateDialog(true);
  };

  const handleViewClick = async (id) => {
    await fetchById(id);
  };

  // SweetAlert Helper
  const showAlert = (title, message, type) => {
    setAlert(
      <SweetAlert
        title={title}
        onConfirm={() => setAlert(null)}
        type={type}
        style={{
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        {message}
      </SweetAlert>
    );
  };

  const showConfirmDelete = (ethics) => {
    setSelectedEthics(ethics);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        cancelBtnText="Cancel"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => {
          setAlert(null);
          handleHardDelete(ethics.professional_ethics_id);
        }}
        onCancel={() => {
          setAlert(null);
          setSelectedEthics(null);
        }}
        style={{
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        Do you want to delete this professional ethics entry?
      </SweetAlert>
    );
  };

  // Pagination handlers
  const handleChangePage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setCurrentPage(0);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const getReportMeta = () => {
    const activeCollege = JSON.parse(localStorage.getItem('activeCollege') || '{}');
    const collegeName = activeCollege?.college_name || activeCollege?.name || 'N/A';
    const collegeFilter = searchCollegeId ? `College ID: ${searchCollegeId}` : 'All';
    const generatedOn = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const programName = 'N/A'; // Since filters aren't directly available here
    const teacherName = 'N/A';
    return { collegeName, collegeFilter, generatedOn, programName, teacherName };
  };

  const handleDownloadPDF = () => {
    if (!ethicsList.length) return;
    const { collegeName, programName, teacherName } = getReportMeta();
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    // College name (top)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(collegeName, margin, 14);

    // Report title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Report: Code of Professional Ethics', margin, 21);

    // Program & Teacher row
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`Program: ${programName}`, margin, 27);
    doc.text(`Teacher: ${teacherName}`, pageW - margin, 27, { align: 'right' });

    // Separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(margin, 31, pageW - margin, 31);

    let y = 38;

    ethicsList.forEach((ethics, idx) => {
      const titleText = `${idx + 1}.  ${ethics.title}`;
      const titleLines = doc.splitTextToSize(titleText, contentW - 8);
      const titleBlockH = titleLines.length * 6 + 7;

      // Page break if not enough room
      if (y + titleBlockH + 14 > pageH - 14) {
        doc.addPage();
        y = 20;
      }

      // Blue header block (like accordion header)
      doc.setFillColor(235, 243, 255);
      doc.setDrawColor(147, 197, 253);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentW, titleBlockH, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 78, 216);
      doc.text(titleLines, margin + 5, y + 5.5);
      y += titleBlockH + 3;

      // Ethics points as bullet list
      (ethics.ethics_points || []).forEach((pt) => {
        const pointLines = doc.splitTextToSize(pt.point, contentW - 16);
        const pointH = pointLines.length * 5.5 + 3;

        if (y + pointH > pageH - 14) {
          doc.addPage();
          y = 20;
        }

        // Bullet dot (blue)
        doc.setFillColor(96, 165, 250);
        doc.circle(margin + 5, y + 2.2, 1, 'F');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(pointLines, margin + 10, y + 2);
        y += pointH;
      });

      y += 7; // gap between sections
    });

    // Footer - UGC reference (same as UI)
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(160, 160, 160);
    doc.text('Reference: UGC Guidelines', margin, pageH - 8);

    doc.save(`Professional_Ethics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div id="professional-ethics-content" className="max-w-7xl mx-auto space-y-8 p-4 bg-gray-50 rounded-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Professional Ethics Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4" data-html2canvas-ignore>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-md shadow-green-100 active:scale-95 text-sm disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>

          {/* <div className="flex items-center gap-4">
            <button
              onClick={handleOpenCreateDialog}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-md shadow-green-100 active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Ethics
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md shadow-blue-100 active:scale-95 text-sm"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div> */}
        </div>

        {/* Accordion Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          {/* Visual Header matching the image */}
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Code of Professional Ethics</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {ethicsList.length > 0 ? (
                ethicsList.map((ethics, index) => {
                  const isExpanded = expandedIds.includes(ethics.professional_ethics_id || ethics.id);
                  return (
                    <div
                      key={ethics.professional_ethics_id || ethics.id}
                      className={`group border rounded-xl transition-all duration-300 ${isExpanded ? 'border-blue-200 bg-blue-50/5 shadow-sm' : 'border-gray-200 hover:border-blue-200'}`}
                    >
                      {/* Accordion Header */}
                      <div
                        className="px-5 py-4 flex items-center justify-between cursor-pointer select-none"
                        onClick={() => {
                          const id = ethics.professional_ethics_id || ethics.id;
                          setExpandedIds(prev =>
                            prev.includes(id)
                              ? prev.filter(expandedId => expandedId !== id)
                              : [...prev, id]
                          );
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-blue-600 font-bold text-sm min-w-[20px]">{index + 1}.</span>
                          <h3 className={`text-sm font-semibold transition-colors ${isExpanded ? 'text-blue-700' : 'text-gray-800'}`}>
                            {ethics.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Action Buttons (Visible on hover or when expanded) */}
                          {/* <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isExpanded ? 'opacity-100' : ''}`}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditClick(ethics); }}
                              className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); showConfirmDelete(ethics); }}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div> */}
                          <div className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="pl-9 space-y-2.5">
                            {(ethics.ethics_points || []).map((point, pIdx) => (
                              <div key={pIdx} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                                <p className="flex-1">{point.point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium italic">
                    No ethics entries have been defined yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Note matching the image */}
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex justify-end">
            <p className="text-[10px] italic text-gray-400 font-medium">
              Reference: UGC Guidelines
            </p>
          </div>
        </div>

        {/* SweetAlert Create/Edit Dialog */}
        {showCreateDialog && (
          <SweetAlert
            title={
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
                  {selectedEthics ? <Edit className="text-white w-5 h-5" /> : <Plus className="text-white w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-lg tracking-normal">
                    {selectedEthics ? "Edit Ethics Code" : "Create New Ethics"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Define professional standards for your campus</p>
                </div>
              </div>
            }
            showCancel
            confirmBtnText={selectedEthics ? "Save Changes" : "Create Ethics"}
            cancelBtnText="Cancel"
            confirmBtnBsStyle="primary"
            onConfirm={selectedEthics ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowCreateDialog(false);
              resetForm();
            }}
            style={{
              borderRadius: '24px',
              padding: '24px',
              width: '640px',
              maxWidth: '95vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
            customButtons={
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50 w-full">
                <button
                  onClick={() => { setShowCreateDialog(false); resetForm(); }}
                  className="px-6 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-all"
                >
                  DISMISS
                </button>
                <button
                  onClick={selectedEthics ? handleUpdate : handleCreate}
                  className="px-8 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 tracking-normal"
                >
                  {selectedEthics ? "Update" : "Confirm & Save"}
                </button>
              </div>
            }
          >
            <div className="text-left mt-2">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 mb-2 tracking-normal">
                    <List size={14} className="text-blue-500" />
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-medium text-gray-800"
                    required
                    placeholder="e.g., Academic Professional Ethics 2024"
                  />
                </div>

                <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-50">
                  <div className="flex items-center justify-between mb-4 border-b border-blue-100/50 pb-3">
                    <label className="text-[13px] font-semibold text-blue-900 tracking-normal">
                      Ethics Clauses & Points
                    </label>
                    <button
                      type="button"
                      onClick={addPointField}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                    >
                      <Plus size={12} strokeWidth={3} />
                      Add New Item
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {formData.ethics_points.map((point, index) => (
                      <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex-shrink-0 w-7 h-7 bg-white border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm mt-1">
                          {index + 1}
                        </div>
                        <textarea
                          placeholder={`Clause #${index + 1}: Enter details here...`}
                          value={point.point}
                          onChange={(e) => handlePointChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all resize-none text-[13px] text-gray-700 min-h-[50px]"
                          rows="2"
                          required
                        />
                        {formData.ethics_points.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePointField(index)}
                            className="shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-blue-400">
                    <Loader2 size={12} className="animate-spin" />
                    <p className="text-[10px] font-semibold tracking-normal">
                      Ensure each point is concise and clear.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SweetAlert>
        )}

        {/* SweetAlert View Dialog */}
        {showViewDialog && selectedEthics && (
          <SweetAlert
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PE</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{selectedEthics.title}</h3>
                  <p className="text-sm text-gray-600">College ID: {selectedEthics.college_id}</p>
                </div>
              </div>
            }
            onConfirm={() => setShowViewDialog(false)}
            confirmBtnText="Close"
            style={{
              borderRadius: '8px',
              padding: '20px',
              width: '600px',
              maxWidth: '90vw'
            }}
          >
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ethics ID</p>
                  <p className="font-semibold">#{selectedEthics.professional_ethics_id || selectedEthics.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">College ID</p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    <School className="w-3 h-3 mr-1" />
                    {selectedEthics.college_id}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Title</p>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium">{selectedEthics.title}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <List className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-700">Ethics Points</h4>
                  <span className="ml-auto text-sm text-gray-500">
                    {(selectedEthics.ethics_points || []).length} points
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {(selectedEthics.ethics_points || []).map((point, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700">{point.point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* <div className="mt-6">
              <button
                onClick={() => {
                  setShowViewDialog(false);
                  handleEditClick(selectedEthics);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit This Ethics
              </button>
            </div> */}
          </SweetAlert>
        )}

        {/* Excel Upload Modal */}
        {showUploadModal && (
          <ExcelUploadModal
            title="Bulk Upload Professional Ethics"
            onClose={() => setShowUploadModal(false)}
            onConfirm={handleExcelConfirm}
          />
        )}

        {/* Render SweetAlert */}
        {alert}
      </div>
    </div>
  );
};

export default ProfessionalEthics;
