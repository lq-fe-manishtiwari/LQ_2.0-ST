import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';

export default function SubjectSelectionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { configData, configId, academicYearId, semesterId, studentId } = location.state || {};

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        if (configData) {
            console.log('=== Subject Selection Page ===');
            console.log('Config Data:', configData);
            console.log('==============================');

            // Calculate time remaining
            if (configData.end_time) {
                const updateTimer = () => {
                    const endTime = new Date(configData.end_time);
                    const now = new Date();
                    const diff = endTime - now;

                    if (diff > 0) {
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        setTimeRemaining(`${hours}h ${minutes}m remaining`);
                    } else {
                        setTimeRemaining('Selection time expired');
                    }
                };

                updateTimer();
                const interval = setInterval(updateTimer, 60000); // Update every minute
                return () => clearInterval(interval);
            }
        }
    }, [configData]);

    const handleSubjectToggle = (subjectId) => {
        setSelectedSubjects(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                // Check max selections
                if (prev.length < configData.maximum_selections) {
                    return [...prev, subjectId];
                }
                return prev;
            }
        });
    };

    const handleSubmit = () => {
        if (selectedSubjects.length < configData.minimum_selections) {
            alert(`Please select at least ${configData.minimum_selections} subjects`);
            return;
        }

        console.log('Submitting selections:', selectedSubjects);
        // TODO: Call submit API
        alert('Selection submitted successfully!');
    };

    if (!configData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <p className="text-gray-600 mb-4">No configuration data available.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canSubmit = selectedSubjects.length >= configData.minimum_selections &&
        selectedSubjects.length <= configData.maximum_selections;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subject Selection</h1>
                        <p className="text-gray-600 mt-1">
                            {configData.academic_year_name} - {configData.semester_name} - {configData.subject_type_name}
                            {configData.vertical_type_name && ` - ${configData.vertical_type_name}`}
                        </p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Selection Requirements */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Requirements</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Minimum: <span className="font-semibold text-gray-900">{configData.minimum_selections}</span> subjects
                            </p>
                            <p className="text-gray-600">
                                Maximum: <span className="font-semibold text-gray-900">{configData.maximum_selections}</span> subjects
                            </p>
                            <p className="text-gray-600">
                                Selected: <span className={`font-semibold ${selectedSubjects.length >= configData.minimum_selections ? 'text-green-600' : 'text-orange-600'
                                    }`}>{selectedSubjects.length}</span> / {configData.maximum_selections}
                            </p>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Deadline</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Ends: <span className="font-semibold text-gray-900">
                                    {new Date(configData.end_time).toLocaleString()}
                                </span>
                            </p>
                            <p className={`font-semibold ${timeRemaining.includes('expired') ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                {timeRemaining}
                            </p>
                        </div>
                    </div>

                    {/* Available Subjects */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">Available</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                Total Subjects: <span className="font-semibold text-gray-900">{configData.allocated_subject_count}</span>
                            </p>
                            <p className="text-gray-600">
                                Limit per Subject: <span className="font-semibold text-gray-900">{configData.limit_per_subject_selections}</span> students
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subject Sets */}
                <div className="space-y-4">
                    {configData.subject_sets?.map((set, setIndex) => (
                        <div key={setIndex} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Set Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {set.subject_set_name}
                                    <span className="text-sm font-normal opacity-90">
                                        ({set.subjects?.length || 0} subjects)
                                    </span>
                                </h2>
                            </div>

                            {/* Subjects Grid */}
                            <div className="p-6">
                                {set.subjects && set.subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {set.subjects.map((subject) => {
                                            const isSelected = selectedSubjects.includes(subject.subject_id);

                                            return (
                                                <button
                                                    key={subject.subject_id}
                                                    onClick={() => handleSubjectToggle(subject.subject_id)}
                                                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]'
                                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {/* Selection Indicator */}
                                                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'bg-white border-gray-300'
                                                        }`}>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Subject Info */}
                                                    <div className="pr-8">
                                                        <h3 className={`font-semibold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'
                                                            }`}>
                                                            {subject.subject_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Code: {subject.subject_code}
                                                        </p>
                                                        {subject.paper_code && (
                                                            <p className="text-xs text-gray-500">
                                                                Paper: {subject.paper_code}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No subjects available in this set</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-6 mt-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                {selectedSubjects.length < configData.minimum_selections ? (
                                    <span className="text-orange-600 font-medium">
                                        ⚠️ Please select at least {configData.minimum_selections - selectedSubjects.length} more subject(s)
                                    </span>
                                ) : (
                                    <span className="text-green-600 font-medium">
                                        ✓ You have selected {selectedSubjects.length} subject(s)
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setSelectedSubjects([])}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-medium transition-all ${canSubmit
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Submit Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
