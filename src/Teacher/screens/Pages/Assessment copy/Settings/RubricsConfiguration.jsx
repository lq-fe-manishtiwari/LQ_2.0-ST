import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Save, Target, Award, TrendingUp, BookOpen, CheckCircle } from "lucide-react";

// Bloom's Taxonomy Levels
const BLOOMS_TAXONOMY = [
    { value: "Remember", label: "Remember (Knowledge)", level: 1, color: "bg-gray-100 text-gray-800" },
    { value: "Understand", label: "Understand (Comprehension)", level: 2, color: "bg-blue-100 text-blue-800" },
    { value: "Apply", label: "Apply (Application)", level: 3, color: "bg-green-100 text-green-800" },
    { value: "Analyze", label: "Analyze (Analysis)", level: 4, color: "bg-yellow-100 text-yellow-800" },
    { value: "Evaluate", label: "Evaluate (Evaluation)", level: 5, color: "bg-orange-100 text-orange-800" },
    { value: "Create", label: "Create (Synthesis)", level: 6, color: "bg-purple-100 text-purple-800" },
];

// Dummy data for rubrics - Education System Standard
const INITIAL_RUBRICS = [
    {
        id: 1,
        code: "RUB-CO1-BT2",
        name: "Conceptual Understanding & Recall",
        description: "Evaluates student's ability to understand and recall fundamental concepts, theories, and principles",
        courseOutcome: "CO1",
        bloomsLevel: "Understand",
        totalMarks: 20,
        weightage: 20,
        criteria: [
            {
                level: "Outstanding",
                minMarks: 18,
                maxMarks: 20,
                description: "Demonstrates exceptional understanding of all concepts with detailed explanations"
            },
            {
                level: "Excellent",
                minMarks: 16,
                maxMarks: 17,
                description: "Shows comprehensive understanding with clear explanations"
            },
            {
                level: "Very Good",
                minMarks: 14,
                maxMarks: 15,
                description: "Good understanding with mostly accurate explanations"
            },
            {
                level: "Good",
                minMarks: 12,
                maxMarks: 13,
                description: "Adequate understanding with some gaps in explanation"
            },
            {
                level: "Average",
                minMarks: 10,
                maxMarks: 11,
                description: "Basic understanding with limited explanations"
            },
            {
                level: "Below Average",
                minMarks: 8,
                maxMarks: 9,
                description: "Minimal understanding with significant gaps"
            },
            {
                level: "Poor",
                minMarks: 0,
                maxMarks: 7,
                description: "Little to no understanding demonstrated"
            },
        ],
        active: true,
    },
    {
        id: 2,
        code: "RUB-CO2-BT3",
        name: "Application & Problem Solving",
        description: "Assesses ability to apply learned concepts to solve real-world problems and practical scenarios",
        courseOutcome: "CO2",
        bloomsLevel: "Apply",
        totalMarks: 30,
        weightage: 30,
        criteria: [
            {
                level: "Outstanding",
                minMarks: 27,
                maxMarks: 30,
                description: "Applies concepts flawlessly to solve complex problems with innovative approaches"
            },
            {
                level: "Excellent",
                minMarks: 24,
                maxMarks: 26,
                description: "Effectively applies concepts to solve problems with minor errors"
            },
            {
                level: "Very Good",
                minMarks: 21,
                maxMarks: 23,
                description: "Applies concepts correctly to solve most problems"
            },
            {
                level: "Good",
                minMarks: 18,
                maxMarks: 20,
                description: "Applies concepts with some guidance to solve problems"
            },
            {
                level: "Average",
                minMarks: 15,
                maxMarks: 17,
                description: "Basic application with frequent errors"
            },
            {
                level: "Below Average",
                minMarks: 12,
                maxMarks: 14,
                description: "Struggles to apply concepts correctly"
            },
            {
                level: "Poor",
                minMarks: 0,
                maxMarks: 11,
                description: "Unable to apply concepts to solve problems"
            },
        ],
        active: true,
    },
    {
        id: 3,
        code: "RUB-CO3-BT4",
        name: "Analysis & Critical Thinking",
        description: "Evaluates analytical skills, critical thinking, and ability to break down complex problems",
        courseOutcome: "CO3",
        bloomsLevel: "Analyze",
        totalMarks: 25,
        weightage: 25,
        criteria: [
            {
                level: "Outstanding",
                minMarks: 23,
                maxMarks: 25,
                description: "Exceptional analytical skills with deep insights and comprehensive breakdown"
            },
            {
                level: "Excellent",
                minMarks: 20,
                maxMarks: 22,
                description: "Strong analytical skills with clear logical reasoning"
            },
            {
                level: "Very Good",
                minMarks: 18,
                maxMarks: 19,
                description: "Good analytical approach with mostly correct interpretations"
            },
            {
                level: "Good",
                minMarks: 15,
                maxMarks: 17,
                description: "Adequate analysis with some logical gaps"
            },
            {
                level: "Average",
                minMarks: 13,
                maxMarks: 14,
                description: "Basic analysis with limited depth"
            },
            {
                level: "Below Average",
                minMarks: 10,
                maxMarks: 12,
                description: "Weak analytical skills with superficial understanding"
            },
            {
                level: "Poor",
                minMarks: 0,
                maxMarks: 9,
                description: "Unable to analyze or break down problems"
            },
        ],
        active: true,
    },
    {
        id: 4,
        code: "RUB-CO4-BT5",
        name: "Evaluation & Judgment",
        description: "Measures ability to evaluate solutions, make judgments, and justify decisions with evidence",
        courseOutcome: "CO4",
        bloomsLevel: "Evaluate",
        totalMarks: 15,
        weightage: 15,
        criteria: [
            {
                level: "Outstanding",
                minMarks: 14,
                maxMarks: 15,
                description: "Excellent evaluation with well-justified decisions and strong evidence"
            },
            {
                level: "Excellent",
                minMarks: 12,
                maxMarks: 13,
                description: "Good evaluation with clear justification"
            },
            {
                level: "Very Good",
                minMarks: 11,
                maxMarks: 11,
                description: "Adequate evaluation with reasonable justification"
            },
            {
                level: "Good",
                minMarks: 9,
                maxMarks: 10,
                description: "Basic evaluation with some justification"
            },
            {
                level: "Average",
                minMarks: 8,
                maxMarks: 8,
                description: "Limited evaluation with weak justification"
            },
            {
                level: "Below Average",
                minMarks: 6,
                maxMarks: 7,
                description: "Poor evaluation with little justification"
            },
            {
                level: "Poor",
                minMarks: 0,
                maxMarks: 5,
                description: "Unable to evaluate or justify decisions"
            },
        ],
        active: true,
    },
    {
        id: 5,
        code: "RUB-CO5-BT6",
        name: "Design & Innovation",
        description: "Assesses creativity, innovation, and ability to design new solutions or create original work",
        courseOutcome: "CO5",
        bloomsLevel: "Create",
        totalMarks: 10,
        weightage: 10,
        criteria: [
            {
                level: "Outstanding",
                minMarks: 9,
                maxMarks: 10,
                description: "Highly innovative and creative design with original ideas"
            },
            {
                level: "Excellent",
                minMarks: 8,
                maxMarks: 8,
                description: "Creative design with good innovation"
            },
            {
                level: "Very Good",
                minMarks: 7,
                maxMarks: 7,
                description: "Good design with some creative elements"
            },
            {
                level: "Good",
                minMarks: 6,
                maxMarks: 6,
                description: "Adequate design with basic creativity"
            },
            {
                level: "Average",
                minMarks: 5,
                maxMarks: 5,
                description: "Basic design with limited creativity"
            },
            {
                level: "Below Average",
                minMarks: 4,
                maxMarks: 4,
                description: "Poor design with minimal creativity"
            },
            {
                level: "Poor",
                minMarks: 0,
                maxMarks: 3,
                description: "No creativity or original design demonstrated"
            },
        ],
        active: true,
    },
];

