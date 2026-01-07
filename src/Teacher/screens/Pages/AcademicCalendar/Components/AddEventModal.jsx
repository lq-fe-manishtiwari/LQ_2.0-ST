import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';

const AddEventModal = ({ showModal, selectedDate, editEvent, onClose, onSave, onDelete }) => {
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
            <h3 className="text-xl font-bold">{editEvent ? 'Edit Event' : 'Add Event'}</h3>
            <button 
              onClick={handleCancel}
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
              <input
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event description"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-2">
            <button 
              onClick={handleCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            {editEvent && (
              <button 
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
            <button 
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              {editEvent ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Alert */}
      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          You won't be able to recover this event!
        </SweetAlert>
      )}
      
      {/* Success Alert */}
      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setShowSuccessAlert(false);
            onClose();
          }}
        >
          {alertMessage}
        </SweetAlert>
      )}
      
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