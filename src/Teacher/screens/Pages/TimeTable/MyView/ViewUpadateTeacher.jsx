import React, { useState } from 'react';
import { Eye, Edit, Trash2, X, FileText } from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';

const ViewUpadateTeacher = () => {
    // State for edit popup
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    
    // State for SweetAlert
    const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState(false);
    const [deleteAlert, setDeleteAlert] = useState({ id: null, name: '' });
    
    // Dummy data items (replace with your actual data)
    const [items, setItems] = useState([
        {
            id: 1,
            name: "Example Item 1",
            template_id: 123,
            academic_diary: "message related to the respective class added by teacher",
            document: "Example_file.pdf",
            teacher: "Tejas Chaudhari",
            date: "12-Sep-2025"
        },
        {
            id: 2,
            name: "Example Item 2",
            template_id: 124,
            academic_diary: "another message from teacher about the class",
            document: "Document2.pdf",
            teacher: "Another Teacher",
            date: "13-Sep-2025"
        }
    ]);

    // Handler functions
    const handleViewClick = (item) => {
        console.log('View clicked:', item);
        setCurrentItem({...item, isViewOnly: true});
        setShowEditPopup(true);
    };

    const handleEditClick = (item) => {
        console.log('Edit clicked:', item);
        setCurrentItem({...item});
        setShowEditPopup(true);
    };

    const handleDeleteClick = (id, itemName) => {
        console.log('Delete clicked for:', id);
        setDeleteAlert({ id, name: itemName });
        setShowDeleteConfirmAlert(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting edit for item:', currentItem);
        
        // Validate form
        if (!currentItem.teacher || !currentItem.academic_diary) {
            setAlertMessage('Please fill all required fields');
            setShowStatusSuccessAlert(true);
            return;
        }
        
        // Update the item in the state
        const updatedItems = items.map(item => 
            item.template_id === currentItem.template_id ? currentItem : item
        );
        setItems(updatedItems);
        
        // Show success alert
        setAlertMessage('Item updated successfully!');
        setShowStatusSuccessAlert(true);
        
        setShowEditPopup(false);
        setCurrentItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    const handleConfirmDelete = () => {
        if (deleteAlert.id) {
            // Remove item from state
            const updatedItems = items.filter(item => item.template_id !== deleteAlert.id);
            setItems(updatedItems);
            
            // Show success alert
            setAlertMessage(`Item "${deleteAlert.name}" deleted successfully!`);
            setShowStatusSuccessAlert(true);
            
            // Reset delete state
            setDeleteAlert({ id: null, name: '' });
            setShowDeleteConfirmAlert(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteAlert({ id: null, name: '' });
        setShowDeleteConfirmAlert(false);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="table-header text-white">
                            <tr style={{ backgroundColor: "#2162C1" }}>
                                <th
                                    className="table-th text-center text-white"
                                    style={{ backgroundColor: "#2162C1" }}
                                >
                                   Academic Diary
                                </th>
                                <th
                                    className="table-th text-center text-white"
                                    style={{ backgroundColor: "#2162C1" }}
                                >
                                    Related Documents
                                </th>
                                <th
                                    className="table-th text-center text-white"
                                    style={{ backgroundColor: "#2162C1" }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-gray-700 font-medium">
                                            {item.academic_diary}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText size={16} className="text-blue-600" />
                                            <a
                                                href="#"
                                                className="text-blue-600 underline hover:text-blue-800 font-medium"
                                            >
                                                {item.document}
                                            </a>
                                        </div>
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
                                                onClick={() => handleDeleteClick(item.template_id, item.name)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/View Popup */}
            {showEditPopup && currentItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {currentItem.isViewOnly ? 'View Teacher Update' : 'Edit Teacher Update'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowEditPopup(false);
                                    setCurrentItem(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Popup Form */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    {currentItem.isViewOnly ? 'View Update Details' : 'Edit Update for Teacher'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                        <select 
                                            name="teacher"
                                            value={currentItem.teacher || ''}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            disabled={currentItem.isViewOnly}
                                        >
                                            <option value="">Select teacher</option>
                                            <option value="Tejas Chaudhari">Tejas Chaudhari</option>
                                            <option value="Another Teacher">Another Teacher</option>
                                            <option value="Teacher 3">Teacher 3</option>
                                            <option value="Teacher 4">Teacher 4</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Academic Diary Message
                                        </label>
                                        <textarea 
                                            name="academic_diary"
                                            value={currentItem.academic_diary || ''}
                                            onChange={handleInputChange}
                                            placeholder="Edit your note here" 
                                            className="w-full p-2 border border-gray-300 rounded-lg h-32"
                                            disabled={currentItem.isViewOnly}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Related Document
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <div className="mb-3">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <FileText size={20} className="text-blue-600" />
                                                    <span className="text-blue-600 underline font-medium">
                                                        {currentItem.document}
                                                    </span>
                                                </div>
                                            </div>
                                            {!currentItem.isViewOnly && (
                                                <button 
                                                    type="button"
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                                >
                                                    Upload New Document
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Popup Footer */}
                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditPopup(false);
                                        setCurrentItem(null);
                                    }}
                                    className="px-6 py-2 border border-gray-400 text-gray-700 rounded-full font-medium hover:bg-gray-50"
                                >
                                    {currentItem.isViewOnly ? 'Close' : 'Cancel'}
                                </button>
                                {!currentItem.isViewOnly && (
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SweetAlert for Success Messages (Update/Delete Success) */}
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
                    confirmBtnText="OK"
                    cancelBtnText="Cancel"
                    confirmBtnCssClass="btn-confirm"
                    cancelBtnCssClass="btn-cancel"
                >
                    Are you want to delete {deleteAlert.name}?
                </SweetAlert>
            )}
        </>
    );
};

export default ViewUpadateTeacher;