export default function RubricsConfiguration() {
    const [rubrics, setRubrics] = useState(INITIAL_RUBRICS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRubric, setSelectedRubric] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        courseOutcome: "",
        bloomsLevel: "",
        totalMarks: 100,
        weightage: 0,
        criteria: [
            { level: "", minMarks: 0, maxMarks: 0, description: "" },
        ],
        active: true,
    });

    // Stats calculation
    const totalRubrics = rubrics.length;
    const totalWeightage = rubrics.reduce((sum, r) => sum + r.weightage, 0);
    const avgMarks = (rubrics.reduce((sum, r) => sum + r.totalMarks, 0) / rubrics.length).toFixed(1);
    const activeRubrics = rubrics.filter(r => r.active).length;

    // Get Bloom's color
    const getBloomsColor = (level) => {
        const bloom = BLOOMS_TAXONOMY.find(b => b.value === level);
        return bloom ? bloom.color : "bg-gray-100 text-gray-800";
    };

    const handleAdd = () => {
        setFormData({
            code: "",
            name: "",
            description: "",
            courseOutcome: "",
            bloomsLevel: "",
            totalMarks: 100,
            weightage: 0,
            criteria: [
                { level: "", minMarks: 0, maxMarks: 0, description: "" },
            ],
            active: true,
        });
        setIsAddModalOpen(true);
    };

    const handleEdit = (rubric) => {
        setSelectedRubric(rubric);
        setFormData({
            code: rubric.code,
            name: rubric.name,
            description: rubric.description,
            courseOutcome: rubric.courseOutcome,
            bloomsLevel: rubric.bloomsLevel,
            totalMarks: rubric.totalMarks,
            weightage: rubric.weightage,
            criteria: [...rubric.criteria],
            active: rubric.active,
        });
        setIsEditModalOpen(true);
    };

    const handleView = (rubric) => {
        setSelectedRubric(rubric);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this rubric?")) {
            setRubrics(rubrics.filter((r) => r.id !== id));
        }
    };

    const handleToggleActive = (id) => {
        setRubrics(
            rubrics.map((r) =>
                r.id === id ? { ...r, active: !r.active } : r
            )
        );
    };

    const handleSave = () => {
        if (!formData.code || !formData.name || !formData.courseOutcome || !formData.bloomsLevel) {
            alert("Please fill in all required fields");
            return;
        }

        // Validate criteria
        if (formData.criteria.length === 0 || formData.criteria.some(c => !c.level || !c.description)) {
            alert("Please add at least one complete criteria level");
            return;
        }

        if (isEditModalOpen) {
            // Update existing rubric
            setRubrics(
                rubrics.map((r) =>
                    r.id === selectedRubric.id
                        ? { ...selectedRubric, ...formData }
                        : r
                )
            );
            setIsEditModalOpen(false);
        } else {
            // Add new rubric
            const newRubric = {
                id: Math.max(...rubrics.map((r) => r.id), 0) + 1,
                ...formData,
            };
            setRubrics([...rubrics, newRubric]);
            setIsAddModalOpen(false);
        }
    };

    const addCriteria = () => {
        setFormData({
            ...formData,
            criteria: [...formData.criteria, { level: "", minMarks: 0, maxMarks: 0, description: "" }],
        });
    };

    const removeCriteria = (index) => {
        if (formData.criteria.length > 1) {
            setFormData({
                ...formData,
                criteria: formData.criteria.filter((_, i) => i !== index),
            });
        }
    };

    const updateCriteria = (index, field, value) => {
        const newCriteria = [...formData.criteria];
        newCriteria[index][field] = field === 'minMarks' || field === 'maxMarks' ? parseInt(value) || 0 : value;
        setFormData({ ...formData, criteria: newCriteria });
    };

    return (
        <div className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Rubrics</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{totalRubrics}</p>
                        </div>
                        <div className="bg-blue-500 p-3 rounded-lg">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Active Rubrics</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{activeRubrics}</p>
                        </div>
                        <div className="bg-green-500 p-3 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Total Weightage</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{totalWeightage}%</p>
                        </div>
                        <div className="bg-purple-500 p-3 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Avg Marks</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">{avgMarks}</p>
                        </div>
                        <div className="bg-orange-500 p-3 rounded-lg">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Assessment Rubrics</h3>
                    <p className="text-sm text-gray-600 mt-1">Outcome-based evaluation criteria with Bloom's Taxonomy mapping</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    Add Rubric
                </button>
            </div>

            {/* Rubrics Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="table-header">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Rubric Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                CO
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Bloom's Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Marks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Weightage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white   tracking-wider">
                                Criteria Count
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white   tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white   tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rubrics.map((rubric) => (
                            <tr key={rubric.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono font-medium text-gray-900">{rubric.code}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{rubric.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{rubric.description.substring(0, 50)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        {rubric.courseOutcome}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBloomsColor(rubric.bloomsLevel)}`}>
                                        {rubric.bloomsLevel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-gray-900">{rubric.totalMarks}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-gray-900">{rubric.weightage}%</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {rubric.criteria.length} levels
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleToggleActive(rubric.id)}
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rubric.active
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            } transition-colors`}
                                    >
                                        {rubric.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleView(rubric)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Target size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(rubric)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(rubric.id)}
                                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* View Details Modal */}
            {isViewModalOpen && selectedRubric && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{selectedRubric.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{selectedRubric.code}</p>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <p className="text-sm text-gray-900">{selectedRubric.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Outcome</label>
                                        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                            {selectedRubric.courseOutcome}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bloom's Level</label>
                                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getBloomsColor(selectedRubric.bloomsLevel)}`}>
                                            {selectedRubric.bloomsLevel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                    <p className="text-2xl font-bold text-gray-900">{selectedRubric.totalMarks}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weightage</label>
                                    <p className="text-2xl font-bold text-gray-900">{selectedRubric.weightage}%</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${selectedRubric.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {selectedRubric.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Criteria Levels Table */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Performance Criteria & Grading Scale</label>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700  ">Level</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700  ">Marks Range</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700  ">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedRubric.criteria.map((criteria, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{criteria.level}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800">
                                                            {criteria.minMarks} - {criteria.maxMarks}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{criteria.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {isEditModalOpen ? "Edit Rubric" : "Add New Rubric"}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rubric Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., RUB-CO1-BT2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: RUB-CO#-BT#</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Outcome <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.courseOutcome}
                                        onChange={(e) => setFormData({ ...formData, courseOutcome: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select CO</option>
                                        <option value="CO1">CO1</option>
                                        <option value="CO2">CO2</option>
                                        <option value="CO3">CO3</option>
                                        <option value="CO4">CO4</option>
                                        <option value="CO5">CO5</option>
                                        <option value="CO6">CO6</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rubric Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter rubric name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="3"
                                    placeholder="Enter detailed description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bloom's Taxonomy Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.bloomsLevel}
                                    onChange={(e) => setFormData({ ...formData, bloomsLevel: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Bloom's Level</option>
                                    {BLOOMS_TAXONOMY.map((bloom) => (
                                        <option key={bloom.value} value={bloom.value}>
                                            {bloom.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Marks <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter total marks"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Weightage (%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.weightage}
                                        onChange={(e) => setFormData({ ...formData, weightage: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter weightage %"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {/* Criteria Section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Performance Criteria <span className="text-red-500">*</span>
                                    </label>
                                    <button
                                        onClick={addCriteria}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Add Criteria Level
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.criteria.map((criteria, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-sm font-medium text-gray-700">Criteria Level {index + 1}</span>
                                                {formData.criteria.length > 1 && (
                                                    <button
                                                        onClick={() => removeCriteria(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <input
                                                    type="text"
                                                    value={criteria.level}
                                                    onChange={(e) => updateCriteria(index, "level", e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Level name (e.g., Outstanding, Excellent, Good)"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="number"
                                                        value={criteria.minMarks}
                                                        onChange={(e) => updateCriteria(index, "minMarks", e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Min marks"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={criteria.maxMarks}
                                                        onChange={(e) => updateCriteria(index, "maxMarks", e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Max marks"
                                                    />
                                                </div>
                                                <textarea
                                                    value={criteria.description}
                                                    onChange={(e) => updateCriteria(index, "description", e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    rows="2"
                                                    placeholder="Description of performance at this level"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Define your own performance criteria levels based on your assessment requirements.
                                    Each level should have a unique name, marks range, and clear description of expected performance.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setIsEditModalOpen(false);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Save size={18} />
                                {isEditModalOpen ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
