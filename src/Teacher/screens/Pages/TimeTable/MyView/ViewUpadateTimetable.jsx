import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, BookOpen, FilePlus, X, Loader, FileText, ExternalLink, Link as LinkIcon, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ViewUpadateTeacher from './ViewUpadateTeacher';
import SweetAlert from 'react-bootstrap-sweetalert';
import { timetableService } from '../Services/timetable.service';

const ViewUpadateTimetable = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const slotData = location.state?.slot || {};
    const template_slot_id = location.state?.template_slot_id;
    const exception_id = location.state?.exception_id;
    const is_exception = location.state?.is_exception;
    
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [classUpdates, setClassUpdates] = useState([]);
    
    // State for SweetAlert
    const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Determine which ID to use based on is_exception
    const getSlotIdentifier = () => {
        if (is_exception === true && exception_id) {
            return {
                type: 'exception',
                id: exception_id,
                label: 'Exception'
            };
        } 

        else if (slotData.is_exception === true && slotData.exception_id) {
            return {
                type: 'exception',
                id: slotData.exception_id,
                label: 'Exception'
            };
        }
        else if (template_slot_id) {
            return {
                type: 'template',
                id: template_slot_id,
                label: 'Template Slot'
            };
        }
        else if (slotData.template_slot_id) {
            return {
                type: 'template',
                id: slotData.template_slot_id,
                label: 'Template Slot'
            };
        }
        else {

            console.error('No valid slot identifier found');
            return {
                type: 'unknown',
                id: null,
                label: 'Unknown'
            };
        }
    };

    const slotIdentifier = getSlotIdentifier();

    // Debug logging
    useEffect(() => {
        console.log('Received slot data:', {
            slotData,
            template_slot_id,
            exception_id,
            is_exception,
            slotIdentifier
        });
    }, [slotData, template_slot_id, exception_id, is_exception]);

    // Fetch class updates on component mount
    useEffect(() => {
        if (slotIdentifier.id) {
            fetchClassUpdates();
        }
    }, [slotIdentifier.id]);

    const fetchClassUpdates = async () => {
        if (!slotIdentifier.id || slotIdentifier.type === 'unknown') {
            console.warn('Cannot fetch updates without valid slot identifier');
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (slotIdentifier.type === 'exception') {
                response = await timetableService.getClassUpdates(
                    slotIdentifier.id, // exceptionId
                    null // templateSlotId
                );
            } else {
                response = await timetableService.getClassUpdates(
                    null, // exceptionId
                    slotIdentifier.id // templateSlotId
                );
            }
            
            if (response && Array.isArray(response)) {
                setClassUpdates(response);
            } else {
                setClassUpdates([]);
            }
        } catch (error) {
            console.error('Error fetching class updates:', error);
            setClassUpdates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPopup = () => {
        // Validate before opening popup
        if (!slotIdentifier.id || slotIdentifier.type === 'unknown') {
            setAlertMessage('Cannot add update: Invalid slot identifier');
            setShowStatusSuccessAlert(true);
            return;
        }
        setShowPopup(true);
    };

    const handlePopupSubmit = async (formData) => {
        try {
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    
            const activeCollegeStr = localStorage.getItem('activeCollege');
            const activeCollege = activeCollegeStr ? JSON.parse(activeCollegeStr) : null;
    
            if (!currentUser || !activeCollege) {
                throw new Error('User information not found');
            }

            // Validate slot identifier
            if (!slotIdentifier.id || slotIdentifier.type === 'unknown') {
                throw new Error('Invalid slot identifier');
            }
    
            const payload = {
                notes: formData.academic_diary,
                user_id: currentUser.jti || currentUser.id,
                college_id: activeCollege.id
            };
    
            // Add the correct identifier based on slot type
            if (slotIdentifier.type === 'exception') {
                payload.exception_id = slotIdentifier.id;
            } else {
                payload.template_slot_id = slotIdentifier.id;
            }
    
            if (formData.meeting_link && formData.meeting_link.trim() !== '') {
                payload.link = formData.meeting_link.trim();
            }
    
            // ✅ FIXED: Check if related_document_url exists and is a string
            if (formData.related_document_url && typeof formData.related_document_url === 'string' && formData.related_document_url.trim() !== '') {
                payload.documents = [
                    {
                        name: formData.fileName || 'Related Document',
                        path: formData.related_document_url.trim()
                    }
                ];
            }
    
            if (formData.note) {
                payload.note = formData.note;
            }

            if (formData.teaching_unit) {
                payload.teaching_unit = formData.teaching_unit;
            }

            if (formData.book_used) {
                payload.book_used = formData.book_used;
            }
    
            console.log('Creating class update with payload:', payload);
    
            const response = await timetableService.createClassUpdate(payload);
    
            setAlertMessage('Update submitted successfully!');
            setShowStatusSuccessAlert(true);
            fetchClassUpdates();
            setShowPopup(false);
    
        } catch (error) {
            console.error('Error creating class update:', error);
            setAlertMessage(error.message || 'Failed to submit update');
            setShowStatusSuccessAlert(true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-bold transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {slotData.program_name || 'Program'} - {slotData.semester_name || 'Semester'} - {slotData.division_name || 'Division'}
                        </h1>
                        {/* <p className="text-sm text-gray-600">
                            {slotData.academic_year_name || 'Academic Year'} • 
                            {slotIdentifier.type === 'exception' ? ' Exception' : ' Template Slot'}: {slotIdentifier.id}
                        </p> */}
                    </div>
                </div>

                <div>
                    <button 
                        onClick={handleOpenPopup}
                        className="flex items-center gap-2 bg-[#bbf7d0] hover:bg-green-300 text-black px-6 py-2 rounded-full font-bold transition-colors shadow-sm"
                        disabled={loading || !slotIdentifier.id || slotIdentifier.type === 'unknown'}
                    >
                        <FilePlus size={20} strokeWidth={2.5} />
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Add Update'}
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="text-blue-600" size={24} />
                        <span className="font-bold">Date :</span>
                        <span className="text-gray-600">{formatDate(slotData.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="text-blue-600" size={24} />
                        <span className="font-bold">Time :</span>
                        <span className="text-gray-600">
                            {formatTime(slotData.start_time)} to {formatTime(slotData.end_time)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <User className="text-blue-600" size={24} />
                        <span className="font-bold">Teacher :</span>
                        <span className="text-gray-600">{slotData.teacher_name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="text-blue-600" size={24} />
                        <span className="font-bold">Paper :</span>
                        <span className="text-gray-600">{slotData.subject_name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="text-blue-600" size={24} />
                        <span className="font-bold">Room :</span>
                        <span className="text-gray-600">{slotData.room_number || slotData.classroom_name || '-'}</span>
                    </div>
                </div>
                
            </div>

            {/* Previous Record Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Previous Updates</h2>
                {/* <span className="text-sm text-gray-500">
                    {slotIdentifier.type === 'exception' ? 'Exception' : 'Template Slot'}: {slotIdentifier.id}
                </span> */}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <span className="ml-3 text-gray-600">Loading updates...</span>
                </div>
            )}

            {/* Error when no valid identifier */}
            {!slotIdentifier.id || slotIdentifier.type === 'unknown' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">
                        Cannot load updates: No valid slot identifier found
                    </p>
                    <p className="text-sm text-red-500 mt-2">
                        Please go back and try again
                    </p>
                </div>
            ) : (
                /* Teacher Table Content */
                !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <ViewUpadateTeacher 
                            slotId={slotIdentifier.id}
                            slotType={slotIdentifier.type}
                            initialData={classUpdates}
                            onRefresh={fetchClassUpdates}
                        />
                    </div>
                )
            )}

            {/* Add Update Popup */}
            {showPopup && (
                <AddUpdatePopup
                    slotData={slotData}
                    slotIdentifier={slotIdentifier}
                    onClose={() => setShowPopup(false)}
                    onSubmit={handlePopupSubmit}
                />
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
        </div>
    );
};

// Separate Popup Component (same as before, just ensure it uses slotIdentifier)
const AddUpdatePopup = ({ slotData, slotIdentifier, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        academic_diary: '',
        meeting_link: '',
        related_document_url: '',
        note: '',
        fileName: '',
        teaching_unit: [''], // Initialize with one empty field
        book_used: ['']      // Initialize with one empty field
    });
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadError, setUploadError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (uploadError) setUploadError('');
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Clear previous errors
        setUploadError('');

        // Check file size (10MB limit)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        // Check file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        
        if (!allowedTypes.includes(selectedFile.type)) {
            setUploadError('Please upload PDF, DOC, DOCX, JPG, or PNG files only');
            return;
        }

        // Set file info immediately
        setFile(selectedFile);
        setUploading(true);
        setUploadError('');

        try {
            console.log('Starting immediate upload for:', selectedFile.name);
            
            // Immediately upload file to S3
            const fileUrl = await timetableService.uploadFileToS3(selectedFile);
            
            console.log('File uploaded successfully, URL:', fileUrl);
            
            // Save the URL and filename in form data
            setFormData(prev => ({ 
                ...prev, 
                related_document_url: fileUrl,
                fileName: selectedFile.name
            }));
            
            setUploading(false);
            
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError(error.message || 'Failed to upload file. Please try again.');
            setFile(null);
            setUploading(false);
        }
    };

    // Helper functions for dynamic fields
    const handleDynamicFieldChange = (field, index, value) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    };

    const addDynamicField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeDynamicField = (field, index) => {
        setFormData(prev => {
            const newArray = [...prev[field]];
            if (newArray.length > 1) {
                newArray.splice(index, 1);
                return { ...prev, [field]: newArray };
            }
            return prev;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.academic_diary) {
            setUploadError('Academic diary message is required');
            return;
        }

        // Check if file is selected but not uploaded yet
        if (file && !formData.related_document_url) {
            setUploadError('File is still uploading. Please wait...');
            return;
        }

        // Prepare final form data
        const finalFormData = {
            academic_diary: formData.academic_diary,
            meeting_link: formData.meeting_link,
            related_document_url: formData.related_document_url,
            note: formData.note,
            fileName: formData.fileName,
            // Filter out empty strings
            teaching_unit: formData.teaching_unit.filter(item => item.trim() !== ''),
            book_used: formData.book_used.filter(item => item.trim() !== '')
        };

        await onSubmit(finalFormData);
    };

    const removeFile = () => {
        setFile(null);
        setFormData(prev => ({ 
            ...prev, 
            related_document_url: '',
            fileName: ''
        }));
        setUploadError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Popup Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Add New Update</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={uploading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Popup Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Teaching Unit
                            </label>
                            <div className="space-y-2">
                                {formData.teaching_unit.map((unit, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => handleDynamicFieldChange('teaching_unit', index, e.target.value)}
                                            placeholder={`Teaching Unit ${index + 1}`}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={uploading}
                                        />
                                        {formData.teaching_unit.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDynamicField('teaching_unit', index)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addDynamicField('teaching_unit')}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                                >
                                    + Add More Units
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Teaching Aids/Books Used
                            </label>
                            <div className="space-y-2">
                                {formData.book_used.map((book, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={book}
                                            onChange={(e) => handleDynamicFieldChange('book_used', index, e.target.value)}
                                            placeholder={`Book/Aid ${index + 1}`}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={uploading}
                                        />
                                        {formData.book_used.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDynamicField('book_used', index)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addDynamicField('book_used')}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                                >
                                    + Add More Books
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Synopsis *
                            </label>
                            <textarea 
                                name="academic_diary"
                                value={formData.academic_diary}
                                onChange={handleInputChange}
                                placeholder="Enter detailed notes about this class session..."
                                className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={uploading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <LinkIcon size={16} />
                                    Meeting Link
                                </span>
                            </label>
                            <input
                                type="text"
                                name="meeting_link"
                                value={formData.meeting_link}
                                onChange={handleInputChange}
                                placeholder="https://meet.google.com/xxx-yyyy-zzz or other meeting links"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={uploading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <FileText size={16} />
                                    Upload Document
                                </span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
    {formData.related_document_url ? (
        <div className="mb-4">
            <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">
                                {formData.fileName || 'Document'}
                            </p>

                            <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
                                <a
                                    href={formData.related_document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 break-all underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {formData.related_document_url}
                                </a>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500 ml-2"
                        disabled={uploading}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    ) : uploading && file ? (
        <div className="mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <div>
                        <p className="text-blue-600 font-medium text-sm">
                            Uploading document...
                        </p>
                        <p className="text-xs text-gray-500">
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Please wait
                        </p>
                    </div>
                </div>
            </div>
        </div>
    ) : null}

    {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
                {uploadError}
            </p>
        </div>
    )}

    <label className={`cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
        <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled={uploading}
        />
        <div
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
        >
            {uploading ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader className="animate-spin" size={16} />
                    Uploading...
                </div>
            ) : 'Select Document'}
        </div>
    </label>

    <p className="text-xs text-gray-400 mt-3">
        Supported formats: PDF, DOC, JPG, PNG
    </p>
</div>

                        </div>
                    </div>

                    {/* Popup Footer */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-400 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.academic_diary || uploading}
                            className={`px-6 py-3 rounded-full font-medium transition-colors ${
                                !formData.academic_diary || uploading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                            {uploading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="animate-spin" size={16} />
                                    Uploading...
                                </div>
                            ) : 'Submit Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ViewUpadateTimetable;