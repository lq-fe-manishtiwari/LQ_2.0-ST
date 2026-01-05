import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, BookOpen, FilePlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewUpadateTeacher from './ViewUpadateTeacher';
import SweetAlert from 'react-bootstrap-sweetalert';

const ViewUpadateTimetable = () => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    
    // State for SweetAlert
    const [showStatusSuccessAlert, setShowStatusSuccessAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleOpenPopup = () => {
        setShowPopup(true);
    };

    const handlePopupSubmit = () => {
        // Show success alert
        setAlertMessage('Teacher update submitted successfully!');
        setShowStatusSuccessAlert(true);
        
        setShowPopup(false);
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
                    <h1 className="text-xl font-bold text-gray-800">
                        Engineering - First Year - A - Engineering 2025-2026
                    </h1>
                </div>

                <div>
                    <button 
                        onClick={handleOpenPopup}
                        className="flex items-center gap-2 bg-[#bbf7d0] hover:bg-green-300 text-black px-6 py-2 rounded-full font-bold transition-colors shadow-sm"
                    >
                        <FilePlus size={20} strokeWidth={2.5} />
                        Add Update
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="text-blue-600" size={24} />
                        <span className="font-bold">Date :</span>
                        <span className="text-gray-600">12-Sepetember-2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="text-blue-600" size={24} />
                        <span className="font-bold">Time :</span>
                        <span className="text-gray-600">07.30 AM to 08.30 AM</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <User className="text-blue-600" size={24} />
                        <span className="font-bold">Teacher :</span>
                        <span className="text-gray-600">Tejas Chaudhari</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="text-blue-600" size={24} />
                        <span className="font-bold">Paper :</span>
                        <span className="text-gray-600">Machine Learning</span>
                    </div>
                </div>
            </div>

            {/* Previous Record Section */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Previous Record</h2>
            </div>

            {/* Teacher Table Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <ViewUpadateTeacher />
            </div>

            {/* Add Update Popup - Only Teacher UI */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Add New Update</h2>
                            <button 
                                onClick={() => setShowPopup(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Popup Content */}
                        <div className="p-6 space-y-6">
                            {/* Teacher Form Directly */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Add Update for Teacher
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                        <select className="w-full p-2 border border-gray-300 rounded-lg">
                                            <option>select teacher</option>
                                            <option>Tejas Chaudhari</option>
                                            {/* Add more teacher options as needed */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enter Note</label>
                                        <textarea 
                                            placeholder="add your note here" 
                                            className="w-full p-2 border border-gray-300 rounded-lg h-32"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Document</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                                                upload related document
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Popup Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="px-6 py-2 border border-gray-400 text-gray-700 rounded-full font-medium hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePopupSubmit}
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium"
                            >
                                Submit Update
                            </button>
                        </div>
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
        </div>
    );
};

export default ViewUpadateTimetable;