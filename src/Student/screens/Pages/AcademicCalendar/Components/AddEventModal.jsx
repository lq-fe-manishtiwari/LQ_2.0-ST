import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';

const AddEventModal = ({ showModal, selectedDate, editEvent, onClose }) => {
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    event_date: ''
  });

  // SweetAlert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editEvent) {
      setFormData({
        event_name: editEvent.text || '',
        description: editEvent.description || '',
        event_date: editEvent.startDate || ''
      });
    } else {
      // Set default date when creating new event
      const defaultDate = selectedDate ? 
        `${selectedDate.year}-${String(new Date(Date.parse(selectedDate.month + ' 1, 2000')).getMonth() + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}` : 
        '';
      setFormData({ 
        event_name: '', 
        description: '',
        event_date: defaultDate
      });
    }
  }, [editEvent, selectedDate]);

  if (!showModal) return null;

  const handleSave = () => {
    if (formData.event_name && formData.description && formData.event_date) {
      onSave(formData);
      setFormData({ event_name: '', description: '', event_date: '' });
    } else {
      setErrorMessage('Please fill in all required fields (Event Name, Description, and Event Date).');
      setShowErrorAlert(true);
    }
  };

  const handleCancel = () => {
    setFormData({ event_name: '', description: '', event_date: '' });
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = () => {
    if (editEvent && onDelete) {
      onDelete(editEvent.id);
      setShowDeleteAlert(false);
      // Don't show success alert here - let parent component handle it
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteAlert(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">View Event</h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-lg text-white">×</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {selectedDate?.month} {selectedDate?.day}, {selectedDate?.year}
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {formData.event_name || 'No event name'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {formData.event_date || 'No date specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[100px]">
                {formData.description || 'No description available'}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {showErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setShowErrorAlert(false)}
        >
          {errorMessage}
        </SweetAlert>
      )}
    </div>
  );
};

export default AddEventModal;