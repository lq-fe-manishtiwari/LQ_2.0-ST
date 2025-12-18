import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AllocateSalaryModal({ leave, onClose }) {
    const [selectedTeacher, setSelectedTeacher] = useState('');

    if (!leave) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Allocating salary type:', leave.type, 'to teacher:', selectedTeacher);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-slideUp">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 p-5">
                    <h2 className="text-xl font-semibold text-gray-800">Allocate Salary Component</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} id="allocate-form" className="space-y-5">

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type*</label>
                            <input
                                type="text"
                                value={leave.type}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                value={leave.description}
                                readOnly
                                rows="3"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Number of days allowed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of days allowed</label>
                            <input
                                type="number"
                                value={leave.daysAllowed}
                                readOnly
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none"
                            />
                        </div>

                        {/* Select Teacher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Teacher*</label>
                            <div className="relative">
                                <select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="Teacher 1">Teacher 1</option>
                                    <option value="Teacher 2">Teacher 2</option>
                                    <option value="Teacher 3">Teacher 3</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 p-5 space-x-3 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="allocate-form"
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all"
                    >
                        Allocate
                    </button>
                </div>

            </div>
        </div>
    );
}
