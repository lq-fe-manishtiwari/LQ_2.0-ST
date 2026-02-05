import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, X, FileText, Download, Loader, ExternalLink, Link as LinkIcon } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { timetableService } from '../Services/timetable.service';

const ViewUpadateTeacher = ({ slotId, slotType, initialData = [], onRefresh }) => {
    // State for edit popup
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // State for SweetAlert
    const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState(false);
    const [deleteAlert, setDeleteAlert] = useState({ id: null, name: '' });

    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Transform and update items when initialData changes
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            const transformedData = initialData.map(item => ({
                ...item,
                // Add id field for component compatibility
                id: item.class_update_id,
                // Map server fields to component fields
                academic_diary: item.notes || '',
                // Use link field for meeting links
                meeting_link: item.link || '',
                // Use documents array for uploaded files
                related_document_url: (item.documents && item.documents.length > 0) 
                    ? item.documents[0].path 
                    : '',
                // Store document name
                document_name: (item.documents && item.documents.length > 0)
                    ? item.documents[0].name
                    : '',
                teacher_name: `${item.user_firstname || ''} ${item.user_middlename || ''} ${item.user_lastname || ''}`.trim(),
                // Store additional notes
                additional_notes: item.note || ''
            }));
            console.log('Transformed data:', transformedData);
            setItems(transformedData);
        } else {
            setItems([]);
        }
    }, [initialData]);

    // Handler functions
    const handleViewClick = (item) => {
        setCurrentItem({...item, isViewOnly: true});
        setShowEditPopup(true);
    };

    const handleEditClick = (item) => {
        setCurrentItem({...item});
        setShowEditPopup(true);
    };

    const handleDeleteClick = (id, name) => {
        console.log('Delete clicked for ID:', id);
        setDeleteAlert({ id, name });
        setShowDeleteConfirmAlert(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Check file size (10MB limit)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setAlertMessage('File size must be less than 10MB');
            setShowStatusSuccessAlert(true);
            return;
        }

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        
        if (!allowedTypes.includes(selectedFile.type)) {
            setAlertMessage('Please upload PDF, DOC, DOCX, JPG, or PNG files only');
            setShowStatusSuccessAlert(true);
            return;
        }

        setUploading(true);
        
        try {
            console.log('Starting immediate upload for:', selectedFile.name);
            
            // Immediately upload file to S3
            const fileUrl = await timetableService.uploadFileToS3(selectedFile);
            
            console.log('File uploaded successfully, URL:', fileUrl);
            
            // Update current item with the uploaded URL
            setCurrentItem(prev => ({
                ...prev,
                related_document_url: fileUrl,
                fileName: selectedFile.name,
                document_name: selectedFile.name
            }));
            
            setAlertMessage('Document uploaded successfully!');
            setShowStatusSuccessAlert(true);
            
        } catch (error) {
            console.error('Error uploading file:', error);
            setAlertMessage(error.message || 'Failed to upload file');
            setShowStatusSuccessAlert(true);
        } finally {
            setUploading(false);
        }
    };

    const removeUploadedFile = () => {
        setCurrentItem(prev => ({
            ...prev,
            related_document_url: '',
            fileName: '',
            document_name: ''
        }));
    };

    const handleDownloadDocument = (url, filename) => {
        if (!url) return;
        
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConfirmDelete = async () => {
        if (!deleteAlert.id) return;

        setLoading(true);
        try {
            console.log('Attempting to delete class update with ID:', deleteAlert.id);
            
            // Call the service function
            await timetableService.deleteClassUpdates([deleteAlert.id]);
            
            // Remove from local state
            const updatedItems = items.filter(item => item.class_update_id !== deleteAlert.id);
            setItems(updatedItems);
            
            setAlertMessage('Update deleted successfully!');
            setShowStatusSuccessAlert(true);
            
            // Refresh parent component
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error deleting class update:', error);
            setAlertMessage(error.message || 'Failed to delete update');
            setShowStatusSuccessAlert(true);
        } finally {
            setLoading(false);
            setDeleteAlert({ id: null, name: '' });
            setShowDeleteConfirmAlert(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteAlert({ id: null, name: '' });
        setShowDeleteConfirmAlert(false);
    };

    const handleEditFormSubmit = async (e) => {
        e.preventDefault();
    
        if (!currentItem.academic_diary) {
            setAlertMessage('Academic diary message is required');
            setShowStatusSuccessAlert(true);
            return;
        }
    
        setLoading(true);
        try {
            const payload = {
                notes: currentItem.academic_diary,
                user_id: currentItem.user_id,
                college_id: currentItem.college_id
            };
    
            if (currentItem.meeting_link && currentItem.meeting_link.trim() !== '') {
                payload.link = currentItem.meeting_link.trim();
            }
    
            if (currentItem.related_document_url && currentItem.related_document_url.trim() !== '') {
                payload.documents = [
                    {
                        name: currentItem.document_name || 'Related Document',
                        path: currentItem.related_document_url.trim()
                    }
                ];
            }
    
            if (currentItem.additional_notes) {
                payload.note = currentItem.additional_notes;
            }
    
            console.log('Updating class update with payload:', payload);
    
            const response = await timetableService.updateClassUpdate(
                currentItem.class_update_id,
                payload
            );
    
            const updatedItems = items.map(item =>
                item.class_update_id === currentItem.class_update_id
                    ? {
                        ...item,
                        ...response,
                        academic_diary: response.notes || '',
                        meeting_link: response.link || '',
                        related_document_url:
    response.documents?.length > 0
        ? response.documents[0].path
        : currentItem.related_document_url || '',

document_name:
    response.documents?.length > 0
        ? response.documents[0].name
        : currentItem.document_name || '',

                    }
                    : item
            );
    
            setItems(updatedItems);
    
            setAlertMessage('Update saved successfully!');
            setShowStatusSuccessAlert(true);
    
            if (onRefresh) onRefresh();
    
            setShowEditPopup(false);
            setCurrentItem(null);
    
        } catch (error) {
            console.error('Error updating class update:', error);
            setAlertMessage(error.message || 'Failed to save changes');
            setShowStatusSuccessAlert(true);
        } finally {
            setLoading(false);
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
                <FileText size={40} sm:size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Updates Found</h3>
                <p className="text-sm sm:text-base text-gray-500">
                    No academic diary entries have been created for this class session yet.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {isMobile ? (
                    // Mobile Card View
                    <div className="divide-y divide-gray-200">
                        {items.map((item) => {
                            const hasMeetingLink = item.meeting_link && item.meeting_link.trim() !== '';
                            const hasDocument = item.related_document_url && item.related_document_url.trim() !== '';
                            
                            return (
                                <div key={item.class_update_id} className="p-4 space-y-3">
                                    {/* Academic Diary */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Academic Diary</h3>
                                        <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            <div className="font-medium mb-1">
                                                {item.academic_diary || item.notes || 'No message'}
                                            </div>
                                            {item.additional_notes && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.additional_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meeting Link */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Meeting Link</h3>
                                        {hasMeetingLink ? (
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <LinkIcon size={16} className="text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-700">Meeting Link</span>
                                                </div>
                                                <a 
                                                    href={item.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-800 break-all underline inline-flex items-center gap-1"
                                                >
                                                    Open Meeting
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm bg-gray-50 p-3 rounded-lg">No link</div>
                                        )}
                                    </div>

                                    {/* Document */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Document</h3>
                                        {hasDocument ? (
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <a
                                                    href={item.related_document_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-green-600 hover:text-green-800 underline font-medium inline-flex items-center gap-1"
                                                >
                                                    <FileText size={14} />
                                                    {item.document_name || `Document-${item.class_update_id}`}
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm bg-gray-50 p-3 rounded-lg">No document</div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <button
                                            onClick={() => handleViewClick(item)}
                                            className="flex-1 p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Eye size={18} />
                                            <span className="text-sm font-medium">View</span>
                                        </button>

                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="flex-1 p-3 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Edit size={18} />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>

                                        <button
                                            onClick={() => handleDeleteClick(item.class_update_id, `Update #${item.class_update_id}`)}
                                            className="flex-1 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Desktop Table View
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="table-header text-white">
                                <tr style={{ backgroundColor: "#2162C1" }}>
                                    <th className="table-th text-center text-white" style={{ backgroundColor: "#2162C1" }}>
                                        Academic Diary
                                    </th>
                                    <th className="table-th text-center text-white" style={{ backgroundColor: "#2162C1" }}>
                                        Meeting Link
                                    </th>
                                    <th className="table-th text-center text-white" style={{ backgroundColor: "#2162C1" }}>
                                        Document
                                    </th>
                                    <th className="table-th text-center text-white" style={{ backgroundColor: "#2162C1" }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {items.map((item) => {
                                    const hasMeetingLink = item.meeting_link && item.meeting_link.trim() !== '';
                                    const hasDocument = item.related_document_url && item.related_document_url.trim() !== '';
                                    
                                    return (
                                        <tr key={item.class_update_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700">
                                                    <div className="font-medium mb-1">
                                                        {item.academic_diary || item.notes || 'No message'}
                                                    </div>
                                                    {item.additional_notes && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {item.additional_notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {hasMeetingLink ? (
                                                    <div className="p-2 max-w-xs mx-auto">
                                                        <div className="flex items-center gap-2 mb-1 justify-center">
                                                            <LinkIcon size={14} className="text-blue-600" />
                                                            <span className="text-xs font-medium text-blue-700">Meeting Link</span>
                                                        </div>
                                                        <a 
                                                            href={item.meeting_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 break-all underline inline-flex items-center gap-1"
                                                            title={item.meeting_link}
                                                        >
                                                            Open
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No link</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {hasDocument ? (
                                                    <a
                                                        href={item.related_document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                                                        title={item.document_name || 'View Document'}
                                                    >
                                                        {item.document_name || `Document-${item.class_update_id}`}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No document</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleViewClick(item)}
                                                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteClick(item.class_update_id, `Update #${item.class_update_id}`)}
                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit/View Popup */}
            {showEditPopup && currentItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                                {currentItem.isViewOnly ? 'View Update' : 'Edit Update'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowEditPopup(false);
                                    setCurrentItem(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                                disabled={loading || uploading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Popup Form */}
                        <form onSubmit={handleEditFormSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Academic Diary Message *
                                    </label>
                                    <textarea 
                                        name="academic_diary"
                                        value={currentItem.academic_diary || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter detailed notes..."
                                        className="w-full p-3 border border-gray-300 rounded-lg h-32 sm:h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        disabled={currentItem.isViewOnly || loading || uploading}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <LinkIcon size={16} />
                                            Meeting Link (Optional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="meeting_link"
                                        value={currentItem.meeting_link || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://meet.google.com/xxx-yyyy-zzz"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        disabled={currentItem.isViewOnly || loading || uploading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be saved in the "link" field
                                    </p>
                                </div>

                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <FileText size={16} />
                                            Additional Notes (Optional)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="additional_notes"
                                        value={currentItem.additional_notes || ''}
                                        onChange={handleInputChange}
                                        placeholder="Brief summary or other information..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        disabled={currentItem.isViewOnly || loading || uploading}
                                    />
                                </div> */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <FileText size={16} />
                                            Upload Document (Optional)
                                        </span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        {currentItem.related_document_url ? (
                                            <div className="mb-4">
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                          
                                                            <div className="flex-1">
                                                                
                                                                <p className="text-xs text-gray-500 mb-1">
                                                                    {currentItem.document_name || currentItem.fileName || 'Document'}
                                                                </p>
                                                                <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
                                                                    <a 
                                                                        href={currentItem.related_document_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 hover:text-blue-800 break-all underline"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {currentItem.related_document_url}
                                                                    </a>
                                                                </div>
                                                               
                                                            </div>
                                                        </div>
                                                        {!currentItem.isViewOnly && (
                                                            <button
                                                                type="button"
                                                                onClick={removeUploadedFile}
                                                                className="text-gray-400 hover:text-red-500 ml-2"
                                                                disabled={uploading || loading}
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : uploading ? (
                                            <div className="mb-4">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Loader className="animate-spin text-blue-600" size={24} />
                                                        <div>
                                                            <p className="text-blue-600 font-medium text-sm">
                                                                Uploading document...
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Please wait
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 mb-3 text-center">
                                                No document attached
                                            </p>
                                        )}
                                        
                                        {!currentItem.isViewOnly && (
                                            <div>
                                                <label className={`cursor-pointer ${uploading || loading ? 'pointer-events-none opacity-50' : ''}`}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        disabled={uploading || loading}
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    />
                                                    <div className={`px-4 py-2 rounded-lg font-medium text-center transition-colors ${
                                                        uploading || loading
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {uploading ? 'Uploading...' : 'Upload New Document'}
                                                    </div>
                                                </label>
                                               </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Popup Footer */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditPopup(false);
                                        setCurrentItem(null);
                                    }}
                                    className="px-4 sm:px-6 py-3 border border-gray-400 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
                                    disabled={loading || uploading}
                                >
                                    {currentItem.isViewOnly ? 'Close' : 'Cancel'}
                                </button>
                                
                                {!currentItem.isViewOnly && (
                                    <button
                                        type="submit"
                                        disabled={loading || uploading || !currentItem.academic_diary}
                                        className={`px-4 sm:px-6 py-3 rounded-full font-medium transition-colors order-1 sm:order-2 ${
                                            loading || uploading || !currentItem.academic_diary
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="animate-spin inline mr-2" size={16} />
                                                <span className="text-sm sm:text-base">Saving...</span>
                                            </>
                                        ) : uploading ? (
                                            <>
                                                <Loader className="animate-spin inline mr-2" size={16} />
                                                <span className="text-sm sm:text-base">Uploading...</span>
                                            </>
                                        ) : (
                                            <span className="text-sm sm:text-base">Save Changes</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SweetAlert for Success Messages */}
            {showStatusSuccessAlert && (
                <SweetAlert
                    success
                    title="Success!"
                    onConfirm={() => setShowStatusSuccessAlert(false)}
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                >
                    {alertMessage}
                </SweetAlert>
            )}

            {/* SweetAlert for Delete Confirmation */}
            {showDeleteConfirmAlert && (
                <SweetAlert
                    warning
                    showCancel
                    title="Are you sure?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    confirmBtnText="Delete"
                    cancelBtnText="Cancel"
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                >
                    Are you sure you want to delete update #{deleteAlert.id}? This action cannot be undone.
                </SweetAlert>
            )}
        </>
    );
};

export default ViewUpadateTeacher;