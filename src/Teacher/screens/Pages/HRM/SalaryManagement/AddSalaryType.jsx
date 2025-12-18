import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddSalaryType() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        daysAllowed: '',
        user: 'Student',
        isActive: true, // Default to Yes
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'radio') {
            setFormData({ ...formData, [name]: value === 'true' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Add logic to save data
        navigate('/hrm/salary/salary-type');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Add Salary Type</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">Type*</label>
                    <input
                        type="text"
                        name="type"
                        placeholder="Enter Type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-sm text-gray-700 transition-colors"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">Description*</label>
                    <textarea
                        name="description"
                        placeholder="Enter description here"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none resize-none transition-colors"
                        required
                    />
                </div>

                {/* Number of days allowed */}
                <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">Number of days allowed*</label>
                    <input
                        type="number"
                        name="daysAllowed"
                        placeholder="Enter Number of days"
                        value={formData.daysAllowed}
                        onChange={handleChange}
                        className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-sm text-gray-700 transition-colors"
                        required
                    />
                </div>

                {/* User */}
                <div>
                    <label className="block text-sm font-semibold text-blue-600 mb-2">User*</label>
                    <div className="relative">
                        <select
                            name="user"
                            value={formData.user}
                            onChange={handleChange}
                            className="w-full border-b border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-sm text-gray-700 appearance-none bg-white cursor-pointer transition-colors"
                            required
                        >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Other Staff">Other Staff</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-6 mt-4">
                    <label className="text-sm font-bold text-blue-600">Is Active*</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="isActive"
                                value="true"
                                checked={formData.isActive === true}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="isActive"
                                value="false"
                                checked={formData.isActive === false}
                                onChange={handleChange}
                                className="w-4 h-4 text-gray-400 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">No</span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/hrm/salary/salary-type')}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}
