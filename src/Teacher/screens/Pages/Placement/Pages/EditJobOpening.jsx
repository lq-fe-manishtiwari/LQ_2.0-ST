import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';

export default function EditJobOpening() {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        organization: '',
        openingDate: '',
        jobRole: '',
        department: '',
        class: '',
        division: '',
        selectionCriteria: '',
        ctc: '',
        positionOpenTill: '',
        applicationDeadline: '',
        expectedJoiningDate: '',
        registrationLink: '',
        jobDescription: '',
        minCGPA: '',
        maxBacklogs: '',
        skillsRequired: '',
        bondPeriod: '',
        location: ''
    });

    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({});

    useEffect(() => {
        loadJobOpening();
    }, [id]);

    const loadJobOpening = async () => {
        try {
            // API call to fetch job opening by id
            // Mock data for now
            const mockData = {
                organization: 'LQ',
                openingDate: '2025-12-15',
                jobRole: 'frontend',
                department: 'BCOM',
                class: 'Grade A',
                division: 'A',
                selectionCriteria: 'A',
                ctc: '12 LPA',
                positionOpenTill: '2025-12-15',
                applicationDeadline: '2025-12-10',
                expectedJoiningDate: '2025-12-24',
                registrationLink: 'https://example.com',
                jobDescription: 'JD',
                minCGPA: '6.0',
                maxBacklogs: '2',
                skillsRequired: 'React, JavaScript',
                bondPeriod: '2 years',
                location: 'Bangalore'
            };
            setFormData(mockData);
            setLoading(false);
        } catch (error) {
            console.error("Error loading job opening:", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.organization || !formData.openingDate || !formData.jobRole || !formData.ctc) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            // API call to update
            console.log("Updating job opening:", formData);

            setAlertConfig({
                success: true,
                title: 'Job Opening Updated Successfully!',
                confirmBtnCssClass: 'btn-confirm',
                onConfirm: () => {
                    setShowAlert(false);
                    window.history.go(-1);
                }
            });
            setShowAlert(true);
        } catch (error) {
            console.error("Error updating job opening:", error);
            alert("Error updating job opening. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Edit Job Opening</h2>
                <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                    onClick={() => window.history.back()}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Organization <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Enter organization name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Job Opening Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="openingDate"
                            value={formData.openingDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Job Role <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="jobRole"
                            value={formData.jobRole}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Enter Job Role"
                            required
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select</option>
                            <option value="BCOM">BCOM</option>
                            <option value="BCA">BCA</option>
                            <option value="BSC">BSC</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="class"
                            value={formData.class}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select</option>
                            <option value="Grade A">Grade A</option>
                            <option value="Grade B">Grade B</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Division <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="division"
                            value={formData.division}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Selection Criteria <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="selectionCriteria"
                            value={formData.selectionCriteria}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Criteria"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            CTC (LPA) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="ctc"
                            value={formData.ctc}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Enter Your CTC"
                            required
                        />
                    </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Position Open Till <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="positionOpenTill"
                            value={formData.positionOpenTill}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Application Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="applicationDeadline"
                            value={formData.applicationDeadline}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Expected Joining Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="expectedJoiningDate"
                            value={formData.expectedJoiningDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Row 5 - Eligibility Criteria */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Eligibility Criteria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block font-medium mb-1 text-gray-700">
                                Minimum CGPA <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="minCGPA"
                                value={formData.minCGPA}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., 6.0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-gray-700">
                                Maximum Backlogs Allowed <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="maxBacklogs"
                                value={formData.maxBacklogs}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., 2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1 text-gray-700">
                                Skills Required
                            </label>
                            <input
                                type="text"
                                name="skillsRequired"
                                value={formData.skillsRequired}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Java, Python, React"
                            />
                        </div>
                    </div>
                </div>

                {/* Row 6 - Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Bangalore, Pune"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Bond Period (if any)
                        </label>
                        <input
                            type="text"
                            name="bondPeriod"
                            value={formData.bondPeriod}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="e.g., 2 years"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-gray-700">
                            Registration Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            name="registrationLink"
                            value={formData.registrationLink}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="Registration Link"
                            required
                        />
                    </div>
                </div>

                {/* Job Description */}
                <div>
                    <label className="block font-medium mb-1 text-gray-700">
                        Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        rows="6"
                        placeholder="Enter job description..."
                        required
                    ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Update
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* SweetAlert */}
            {showAlert && (
                <SweetAlert
                    {...alertConfig}
                    onConfirm={alertConfig.onConfirm}
                />
            )}
        </div>
    );
}
